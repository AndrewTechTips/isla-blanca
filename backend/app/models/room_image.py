from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, SmallInteger, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin

if TYPE_CHECKING:
    from app.models.room import Room


class RoomImage(IdMixin, Base):
    """A photo of a room. Position 0 is the cover image."""

    __tablename__ = "room_images"
    __table_args__ = (
        UniqueConstraint("room_id", "position"),
        CheckConstraint("position >= 0", name="position_non_negative"),
    )

    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(String(500))
    alt_text: Mapped[str] = mapped_column(String(255))
    position: Mapped[int] = mapped_column(SmallInteger, default=0)

    room: Mapped["Room"] = relationship(back_populates="images")
