from decimal import Decimal

import pytest

from app.models import PricingUnit
from app.services.pricing import service_quantity, stay_total


@pytest.mark.parametrize(
    ("unit", "expected"),
    [(PricingUnit.PER_STAY, 1), (PricingUnit.PER_NIGHT, 4), (PricingUnit.PER_GUEST, 3)],
)
def test_service_quantity_follows_the_pricing_unit(unit: PricingUnit, expected: int) -> None:
    assert service_quantity(unit, nights=4, guests=3) == expected


def test_stay_total_adds_nights_and_services() -> None:
    total = stay_total(
        Decimal("389.00"),
        5,
        [(Decimal("180.00"), 3), (Decimal("45.00"), 5)],
    )
    assert total == Decimal("2710.00")


def test_stay_total_without_services() -> None:
    assert stay_total(Decimal("259.00"), 3, []) == Decimal("777.00")
