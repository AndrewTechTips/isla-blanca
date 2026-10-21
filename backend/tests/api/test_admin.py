from datetime import date, timedelta
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import BookingStatus
from tests.factories import (
    auth_headers,
    make_admin,
    make_amenity,
    make_booking,
    make_room,
    make_service,
    make_user,
)

TODAY = date.today()

NEW_ROOM = {
    "slug": "cliff-top-villa",
    "name": "Cliff Top Villa",
    "tagline": "Above the cove.",
    "description": "A villa on the cliff with a private pool.",
    "price_per_night": "799.00",
    "size_m2": 130,
    "bed_type": "king",
    "max_guests": 4,
    "images": [
        {"url": "/images/rooms/cliff-1.jpg", "alt_text": "Pool"},
        {"url": "/images/rooms/cliff-2.jpg", "alt_text": "Bedroom"},
    ],
}


@pytest.fixture
def admin_headers(db: Session) -> dict[str, str]:
    return auth_headers(make_admin(db))


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("get", "/api/v1/admin/stats"),
        ("get", "/api/v1/admin/bookings"),
        ("get", "/api/v1/admin/users"),
        ("post", "/api/v1/admin/rooms"),
        ("delete", "/api/v1/admin/services/1"),
        ("put", "/api/v1/admin/users/1/membership"),
    ],
)
def test_admin_routes_reject_guests_and_anonymous(
    client: TestClient, db: Session, method: str, path: str
) -> None:
    guest = auth_headers(make_user(db))

    assert client.request(method, path).status_code == 401
    assert client.request(method, path, headers=guest).status_code == 403


# --- Rooms -----------------------------------------------------------------------------------


def test_admin_creates_updates_and_deletes_a_room(
    client: TestClient, db: Session, admin_headers: dict[str, str]
) -> None:
    wifi, safe = make_amenity(db, "wifi"), make_amenity(db, "safe")

    created = client.post(
        "/api/v1/admin/rooms", json=NEW_ROOM | {"amenity_ids": [wifi.id]}, headers=admin_headers
    )
    assert created.status_code == 201, created.text
    room = created.json()
    assert [image["position"] for image in room["images"]] == [0, 1]
    assert room["cover_image"] == "/images/rooms/cliff-1.jpg"

    updated = client.patch(
        f"/api/v1/admin/rooms/{room['id']}",
        json={
            "price_per_night": "850.00",
            "amenity_ids": [wifi.id, safe.id],
            "images": [{"url": "/images/rooms/cliff-3.jpg", "alt_text": "Terrace"}],
        },
        headers=admin_headers,
    )
    assert updated.status_code == 200, updated.text
    body = updated.json()
    assert Decimal(body["price_per_night"]) == Decimal("850.00")
    assert {a["slug"] for a in body["amenities"]} == {"wifi", "safe"}
    assert [image["url"] for image in body["images"]] == ["/images/rooms/cliff-3.jpg"]
    assert body["name"] == NEW_ROOM["name"]

    deleted = client.delete(f"/api/v1/admin/rooms/{room['id']}", headers=admin_headers)
    assert deleted.status_code == 204
    assert client.get(f"/api/v1/rooms/{NEW_ROOM['slug']}").status_code == 404


def test_room_rules_for_admins(
    client: TestClient, db: Session, admin_headers: dict[str, str]
) -> None:
    booked = make_room(db, slug="booked-room")
    make_booking(db, user=make_user(db), room=booked, check_in=TODAY + timedelta(days=5))

    duplicate = client.post(
        "/api/v1/admin/rooms", json=NEW_ROOM | {"slug": "booked-room"}, headers=admin_headers
    )
    unknown_amenity = client.post(
        "/api/v1/admin/rooms", json=NEW_ROOM | {"amenity_ids": [999999]}, headers=admin_headers
    )
    delete_booked = client.delete(f"/api/v1/admin/rooms/{booked.id}", headers=admin_headers)
    deactivate = client.patch(
        f"/api/v1/admin/rooms/{booked.id}", json={"is_active": False}, headers=admin_headers
    )

    assert duplicate.status_code == 409
    assert unknown_amenity.status_code == 404
    assert delete_booked.json()["code"] == "room_in_use"
    assert deactivate.json()["is_active"] is False
    assert client.get("/api/v1/rooms/booked-room").status_code == 404
    listed = client.get("/api/v1/admin/rooms", headers=admin_headers).json()
    assert "booked-room" in [room["slug"] for room in listed]


# --- Services and amenities ------------------------------------------------------------------


def test_admin_manages_services(
    client: TestClient, db: Session, admin_headers: dict[str, str]
) -> None:
    created = client.post(
        "/api/v1/admin/services",
        json={
            "slug": "sunrise-yoga",
            "name": "Sunrise Yoga",
            "description": "Yoga on the beach at dawn.",
            "price": "35.00",
            "pricing_unit": "per_guest",
        },
        headers=admin_headers,
    )
    assert created.status_code == 201, created.text
    service_id = created.json()["id"]

    hidden = client.patch(
        f"/api/v1/admin/services/{service_id}", json={"is_active": False}, headers=admin_headers
    )
    assert hidden.json()["is_active"] is False
    assert service_id not in [s["id"] for s in client.get("/api/v1/services").json()]
    assert service_id in [
        s["id"] for s in client.get("/api/v1/admin/services", headers=admin_headers).json()
    ]
    assert (
        client.delete(f"/api/v1/admin/services/{service_id}", headers=admin_headers).status_code
        == 204
    )


def test_booked_service_cannot_be_deleted(
    client: TestClient, db: Session, admin_headers: dict[str, str]
) -> None:
    user, room = make_user(db), make_room(db)
    spa = make_service(db)
    booking = client.post(
        "/api/v1/bookings",
        json={
            "room_id": room.id,
            "check_in": str(TODAY + timedelta(days=3)),
            "check_out": str(TODAY + timedelta(days=5)),
            "adults": 1,
            "services": [{"service_id": spa.id}],
        },
        headers=auth_headers(user),
    )
    assert booking.status_code == 201

    response = client.delete(f"/api/v1/admin/services/{spa.id}", headers=admin_headers)

    assert response.status_code == 409
    assert response.json()["code"] == "service_in_use"


def test_admin_manages_amenities(
    client: TestClient, db: Session, admin_headers: dict[str, str]
) -> None:
    room = make_room(db, slug="with-tv")
    created = client.post(
        "/api/v1/admin/amenities",
        json={"slug": "smart-tv", "name": "Smart TV", "icon": "amenity-tv"},
        headers=admin_headers,
    ).json()
    client.patch(
        f"/api/v1/admin/rooms/{room.id}",
        json={"amenity_ids": [created["id"]]},
        headers=admin_headers,
    )

    renamed = client.patch(
        f"/api/v1/admin/amenities/{created['id']}", json={"name": "4K TV"}, headers=admin_headers
    )
    assert renamed.json()["name"] == "4K TV"

    assert (
        client.delete(f"/api/v1/admin/amenities/{created['id']}", headers=admin_headers).status_code
        == 204
    )
    assert client.get("/api/v1/rooms/with-tv").json()["amenities"] == []


# --- Bookings and stats ----------------------------------------------------------------------


def test_admin_lists_and_filters_bookings(
    client: TestClient, db: Session, admin_headers: dict[str, str]
) -> None:
    sofia = make_user(db, email="sofia@islablanca.test")
    room = make_room(db)
    make_booking(db, user=sofia, room=room, check_in=TODAY + timedelta(days=3))
    make_booking(
        db,
        user=make_user(db),
        room=make_room(db),
        check_in=TODAY + timedelta(days=3),
        status=BookingStatus.CANCELLED,
    )

    everything = client.get("/api/v1/admin/bookings", headers=admin_headers).json()
    cancelled = client.get(
        "/api/v1/admin/bookings", params={"status": "cancelled"}, headers=admin_headers
    ).json()
    by_guest = client.get(
        "/api/v1/admin/bookings", params={"guest_email": "sofia"}, headers=admin_headers
    ).json()

    assert everything["total"] == 2
    assert [b["status"] for b in cancelled["items"]] == ["cancelled"]
    assert by_guest["items"][0]["guest"]["email"] == "sofia@islablanca.test"


@pytest.mark.parametrize(
    ("start", "target", "allowed"),
    [
        (BookingStatus.PENDING, BookingStatus.CONFIRMED, True),
        (BookingStatus.CONFIRMED, BookingStatus.COMPLETED, True),
        (BookingStatus.CONFIRMED, BookingStatus.CANCELLED, True),
        (BookingStatus.CANCELLED, BookingStatus.CONFIRMED, False),
        (BookingStatus.COMPLETED, BookingStatus.PENDING, False),
    ],
)
def test_booking_status_transitions(
    client: TestClient,
    db: Session,
    admin_headers: dict[str, str],
    start: BookingStatus,
    target: BookingStatus,
    allowed: bool,
) -> None:
    booking = make_booking(
        db, user=make_user(db), room=make_room(db), check_in=TODAY + timedelta(days=2), status=start
    )

    response = client.patch(
        f"/api/v1/admin/bookings/{booking.reference}",
        json={"status": target},
        headers=admin_headers,
    )

    if allowed:
        assert response.status_code == 200
        assert response.json()["status"] == target
    else:
        assert response.status_code == 422
        assert response.json()["code"] == "invalid_status_change"


def test_dashboard_stats(client: TestClient, db: Session, admin_headers: dict[str, str]) -> None:
    room = make_room(db, price_per_night=Decimal("100.00"))
    make_booking(db, user=make_user(db), room=room, check_in=TODAY + timedelta(days=1), nights=3)
    make_booking(
        db,
        user=make_user(db),
        room=make_room(db),
        check_in=TODAY + timedelta(days=1),
        status=BookingStatus.CANCELLED,
    )

    stats = client.get("/api/v1/admin/stats", headers=admin_headers).json()

    assert stats["total_guests"] == 2
    assert stats["total_rooms"] == stats["active_rooms"] == 2
    assert stats["bookings_by_status"] == {
        "pending": 0,
        "confirmed": 1,
        "cancelled": 1,
        "completed": 0,
    }
    assert Decimal(stats["revenue_total"]) == Decimal("300.00")
    assert stats["upcoming_check_ins"] == 1
    # 3 booked nights out of 2 rooms × 30 days
    assert stats["occupancy_next_30_days"] == 0.05
    assert stats["top_rooms"][0]["room"]["id"] == room.id
