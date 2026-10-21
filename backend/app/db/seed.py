"""Fill the database with demo content.

uv run python -m app.db.seed           # only if the database is empty
uv run python -m app.db.seed --reset   # wipe all data first, then seed
"""

import argparse
import sys
from datetime import date, timedelta

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.seed_data import AMENITIES, BOOKINGS, GUESTS, ROOMS, SERVICES
from app.db.session import SessionLocal
from app.models import (
    Amenity,
    Booking,
    BookingService,
    BookingStatus,
    MembershipTier,
    Profile,
    Review,
    Room,
    RoomImage,
    Service,
    User,
    UserRole,
)
from app.services import membership
from app.services.pricing import service_quantity, stay_total


def reset(session: Session) -> None:
    tables = ", ".join(table.name for table in Base.metadata.sorted_tables)
    session.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))


def seed(session: Session) -> None:
    settings = get_settings()
    if not settings.seed_admin_password or not settings.seed_guest_password:
        sys.exit("Set SEED_ADMIN_PASSWORD and SEED_GUEST_PASSWORD in .env before seeding.")

    amenities = {data["slug"]: Amenity(**data) for data in AMENITIES}
    session.add_all(amenities.values())

    rooms: dict[str, Room] = {}
    for data in ROOMS:
        data = dict(data)
        image_files = data.pop("images")
        amenity_slugs = data.pop("amenities")
        room = Room(**data)
        room.images = [
            RoomImage(
                url=f"/images/rooms/{file}",
                alt_text=f"{room.name}, photo {position + 1}",
                position=position,
            )
            for position, file in enumerate(image_files)
        ]
        room.amenities = [amenities[slug] for slug in amenity_slugs]
        rooms[room.slug] = room
    session.add_all(rooms.values())

    services = {data["slug"]: Service(**data) for data in SERVICES}
    session.add_all(services.values())

    admin = User(
        email=settings.seed_admin_email.lower(),
        password_hash=hash_password(settings.seed_admin_password),
        role=UserRole.ADMIN,
        profile=Profile(
            first_name="Resort",
            last_name="Manager",
            membership_tier=MembershipTier.PLATINUM,
        ),
    )
    guest_password_hash = hash_password(settings.seed_guest_password)
    guests: dict[str, User] = {}
    for data in GUESTS:
        data = dict(data)
        email = data.pop("email")
        guests[email] = User(
            email=email, password_hash=guest_password_hash, profile=Profile(**data)
        )
    session.add_all([admin, *guests.values()])

    today = date.today()
    for data in BOOKINGS:
        room = rooms[data["room"]]
        check_in = today + timedelta(days=data["starts_in_days"])
        nights = data["nights"]
        guest_count = data["adults"] + data["children"]
        booking = Booking(
            user=guests[data["guest"]],
            room=room,
            check_in=check_in,
            check_out=check_in + timedelta(days=nights),
            adults=data["adults"],
            children=data["children"],
            status=BookingStatus(data["status"]),
            special_requests=data.get("special_requests"),
        )
        for slug in data["services"]:
            service = services[slug]
            booking.service_links.append(
                BookingService(
                    service=service,
                    unit_price=service.price,
                    quantity=service_quantity(
                        service.pricing_unit, nights=nights, guests=guest_count
                    ),
                )
            )
        # Seeded stays are priced as the API prices them, with the guest's club discount.
        booking.member_tier = booking.user.profile.membership_tier
        booking.member_discount = membership.room_discount(
            room.price_per_night * nights, booking.member_tier
        )
        booking.total_price = stay_total(
            room.price_per_night,
            nights,
            [(line.unit_price, line.quantity) for line in booking.service_links],
            booking.member_discount,
        )
        if review := data.get("review"):
            booking.review = Review(**review)
        session.add(booking)


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the Isla Blanca database.")
    parser.add_argument("--reset", action="store_true", help="delete all data before seeding")
    args = parser.parse_args()

    with SessionLocal() as session, session.begin():
        if args.reset:
            reset(session)
        elif session.scalar(select(Room.id).limit(1)) is not None:
            print("Database already has data. Use --reset to start over.")
            return
        seed(session)

    with SessionLocal() as session:
        counts = {
            model.__tablename__: session.query(model).count()
            for model in (User, Profile, Room, RoomImage, Amenity, Service, Booking, Review)
        }
    print("Seeded:", ", ".join(f"{count} {name}" for name, count in counts.items()))


if __name__ == "__main__":
    main()
