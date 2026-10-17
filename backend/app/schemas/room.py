from datetime import date
from decimal import Decimal
from enum import StrEnum
from typing import Annotated

from pydantic import Field, model_validator

from app.models.enums import BedType
from app.schemas.catalog import AmenityRead
from app.schemas.common import Schema
from app.schemas.types import LongText, NonEmptyText, PositiveMoney, ShortText, Slug, Url


class RatingSummary(Schema):
    average: float | None = None
    count: int = 0


class RoomImageRead(Schema):
    url: str
    alt_text: str
    position: int


class RoomBrief(Schema):
    id: int
    slug: str
    name: str
    cover_image: str | None


class RoomSummary(RoomBrief):
    tagline: str
    price_per_night: Decimal
    size_m2: int
    bed_type: BedType
    max_guests: int
    rating: RatingSummary = RatingSummary()


class RoomDetail(RoomSummary):
    description: str
    panorama_url: str | None
    is_active: bool
    images: list[RoomImageRead]
    amenities: list[AmenityRead]


class DateRange(Schema):
    check_in: date
    check_out: date


class RoomAvailability(Schema):
    room_id: int
    start: date
    end: date
    booked: list[DateRange]


class RoomSort(StrEnum):
    RECOMMENDED = "recommended"
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"
    SIZE_DESC = "size_desc"


class RoomImageIn(Schema):
    url: Url
    alt_text: LongText


class RoomCreate(Schema):
    slug: Slug
    name: ShortText
    tagline: LongText
    description: NonEmptyText
    price_per_night: PositiveMoney
    size_m2: Annotated[int, Field(gt=0, le=2000)]
    bed_type: BedType
    max_guests: Annotated[int, Field(ge=1, le=12)]
    panorama_url: Url | None = None
    is_active: bool = True
    amenity_ids: list[int] = []
    images: list[RoomImageIn] = []


class RoomUpdate(Schema):
    """Partial update. `amenity_ids` and `images`, when sent, replace the current lists."""

    name: ShortText | None = None
    tagline: LongText | None = None
    description: NonEmptyText | None = None
    price_per_night: PositiveMoney | None = None
    size_m2: Annotated[int, Field(gt=0, le=2000)] | None = None
    bed_type: BedType | None = None
    max_guests: Annotated[int, Field(ge=1, le=12)] | None = None
    panorama_url: Url | None = None
    is_active: bool | None = None
    amenity_ids: list[int] | None = None
    images: list[RoomImageIn] | None = None


class RoomSearch(Schema):
    """Query filters for the public room list."""

    check_in: date | None = None
    check_out: date | None = None
    guests: Annotated[int, Field(ge=1, le=12)] | None = None
    min_price: Annotated[Decimal, Field(ge=0)] | None = None
    max_price: Annotated[Decimal, Field(ge=0)] | None = None
    amenities: list[str] = []
    sort: RoomSort = RoomSort.RECOMMENDED

    @model_validator(mode="after")
    def check_ranges(self) -> "RoomSearch":
        if (self.check_in is None) != (self.check_out is None):
            raise ValueError("check_in and check_out must be sent together")
        if self.check_in and self.check_out and self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        prices_set = self.min_price is not None and self.max_price is not None
        if prices_set and self.min_price > self.max_price:
            raise ValueError("min_price cannot be greater than max_price")
        return self
