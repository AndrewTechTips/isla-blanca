"""Business rules enforced by the database itself, so no code path can bypass them."""

from datetime import date
from decimal import Decimal

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Booking, BookingStatus, Review
from tests.factories import make_booking, make_room, make_user


def assert_rejected(db: Session, constraint: str) -> None:
    with pytest.raises(IntegrityError, match=constraint), db.begin_nested():
        db.flush()


def test_room_cannot_be_double_booked(db: Session) -> None:
    room = make_room(db)
    make_booking(db, user=make_user(db), room=room, check_in=date(2026, 7, 1), nights=5)

    db.add(
        Booking(
            user=make_user(db),
            room=room,
            check_in=date(2026, 7, 3),
            check_out=date(2026, 7, 8),
            adults=1,
            total_price=Decimal("600.00"),
        )
    )
    assert_rejected(db, "ex_bookings_no_overlapping_stays")


def test_back_to_back_stays_are_allowed(db: Session) -> None:
    room = make_room(db)
    make_booking(db, user=make_user(db), room=room, check_in=date(2026, 7, 1), nights=3)

    # Checkout on the 4th, next guest checks in on the 4th.
    make_booking(db, user=make_user(db), room=room, check_in=date(2026, 7, 4), nights=3)


def test_cancelled_booking_frees_the_room(db: Session) -> None:
    room = make_room(db)
    make_booking(
        db,
        user=make_user(db),
        room=room,
        check_in=date(2026, 7, 1),
        status=BookingStatus.CANCELLED,
    )

    make_booking(db, user=make_user(db), room=room, check_in=date(2026, 7, 1))


def test_same_dates_in_different_rooms_are_allowed(db: Session) -> None:
    user = make_user(db)
    make_booking(db, user=user, room=make_room(db), check_in=date(2026, 7, 1))
    make_booking(db, user=user, room=make_room(db), check_in=date(2026, 7, 1))


def test_check_out_must_be_after_check_in(db: Session) -> None:
    db.add(
        Booking(
            user=make_user(db),
            room=make_room(db),
            check_in=date(2026, 7, 5),
            check_out=date(2026, 7, 5),
            adults=1,
            total_price=Decimal("0"),
        )
    )
    assert_rejected(db, "ck_bookings_dates_ordered")


def test_booking_needs_an_adult(db: Session) -> None:
    booking = make_booking(db, user=make_user(db), room=make_room(db), check_in=date(2026, 7, 1))
    booking.adults = 0
    assert_rejected(db, "ck_bookings_at_least_one_adult")


@pytest.mark.parametrize("rating", [0, 6])
def test_review_rating_is_between_1_and_5(db: Session, rating: int) -> None:
    booking = make_booking(db, user=make_user(db), room=make_room(db), check_in=date(2026, 7, 1))
    booking.review = Review(rating=rating, title="Hmm", comment="Out of range.")
    assert_rejected(db, "ck_reviews_rating_range")


def test_email_is_unique(db: Session) -> None:
    make_user(db, email="same@islablanca.test")
    with pytest.raises(IntegrityError, match="uq_users_email"), db.begin_nested():
        make_user(db, email="same@islablanca.test")


def test_email_is_stored_lowercase(db: Session) -> None:
    with pytest.raises(IntegrityError, match="ck_users_email_lowercase"), db.begin_nested():
        make_user(db, email="Mixed@IslaBlanca.test")


def test_room_price_must_be_positive(db: Session) -> None:
    room = make_room(db)
    room.price_per_night = Decimal("0")
    assert_rejected(db, "ck_rooms_price_positive")


def test_room_with_bookings_cannot_be_deleted(db: Session) -> None:
    room = make_room(db)
    make_booking(db, user=make_user(db), room=room, check_in=date(2026, 7, 1))
    db.expunge_all()

    db.delete(db.get(type(room), room.id))
    assert_rejected(db, "fk_bookings_room_id_rooms")
