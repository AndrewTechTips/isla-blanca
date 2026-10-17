from enum import StrEnum

from sqlalchemy import Enum


class UserRole(StrEnum):
    GUEST = "guest"
    ADMIN = "admin"


class MembershipTier(StrEnum):
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class BedType(StrEnum):
    SINGLE = "single"
    DOUBLE = "double"
    QUEEN = "queen"
    KING = "king"


class BookingStatus(StrEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class PricingUnit(StrEnum):
    PER_STAY = "per_stay"
    PER_NIGHT = "per_night"
    PER_GUEST = "per_guest"


def pg_enum(enum_cls: type[StrEnum], name: str) -> Enum:
    """Native PostgreSQL enum that stores the lowercase values, not the Python member names."""
    return Enum(
        enum_cls,
        name=name,
        values_callable=lambda members: [member.value for member in members],
        validate_strings=True,
    )
