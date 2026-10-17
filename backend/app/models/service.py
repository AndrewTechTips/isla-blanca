from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, String, Text, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.models.enums import PricingUnit, pg_enum

if TYPE_CHECKING:
    from app.models.booking_service import BookingService


class Service(IdMixin, TimestampMixin, Base):
    """Paid extra a guest can add to a booking: spa, private dinner, transfer..."""

    __tablename__ = "services"
    __table_args__ = (CheckConstraint("price >= 0", name="price_non_negative"),)

    slug: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[Decimal]
    pricing_unit: Mapped[PricingUnit] = mapped_column(pg_enum(PricingUnit, "pricing_unit"))
    icon: Mapped[str | None] = mapped_column(String(80))
    is_active: Mapped[bool] = mapped_column(default=True, server_default=true())

    booking_links: Mapped[list["BookingService"]] = relationship(
        back_populates="service", passive_deletes="all"
    )
