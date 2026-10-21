import secrets
import string
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, ForeignKey, SmallInteger, String, Text, func, text
from sqlalchemy.dialects.postgresql import ExcludeConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.models.enums import BookingStatus, MembershipTier, pg_enum

if TYPE_CHECKING:
    from app.models.booking_service import BookingService
    from app.models.review import Review
    from app.models.room import Room
    from app.models.user import User

_REFERENCE_ALPHABET = string.ascii_uppercase + string.digits


def generate_reference() -> str:
    """Short, human-friendly booking code, e.g. `IB-7K2M9Q`."""
    return "IB-" + "".join(secrets.choice(_REFERENCE_ALPHABET) for _ in range(6))


class Booking(IdMixin, TimestampMixin, Base):
    """A stay of one guest in one room, for a date range [check_in, check_out)."""

    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint("check_out > check_in", name="dates_ordered"),
        CheckConstraint("adults >= 1", name="at_least_one_adult"),
        CheckConstraint("children >= 0", name="children_non_negative"),
        CheckConstraint("total_price >= 0", name="total_price_non_negative"),
        CheckConstraint("member_discount >= 0", name="member_discount_non_negative"),
        # A room can never be double-booked: two active bookings for the same room may not
        # have overlapping date ranges. Checkout day is exclusive, so back-to-back stays work.
        ExcludeConstraint(
            ("room_id", "="),
            (func.daterange(text("check_in"), text("check_out"), text("'[)'")), "&&"),
            name="ex_bookings_no_overlapping_stays",
            using="gist",
            where=text("status <> 'cancelled'"),
        ),
    )

    reference: Mapped[str] = mapped_column(String(12), unique=True, default=generate_reference)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="RESTRICT"), index=True)
    check_in: Mapped[date] = mapped_column(Date)
    check_out: Mapped[date] = mapped_column(Date)
    adults: Mapped[int] = mapped_column(SmallInteger, default=1)
    children: Mapped[int] = mapped_column(SmallInteger, default=0, server_default=text("0"))
    status: Mapped[BookingStatus] = mapped_column(
        pg_enum(BookingStatus, "booking_status"),
        default=BookingStatus.PENDING,
        server_default=BookingStatus.PENDING,
        index=True,
    )
    total_price: Mapped[Decimal]
    # Club tier of the guest when they booked, and what it took off the room nights.
    member_tier: Mapped[MembershipTier | None] = mapped_column(
        pg_enum(MembershipTier, "membership_tier")
    )
    member_discount: Mapped[Decimal] = mapped_column(default=0, server_default=text("0"))
    special_requests: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship(back_populates="bookings")
    room: Mapped["Room"] = relationship(back_populates="bookings")
    # n-m with services, through the `BookingService` association object.
    service_links: Mapped[list["BookingService"]] = relationship(
        back_populates="booking", cascade="all, delete-orphan"
    )
    # 1-1: at most one review per booking.
    review: Mapped["Review | None"] = relationship(
        back_populates="booking", cascade="all, delete-orphan", single_parent=True
    )

    @property
    def nights(self) -> int:
        return (self.check_out - self.check_in).days

    @property
    def can_cancel(self) -> bool:
        """Guests can cancel an active booking until the day before arrival."""
        active = self.status in (BookingStatus.PENDING, BookingStatus.CONFIRMED)
        return active and self.check_in > date.today()

    @property
    def can_review(self) -> bool:
        """A stay can be reviewed once it has ended, if it wasn't cancelled."""
        ended = self.check_out <= date.today()
        valid = self.status in (BookingStatus.CONFIRMED, BookingStatus.COMPLETED)
        return ended and valid and self.review is None

    def __repr__(self) -> str:
        return f"<Booking {self.reference} room={self.room_id} {self.check_in}→{self.check_out}>"
