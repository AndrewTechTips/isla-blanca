from datetime import date, timedelta
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import BookingStatus, MembershipTier
from app.services.membership import earned_tier
from tests.factories import auth_headers, make_admin, make_booking, make_room, make_user

TODAY = date.today()


def stay(room_id: int, nights: int = 4) -> dict:
    check_in = TODAY + timedelta(days=20)
    return {
        "room_id": room_id,
        "check_in": str(check_in),
        "check_out": str(check_in + timedelta(days=nights)),
        "adults": 2,
    }


def test_tiers_are_public_and_ordered(client: TestClient) -> None:
    tiers = client.get("/api/v1/membership/tiers").json()

    assert [t["tier"] for t in tiers] == ["silver", "gold", "platinum"]
    assert [t["min_nights"] for t in tiers] == [0, 7, 20]
    assert [t["discount_percent"] for t in tiers] == [5, 10, 15]


def test_nights_earn_tiers() -> None:
    assert earned_tier(0) == MembershipTier.SILVER
    assert earned_tier(6) == MembershipTier.SILVER
    assert earned_tier(7) == MembershipTier.GOLD
    assert earned_tier(19) == MembershipTier.GOLD
    assert earned_tier(20) == MembershipTier.PLATINUM


def test_quote_gives_signed_in_members_their_discount(client: TestClient, db: Session) -> None:
    room = make_room(db, price_per_night=Decimal("200.00"))
    gold = make_user(db)
    gold.profile.membership_tier = MembershipTier.GOLD
    db.commit()

    anonymous = client.post("/api/v1/bookings/quote", json=stay(room.id)).json()
    member = client.post(
        "/api/v1/bookings/quote", json=stay(room.id), headers=auth_headers(gold)
    ).json()

    assert anonymous["member_tier"] is None
    assert Decimal(anonymous["member_discount"]) == 0
    assert Decimal(anonymous["total"]) == Decimal("800.00")
    assert member["member_tier"] == "gold"
    assert Decimal(member["member_discount"]) == Decimal("80.00")
    assert Decimal(member["total"]) == Decimal("720.00")


def test_my_membership_shows_progress(client: TestClient, db: Session) -> None:
    guest, room = make_user(db), make_room(db)
    make_booking(
        db,
        user=guest,
        room=room,
        check_in=TODAY - timedelta(days=30),
        nights=5,
        status=BookingStatus.COMPLETED,
    )
    # Cancelled and upcoming stays don't count.
    make_booking(
        db,
        user=guest,
        room=room,
        check_in=TODAY - timedelta(days=60),
        nights=9,
        status=BookingStatus.CANCELLED,
    )
    make_booking(db, user=guest, room=room, check_in=TODAY + timedelta(days=10), nights=9)

    card = client.get("/api/v1/membership/me", headers=auth_headers(guest)).json()

    assert card["tier"] == "silver"
    assert card["completed_nights"] == 5
    assert card["next_tier"] == "gold"
    assert card["nights_to_next"] == 2
    assert card["member_name"] == guest.profile.full_name
    assert card["member_number"] == f"{TODAY:%Y}{guest.id:04d}"
    assert client.get("/api/v1/membership/me").status_code == 401


def test_completing_a_stay_moves_the_guest_up(client: TestClient, db: Session) -> None:
    guest, room = make_user(db), make_room(db)
    make_booking(
        db,
        user=guest,
        room=room,
        check_in=TODAY - timedelta(days=40),
        nights=4,
        status=BookingStatus.COMPLETED,
    )
    latest = make_booking(db, user=guest, room=room, check_in=TODAY - timedelta(days=5), nights=3)

    response = client.patch(
        f"/api/v1/admin/bookings/{latest.reference}",
        json={"status": "completed"},
        headers=auth_headers(make_admin(db)),
    )

    assert response.status_code == 200, response.text
    card = client.get("/api/v1/membership/me", headers=auth_headers(guest)).json()
    assert card["tier"] == "gold"
    assert card["next_tier"] == "platinum"
    assert card["nights_to_next"] == 13


def test_tiers_never_drop_on_their_own(client: TestClient, db: Session) -> None:
    guest, room = make_user(db), make_room(db)
    guest.profile.membership_tier = MembershipTier.PLATINUM
    db.commit()
    booking = make_booking(db, user=guest, room=room, check_in=TODAY - timedelta(days=5), nights=2)

    client.patch(
        f"/api/v1/admin/bookings/{booking.reference}",
        json={"status": "completed"},
        headers=auth_headers(make_admin(db)),
    )

    card = client.get("/api/v1/membership/me", headers=auth_headers(guest)).json()
    assert card["tier"] == "platinum"
    assert card["next_tier"] is None
    assert card["nights_to_next"] is None


def test_staff_set_a_tier(client: TestClient, db: Session) -> None:
    guest = make_user(db)
    admin = auth_headers(make_admin(db))

    updated = client.put(
        f"/api/v1/admin/users/{guest.id}/membership", json={"tier": "gold"}, headers=admin
    )
    unknown = client.put(
        "/api/v1/admin/users/999999/membership", json={"tier": "gold"}, headers=admin
    )

    assert updated.status_code == 200, updated.text
    assert updated.json()["profile"]["membership_tier"] == "gold"
    assert unknown.status_code == 404
