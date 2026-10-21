from datetime import date

from app.models.enums import MembershipTier
from app.schemas.common import Schema


class TierRead(Schema):
    tier: MembershipTier
    min_nights: int
    discount_percent: int


class MembershipRead(Schema):
    """The signed-in guest's club card and progress to the next tier."""

    tier: MembershipTier
    discount_percent: int
    completed_nights: int
    next_tier: MembershipTier | None
    next_tier_nights: int | None
    nights_to_next: int | None
    member_number: str
    member_name: str
    member_since: date


class MembershipUpdate(Schema):
    tier: MembershipTier
