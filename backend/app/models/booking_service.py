from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.service import Service


class BookingService(Base):
    """n-m link between bookings and services, with its own data (association object).

    `unit_price` is a snapshot of the service price when it was booked, so later price
    changes never alter past bookings.
    """

    __tablename__ = "booking_services"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="quantity_positive"),
        CheckConstraint("unit_price >= 0", name="unit_price_non_negative"),
    )

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"), primary_key=True
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="RESTRICT"), primary_key=True, index=True
    )
    quantity: Mapped[int] = mapped_column(SmallInteger, default=1)
    unit_price: Mapped[Decimal]

    booking: Mapped["Booking"] = relationship(back_populates="service_links")
    service: Mapped["Service"] = relationship(back_populates="booking_links")

    @property
    def subtotal(self) -> Decimal:
        return self.unit_price * self.quantity
