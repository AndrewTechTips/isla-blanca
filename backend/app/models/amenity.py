from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin
from app.models.associations import room_amenities

if TYPE_CHECKING:
    from app.models.room import Room


class Amenity(IdMixin, Base):
    """In-room facility such as Wi-Fi or a safe (lookup table)."""

    __tablename__ = "amenities"

    slug: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    icon: Mapped[str] = mapped_column(String(80))

    rooms: Mapped[list["Room"]] = relationship(secondary=room_amenities, back_populates="amenities")
