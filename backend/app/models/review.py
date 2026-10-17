from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.booking import Booking


class Review(IdMixin, TimestampMixin, Base):
    """A guest's review of a stay, in a 1-1 relation with `Booking`.

    The guest and the room are reached through the booking, so a review can only exist
    for a real stay and the data is never duplicated.
    """

    __tablename__ = "reviews"
    __table_args__ = (CheckConstraint("rating BETWEEN 1 AND 5", name="rating_range"),)

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"), unique=True
    )
    rating: Mapped[int] = mapped_column(SmallInteger)
    title: Mapped[str] = mapped_column(String(120))
    comment: Mapped[str] = mapped_column(Text)

    booking: Mapped["Booking"] = relationship(back_populates="review")

    @property
    def author_name(self) -> str:
        """Public display name, e.g. "Sofia C."."""
        profile = self.booking.user.profile
        return f"{profile.first_name} {profile.last_name[:1]}."
