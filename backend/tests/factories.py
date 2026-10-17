"""Small builders for test data.

Each builder commits. Inside the test transaction a commit only releases a savepoint, so the
data still disappears after the test, but survives rollbacks done by the code under test.
"""

from datetime import date, timedelta
from decimal import Decimal
from itertools import count

from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password
from app.models import (
    Amenity,
    BedType,
    Booking,
    BookingStatus,
    PricingUnit,
    Profile,
    Room,
    RoomImage,
    Service,
    User,
    UserRole,
)

TEST_PASSWORD = "correct-horse-battery"

_sequence = count(1)


def make_user(db: Session, **overrides) -> User:
    n = next(_sequence)
    password = overrides.pop("password", None)
    user = User(
        email=overrides.pop("email", f"guest{n}@islablanca.test"),
        password_hash=hash_password(password) if password else "not-a-real-hash",
        profile=Profile(first_name="Test", last_name=f"Guest {n}"),
        **overrides,
    )
    db.add(user)
    db.commit()
    return user


def make_admin(db: Session) -> User:
    return make_user(db, role=UserRole.ADMIN)


def auth_headers(user: User) -> dict[str, str]:
    token, _ = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}


def make_amenity(db: Session, slug: str) -> Amenity:
    amenity = Amenity(slug=slug, name=slug.replace("-", " ").title(), icon=f"amenity-{slug}")
    db.add(amenity)
    db.commit()
    return amenity


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
        max_guests=overrides.pop("max_guests", 2),
        images=overrides.pop(
            "images",
            [RoomImage(url=f"/images/rooms/room-{n}.jpg", alt_text=f"Room {n}", position=0)],
        ),
        **overrides,
    )
    db.add(room)
    db.commit()
    return room


def make_service(db: Session, **overrides) -> Service:
    n = next(_sequence)
    service = Service(
        slug=overrides.pop("slug", f"service-{n}"),
        name=f"Service {n}",
        description="A service used in tests.",
        price=overrides.pop("price", Decimal("50.00")),
        pricing_unit=overrides.pop("pricing_unit", PricingUnit.PER_STAY),
        **overrides,
    )
    db.add(service)
    db.commit()
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
    db.commit()
    return booking
