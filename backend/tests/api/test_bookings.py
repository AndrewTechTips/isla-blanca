from datetime import date, timedelta
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import BookingStatus, PricingUnit
from tests.factories import (
    auth_headers,
    make_admin,
    make_booking,
    make_room,
    make_service,
    make_user,
)

TODAY = date.today()
CHECK_IN = TODAY + timedelta(days=20)


def stay(room_id: int, nights: int = 3, **extra) -> dict:
    return {
        "room_id": room_id,
        "check_in": str(CHECK_IN),
        "check_out": str(CHECK_IN + timedelta(days=nights)),
        "adults": 2,
        **extra,
    }


# --- Quote -----------------------------------------------------------------------------------


def test_quote_prices_room_and_services_by_unit(client: TestClient, db: Session) -> None:
    room = make_room(db, price_per_night=Decimal("300.00"))
    breakfast = make_service(db, price=Decimal("40.00"), pricing_unit=PricingUnit.PER_NIGHT)
    spa = make_service(db, price=Decimal("100.00"), pricing_unit=PricingUnit.PER_GUEST)
    transfer = make_service(db, price=Decimal("90.00"), pricing_unit=PricingUnit.PER_STAY)

    response = client.post(
        "/api/v1/bookings/quote",
        json=stay(
            room.id,
            services=[
                {"service_id": breakfast.id},
                {"service_id": spa.id},
                {"service_id": transfer.id, "quantity": 2},
            ],
        ),
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["nights"] == 3
    assert Decimal(body["room_total"]) == Decimal("900.00")
    assert [line["quantity"] for line in body["services"]] == [3, 2, 2]
    # 900 + 40×3 + 100×2 + 90×2
    assert Decimal(body["total"]) == Decimal("1400.00")


def test_quote_checks_capacity_and_input(client: TestClient, db: Session) -> None:
    room = make_room(db, max_guests=2)

    too_many = client.post("/api/v1/bookings/quote", json=stay(room.id, children=1))
    too_long = client.post("/api/v1/bookings/quote", json=stay(room.id, nights=31))
    duplicate = client.post(
        "/api/v1/bookings/quote",
        json=stay(room.id, services=[{"service_id": 1}, {"service_id": 1}]),
    )

    assert too_many.status_code == 422
    assert too_many.json()["code"] == "too_many_guests"
    assert too_long.status_code == duplicate.status_code == 422


# --- Create ----------------------------------------------------------------------------------


def test_guest_books_a_room(client: TestClient, db: Session) -> None:
    user = make_user(db)
    room = make_room(db, price_per_night=Decimal("250.00"))
    spa = make_service(db, price=Decimal("120.00"), pricing_unit=PricingUnit.PER_GUEST)

    response = client.post(
        "/api/v1/bookings",
        json=stay(room.id, services=[{"service_id": spa.id}], special_requests="Late arrival"),
        headers=auth_headers(user),
    )

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["reference"].startswith("IB-")
    assert body["status"] == "confirmed"
    assert Decimal(body["total_price"]) == Decimal("990.00")  # 250×3 + 120×2
    assert body["room"]["id"] == room.id
    assert body["services"][0]["service"]["id"] == spa.id
    assert body["can_cancel"] is True
    assert body["can_review"] is False


def test_booking_requires_sign_in(client: TestClient, db: Session) -> None:
    assert client.post("/api/v1/bookings", json=stay(make_room(db).id)).status_code == 401


def test_overlapping_booking_is_rejected(client: TestClient, db: Session) -> None:
    room = make_room(db)
    make_booking(db, user=make_user(db), room=room, check_in=CHECK_IN + timedelta(days=1))

    response = client.post(
        "/api/v1/bookings", json=stay(room.id), headers=auth_headers(make_user(db))
    )

    assert response.status_code == 409
    assert response.json()["code"] == "room_unavailable"


def test_cannot_book_in_the_past_or_an_inactive_room(client: TestClient, db: Session) -> None:
    headers = auth_headers(make_user(db))
    past = stay(make_room(db).id) | {
        "check_in": str(TODAY - timedelta(days=2)),
        "check_out": str(TODAY + timedelta(days=1)),
    }
    closed = make_room(db, is_active=False)

    assert client.post("/api/v1/bookings", json=past, headers=headers).json()["code"] == (
        "check_in_in_past"
    )
    assert client.post("/api/v1/bookings", json=stay(closed.id), headers=headers).status_code == 404


def test_inactive_service_cannot_be_booked(client: TestClient, db: Session) -> None:
    retired = make_service(db, is_active=False)

    response = client.post(
        "/api/v1/bookings",
        json=stay(make_room(db).id, services=[{"service_id": retired.id}]),
        headers=auth_headers(make_user(db)),
    )

    assert response.status_code == 404
    assert response.json()["code"] == "service_not_found"


# --- Read ------------------------------------------------------------------------------------


def test_guests_see_only_their_own_bookings(client: TestClient, db: Session) -> None:
    sofia, daniel = make_user(db), make_user(db)
    mine = make_booking(db, user=sofia, room=make_room(db), check_in=CHECK_IN)
    theirs = make_booking(db, user=daniel, room=make_room(db), check_in=CHECK_IN)

    listed = client.get("/api/v1/bookings", headers=auth_headers(sofia)).json()
    assert [b["reference"] for b in listed["items"]] == [mine.reference]

    own = client.get(f"/api/v1/bookings/{mine.reference}", headers=auth_headers(sofia))
    other = client.get(f"/api/v1/bookings/{theirs.reference}", headers=auth_headers(sofia))
    assert own.status_code == 200
    assert other.status_code == 404

    staff = client.get(f"/api/v1/bookings/{theirs.reference}", headers=auth_headers(make_admin(db)))
    assert staff.status_code == 200


# --- Cancel ----------------------------------------------------------------------------------


def test_guest_cancels_a_future_booking_and_frees_the_room(client: TestClient, db: Session) -> None:
    user, room = make_user(db), make_room(db)
    booking = make_booking(db, user=user, room=room, check_in=CHECK_IN)

    response = client.post(
        f"/api/v1/bookings/{booking.reference}/cancel", headers=auth_headers(user)
    )

    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"
    rebook = client.post(
        "/api/v1/bookings",
        json=stay(room.id) | {"check_in": str(CHECK_IN), "check_out": str(booking.check_out)},
        headers=auth_headers(make_user(db)),
    )
    assert rebook.status_code == 201


def test_past_or_cancelled_bookings_cannot_be_cancelled(client: TestClient, db: Session) -> None:
    user = make_user(db)
    past = make_booking(db, user=user, room=make_room(db), check_in=TODAY - timedelta(days=10))
    cancelled = make_booking(
        db, user=user, room=make_room(db), check_in=CHECK_IN, status=BookingStatus.CANCELLED
    )

    for booking in (past, cancelled):
        response = client.post(
            f"/api/v1/bookings/{booking.reference}/cancel", headers=auth_headers(user)
        )
        assert response.status_code == 422
        assert response.json()["code"] == "booking_not_cancellable"


# --- Review ----------------------------------------------------------------------------------

REVIEW = {"rating": 5, "title": "Magical", "comment": "The sunset terrace was unforgettable."}


def test_guest_reviews_a_finished_stay_once(client: TestClient, db: Session) -> None:
    user = make_user(db)
    booking = make_booking(
        db,
        user=user,
        room=make_room(db),
        check_in=TODAY - timedelta(days=10),
        status=BookingStatus.COMPLETED,
    )
    url = f"/api/v1/bookings/{booking.reference}/review"

    first = client.post(url, json=REVIEW, headers=auth_headers(user))
    second = client.post(url, json=REVIEW, headers=auth_headers(user))

    assert first.status_code == 201
    assert first.json()["review"]["rating"] == 5
    assert first.json()["can_review"] is False
    assert second.status_code == 409


def test_cannot_review_future_cancelled_or_someone_elses_stay(
    client: TestClient, db: Session
) -> None:
    user = make_user(db)
    future = make_booking(db, user=user, room=make_room(db), check_in=CHECK_IN)
    cancelled = make_booking(
        db,
        user=user,
        room=make_room(db),
        check_in=TODAY - timedelta(days=10),
        status=BookingStatus.CANCELLED,
    )
    other = make_booking(
        db, user=make_user(db), room=make_room(db), check_in=TODAY - timedelta(days=10)
    )

    def review(booking) -> int:
        url = f"/api/v1/bookings/{booking.reference}/review"
        return client.post(url, json=REVIEW, headers=auth_headers(user)).status_code

    assert review(future) == 422
    assert review(cancelled) == 422
    assert review(other) == 404


def test_review_input_is_validated(client: TestClient, db: Session) -> None:
    user = make_user(db)
    booking = make_booking(db, user=user, room=make_room(db), check_in=TODAY - timedelta(days=9))

    response = client.post(
        f"/api/v1/bookings/{booking.reference}/review",
        json={"rating": 6, "title": "x", "comment": "short"},
        headers=auth_headers(user),
    )

    assert response.status_code == 422
    assert {error["loc"][-1] for error in response.json()["detail"]} == {
        "rating",
        "title",
        "comment",
    }


def test_simultaneous_booking_is_stopped_by_the_database(
    client: TestClient, db: Session, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Two guests pass the availability check at the same moment: PostgreSQL decides."""
    room = make_room(db)
    make_booking(db, user=make_user(db), room=room, check_in=CHECK_IN)
    monkeypatch.setattr("app.services.bookings.is_available", lambda *args: True)

    response = client.post(
        "/api/v1/bookings", json=stay(room.id), headers=auth_headers(make_user(db))
    )

    assert response.status_code == 409
    assert response.json()["code"] == "room_unavailable"
