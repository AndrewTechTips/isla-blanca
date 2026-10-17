"""Small builders for test data. Each returns an object already added to the session."""

from datetime import date, timedelta
from decimal import Decimal
from itertools import count

from sqlalchemy.orm import Session

from app.models import BedType, Booking, BookingStatus, PricingUnit, Profile, Room, Service, User

_sequence = count(1)


def make_user(db: Session, **overrides) -> User:
    n = next(_sequence)
    user = User(
        email=overrides.pop("email", f"guest{n}@islablanca.test"),
        password_hash="not-a-real-hash",
        profile=Profile(first_name="Test", last_name=f"Guest {n}"),
        **overrides,
    )
    db.add(user)
    db.flush()
    return user


def make_room(db: Session, **overrides) -> Room:
    n = next(_sequence)
    room = Room(
        slug=overrides.pop("slug", f"room-{n}"),
        name=f"Room {n}",
        tagline="A test room.",
        description="A room used in tests.",
        price_per_night=overrides.pop("price_per_night", Decimal("200.00")),
        size_m2=40,
        bed_type=BedType.QUEEN,
        max_guests=2,
        **overrides,
    )
    db.add(room)
    db.flush()
    return room


def make_service(db: Session, **overrides) -> Service:
    n = next(_sequence)
    service = Service(
        slug=f"service-{n}",
        name=f"Service {n}",
        description="A service used in tests.",
        price=overrides.pop("price", Decimal("50.00")),
        pricing_unit=overrides.pop("pricing_unit", PricingUnit.PER_STAY),
        **overrides,
    )
    db.add(service)
    db.flush()
    return service


def make_booking(
    db: Session,
    *,
    user: User,
    room: Room,
    check_in: date,
    nights: int = 3,
    status: BookingStatus = BookingStatus.CONFIRMED,
) -> Booking:
    booking = Booking(
        user=user,
        room=room,
        check_in=check_in,
        check_out=check_in + timedelta(days=nights),
        adults=2,
        status=status,
        total_price=room.price_per_night * nights,
    )
    db.add(booking)
    db.flush()
    return booking
