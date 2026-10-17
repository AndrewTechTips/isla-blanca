"""Booking price rules, shared by the seed script and the booking API."""

from decimal import Decimal

from app.models.enums import PricingUnit


def service_quantity(unit: PricingUnit, *, nights: int, guests: int) -> int:
    """How many units of a service a stay consumes, based on how the service is priced."""
    match unit:
        case PricingUnit.PER_STAY:
            return 1
        case PricingUnit.PER_NIGHT:
            return nights
        case PricingUnit.PER_GUEST:
            return guests


def stay_total(
    price_per_night: Decimal, nights: int, service_lines: list[tuple[Decimal, int]]
) -> Decimal:
    """Room price for every night plus each service line (unit price × quantity)."""
    services = sum((unit_price * quantity for unit_price, quantity in service_lines), Decimal(0))
    return price_per_night * nights + services
