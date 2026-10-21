"""Isla Blanca Club: what each membership tier gives and how guests move up.

Every guest joins as Silver. Nights from completed stays move them up automatically; staff can
also set a tier by hand. Tiers never go down on their own.
"""

from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models import Booking, BookingStatus, MembershipTier, User
from app.schemas.membership import MembershipRead, TierRead


@dataclass(frozen=True)
class Tier:
    tier: MembershipTier
    min_nights: int
    discount_percent: int


# Lowest first. `min_nights` counts nights from completed stays.
TIERS = (
    Tier(MembershipTier.SILVER, min_nights=0, discount_percent=5),
    Tier(MembershipTier.GOLD, min_nights=7, discount_percent=10),
    Tier(MembershipTier.PLATINUM, min_nights=20, discount_percent=15),
)
_BY_TIER = {tier.tier: tier for tier in TIERS}
_RANK = {tier.tier: rank for rank, tier in enumerate(TIERS)}


def discount_percent(tier: MembershipTier) -> int:
    return _BY_TIER[tier].discount_percent


def earned_tier(nights: int) -> MembershipTier:
    """The highest tier these nights reach."""
    return [tier.tier for tier in TIERS if nights >= tier.min_nights][-1]


def completed_nights(db: Session, user_id: int) -> int:
    nights = db.scalar(
        select(func.coalesce(func.sum(Booking.check_out - Booking.check_in), 0)).where(
            Booking.user_id == user_id, Booking.status == BookingStatus.COMPLETED
        )
    )
    return int(nights or 0)


def promote(db: Session, user: User) -> None:
    """Move the guest up to the tier their completed nights earn (never down). Doesn't commit."""
    earned = earned_tier(completed_nights(db, user.id))
    if _RANK[earned] > _RANK[user.profile.membership_tier]:
        user.profile.membership_tier = earned


def tiers() -> list[TierRead]:
    return [TierRead.model_validate(tier) for tier in TIERS]


def member_number(user: User) -> str:
    """Eight digits for the card: the year the guest joined, then their account number."""
    return f"{user.created_at:%Y}{user.id:04d}"


def status(db: Session, user: User) -> MembershipRead:
    current = _BY_TIER[user.profile.membership_tier]
    nights = completed_nights(db, user.id)
    higher = [tier for tier in TIERS if _RANK[tier.tier] > _RANK[current.tier]]
    following = higher[0] if higher else None
    return MembershipRead(
        tier=current.tier,
        discount_percent=current.discount_percent,
        completed_nights=nights,
        next_tier=following.tier if following else None,
        next_tier_nights=following.min_nights if following else None,
        nights_to_next=max(following.min_nights - nights, 0) if following else None,
        member_number=member_number(user),
        member_name=user.profile.full_name,
        member_since=user.created_at.date(),
    )


def set_tier(db: Session, user_id: int, tier: MembershipTier) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise NotFoundError("Guest not found.", code="user_not_found")
    user.profile.membership_tier = tier
    db.commit()
    return user


def room_discount(room_total: Decimal, tier: MembershipTier | None) -> Decimal:
    """Member savings on the room nights (services are charged in full), rounded to cents."""
    if tier is None:
        return Decimal("0.00")
    return (room_total * discount_percent(tier) / 100).quantize(Decimal("0.01"))
