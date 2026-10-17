from datetime import date, timedelta
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import BookingStatus, Review
from tests.factories import make_amenity, make_booking, make_room, make_service, make_user

TODAY = date.today()


def slugs(response) -> list[str]:
    assert response.status_code == 200, response.text
    return [room["slug"] for room in response.json()["items"]]


def test_list_shows_active_rooms_with_pagination(client: TestClient, db: Session) -> None:
    for n in range(3):
        make_room(db, slug=f"suite-{n}")
    make_room(db, slug="closed-suite", is_active=False)

    response = client.get("/api/v1/rooms", params={"size": 2})

    body = response.json()
    assert body["total"] == 3
    assert body["pages"] == 2
    assert len(body["items"]) == 2
    assert "closed-suite" not in slugs(client.get("/api/v1/rooms"))


def test_date_search_hides_rooms_that_are_booked(client: TestClient, db: Session) -> None:
    booked, free = make_room(db, slug="booked"), make_room(db, slug="free")
    check_in = TODAY + timedelta(days=10)
    make_booking(db, user=make_user(db), room=booked, check_in=check_in, nights=4)
    cancelled = make_room(db, slug="cancelled-only")
    make_booking(
        db,
        user=make_user(db),
        room=cancelled,
        check_in=check_in,
        status=BookingStatus.CANCELLED,
    )

    params = {
        "check_in": str(check_in + timedelta(days=1)),
        "check_out": str(check_in + timedelta(days=3)),
    }
    found = slugs(client.get("/api/v1/rooms", params=params))

    assert "booked" not in found
    assert {"free", "cancelled-only"} <= set(found)
    assert free.slug in found


def test_filters_by_guests_price_and_amenities(client: TestClient, db: Session) -> None:
    wifi, safe = make_amenity(db, "wifi"), make_amenity(db, "safe")
    make_room(db, slug="small", max_guests=2, price_per_night=Decimal("150"), amenities=[wifi])
    make_room(
        db, slug="family", max_guests=5, price_per_night=Decimal("400"), amenities=[wifi, safe]
    )
    make_room(db, slug="villa", max_guests=6, price_per_night=Decimal("900"), amenities=[safe])

    assert set(slugs(client.get("/api/v1/rooms", params={"guests": 5}))) == {"family", "villa"}
    assert slugs(client.get("/api/v1/rooms", params={"max_price": 500, "sort": "price_desc"})) == [
        "family",
        "small",
    ]
    both = client.get("/api/v1/rooms", params=[("amenities", "wifi"), ("amenities", "safe")])
    assert slugs(both) == ["family"]


def test_search_rejects_invalid_ranges(client: TestClient) -> None:
    only_one_date = client.get("/api/v1/rooms", params={"check_in": str(TODAY)})
    reversed_dates = client.get(
        "/api/v1/rooms", params={"check_in": str(TODAY), "check_out": str(TODAY)}
    )
    reversed_prices = client.get("/api/v1/rooms", params={"min_price": 500, "max_price": 100})

    assert only_one_date.status_code == reversed_dates.status_code == 422
    assert reversed_prices.status_code == 422


def test_room_detail_includes_photos_amenities_and_rating(client: TestClient, db: Session) -> None:
    room = make_room(db, slug="garden-suite", amenities=[make_amenity(db, "minibar")])
    for rating in (4, 5):
        booking = make_booking(
            db, user=make_user(db), room=room, check_in=TODAY - timedelta(days=30 + rating * 5)
        )
        booking.review = Review(rating=rating, title="Lovely", comment="We loved the garden.")
    db.flush()

    body = client.get("/api/v1/rooms/garden-suite").json()

    assert body["cover_image"] == body["images"][0]["url"]
    assert [a["slug"] for a in body["amenities"]] == ["minibar"]
    assert body["rating"] == {"average": 4.5, "count": 2}
    assert client.get("/api/v1/rooms/missing").json()["code"] == "room_not_found"


def test_availability_lists_only_active_bookings_in_range(client: TestClient, db: Session) -> None:
    room = make_room(db, slug="villa")
    start = TODAY + timedelta(days=5)
    make_booking(db, user=make_user(db), room=room, check_in=start, nights=2)
    make_booking(
        db,
        user=make_user(db),
        room=room,
        check_in=start + timedelta(days=10),
        status=BookingStatus.CANCELLED,
    )
    make_booking(db, user=make_user(db), room=room, check_in=start + timedelta(days=200))

    body = client.get("/api/v1/rooms/villa/availability").json()

    assert body["booked"] == [{"check_in": str(start), "check_out": str(start + timedelta(days=2))}]


def test_reviews_show_author_initial(client: TestClient, db: Session) -> None:
    room = make_room(db, slug="suite")
    booking = make_booking(db, user=make_user(db), room=room, check_in=TODAY - timedelta(days=20))
    booking.review = Review(rating=5, title="Perfect", comment="Would come back anytime.")
    db.flush()

    review = client.get("/api/v1/rooms/suite/reviews").json()["items"][0]

    assert review["author_name"].startswith("Test G")
    assert review["rating"] == 5


def test_catalog_lists_amenities_and_active_services(client: TestClient, db: Session) -> None:
    make_amenity(db, "wifi")
    make_service(db, slug="spa")
    make_service(db, slug="retired", is_active=False)

    assert [a["slug"] for a in client.get("/api/v1/amenities").json()] == ["wifi"]
    services = [s["slug"] for s in client.get("/api/v1/services").json()]
    assert "retired" not in services
