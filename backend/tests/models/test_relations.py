"""The 1-1, 1-n and n-m relations required by the course, checked against PostgreSQL."""

from datetime import date
from decimal import Decimal

import pytest
from sqlalchemy import insert, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Amenity, BookingService, Profile, Review, RoomImage
from tests.factories import make_booking, make_room, make_service, make_user

# --- 1-1 -------------------------------------------------------------------------------


def test_user_has_exactly_one_profile(db: Session) -> None:
    user = make_user(db)
    assert user.profile.user is user

    second_profile = insert(Profile).values(user_id=user.id, first_name="Second", last_name="P")
    with pytest.raises(IntegrityError, match="pk_profiles"), db.begin_nested():
        db.execute(second_profile)


def test_deleting_a_user_deletes_the_profile(db: Session) -> None:
    user = make_user(db)
    user_id = user.id

    db.delete(user)
    db.flush()

    assert db.get(Profile, user_id) is None


def test_booking_has_at_most_one_review(db: Session) -> None:
    booking = make_booking(db, user=make_user(db), room=make_room(db), check_in=date(2026, 7, 1))
    booking.review = Review(rating=5, title="Great", comment="Lovely stay.")
    db.flush()

    db.add(Review(booking_id=booking.id, rating=3, title="Again", comment="Second review."))
    with pytest.raises(IntegrityError, match="uq_reviews_booking_id"), db.begin_nested():
        db.flush()


# --- 1-n -------------------------------------------------------------------------------


def test_user_and_room_have_many_bookings(db: Session) -> None:
    user, room = make_user(db), make_room(db)
    first = make_booking(db, user=user, room=room, check_in=date(2026, 7, 1))
    second = make_booking(db, user=user, room=room, check_in=date(2026, 8, 1))
    db.expire_all()

    assert {b.id for b in user.bookings} == {first.id, second.id}
    assert {b.id for b in room.bookings} == {first.id, second.id}


def test_room_images_are_ordered_and_deleted_with_the_room(db: Session) -> None:
    room = make_room(db, images=[])
    room.images = [
        RoomImage(url="/images/b.jpg", alt_text="b", position=1),
        RoomImage(url="/images/a.jpg", alt_text="a", position=0),
    ]
    db.flush()
    db.expire_all()

    assert [image.position for image in room.images] == [0, 1]

    db.delete(room)
    db.flush()
    assert db.scalars(select(RoomImage).where(RoomImage.room_id == room.id)).all() == []


# --- n-m -------------------------------------------------------------------------------


def test_rooms_and_amenities_are_many_to_many(db: Session) -> None:
    wifi = Amenity(slug="wifi", name="Wi-Fi", icon="amenity-wifi")
    safe = Amenity(slug="safe", name="Safe", icon="amenity-safe")
    villa, suite = make_room(db), make_room(db)
    villa.amenities = [wifi, safe]
    suite.amenities = [wifi]
    db.flush()
    db.expire_all()

    assert {a.slug for a in villa.amenities} == {"wifi", "safe"}
    assert {r.id for r in wifi.rooms} == {villa.id, suite.id}


def test_booking_services_keep_the_price_paid(db: Session) -> None:
    spa = make_service(db, price=Decimal("180.00"))
    booking = make_booking(db, user=make_user(db), room=make_room(db), check_in=date(2026, 7, 1))
    booking.service_links.append(BookingService(service=spa, unit_price=spa.price, quantity=2))
    db.flush()

    spa.price = Decimal("250.00")
    db.flush()
    db.expire_all()

    line = booking.service_links[0]
    assert line.service.slug == spa.slug
    assert line.unit_price == Decimal("180.00")
    assert line.subtotal == Decimal("360.00")
    assert [link.booking_id for link in spa.booking_links] == [booking.id]
