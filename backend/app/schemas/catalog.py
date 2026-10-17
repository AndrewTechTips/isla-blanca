"""Amenities and services: the lookup data shown across the site."""

from decimal import Decimal

from app.models.enums import PricingUnit
from app.schemas.common import Schema
from app.schemas.types import IconName, Money, NonEmptyText, ShortText, Slug


class AmenityRead(Schema):
    id: int
    slug: str
    name: str
    icon: str


class AmenityCreate(Schema):
    slug: Slug
    name: ShortText
    icon: IconName


class AmenityUpdate(Schema):
    name: ShortText | None = None
    icon: IconName | None = None


class ServiceBrief(Schema):
    id: int
    slug: str
    name: str
    icon: str | None


class ServiceRead(ServiceBrief):
    description: str
    price: Decimal
    pricing_unit: PricingUnit
    is_active: bool


class ServiceCreate(Schema):
    slug: Slug
    name: ShortText
    description: NonEmptyText
    price: Money
    pricing_unit: PricingUnit
    icon: IconName | None = None
    is_active: bool = True


class ServiceUpdate(Schema):
    name: ShortText | None = None
    description: NonEmptyText | None = None
    price: Money | None = None
    pricing_unit: PricingUnit | None = None
    icon: IconName | None = None
    is_active: bool | None = None
