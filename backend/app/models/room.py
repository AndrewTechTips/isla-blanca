from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, SmallInteger, String, Text, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.models.associations import room_amenities
from app.models.enums import BedType, pg_enum

if TYPE_CHECKING:
    from app.models.amenity import Amenity
    from app.models.booking import Booking
    from app.models.room_image import RoomImage


class Room(IdMixin, TimestampMixin, Base):
    """A bookable suite or villa."""

    __tablename__ = "rooms"
    __table_args__ = (
        CheckConstraint("price_per_night > 0", name="price_positive"),
        CheckConstraint("size_m2 > 0", name="size_positive"),
        CheckConstraint("max_guests BETWEEN 1 AND 12", name="max_guests_range"),
    )

    slug: Mapped[str] = mapped_column(String(120), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    tagline: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    price_per_night: Mapped[Decimal]
    size_m2: Mapped[int] = mapped_column(SmallInteger)
    bed_type: Mapped[BedType] = mapped_column(pg_enum(BedType, "bed_type"))
    max_guests: Mapped[int] = mapped_column(SmallInteger)
    panorama_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(default=True, server_default=true())

    # 1-n: a room has many photos, removed together with the room.
    images: Mapped[list["RoomImage"]] = relationship(
        back_populates="room", cascade="all, delete-orphan", order_by="RoomImage.position"
    )
    # n-m: a room has many amenities, an amenity belongs to many rooms.
    amenities: Mapped[list["Amenity"]] = relationship(
        secondary=room_amenities, back_populates="rooms", order_by="Amenity.name"
    )
    # 1-n: a room is booked many times. passive_deletes="all" leaves the ON DELETE RESTRICT
    # to PostgreSQL instead of the ORM nulling out room_id, so booked rooms can't be deleted.
    bookings: Mapped[list["Booking"]] = relationship(back_populates="room", passive_deletes="all")

    def __repr__(self) -> str:
        return f"<Room {self.id} {self.slug}>"
