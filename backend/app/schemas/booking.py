from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import Field, StringConstraints, model_validator

from app.models.enums import BookingStatus, MembershipTier
from app.schemas.catalog import ServiceBrief
from app.schemas.common import Schema
from app.schemas.room import RoomBrief

MAX_NIGHTS = 30


class ServiceSelection(Schema):
    service_id: int
    quantity: Annotated[int, Field(ge=1, le=50)] | None = Field(
        default=None, description="Leave empty to use the default for the service's pricing unit"
    )


class StayRequest(Schema):
    """What the guest asks for: used both for a price quote and for the booking itself."""

    room_id: int
    check_in: date
    check_out: date
    adults: Annotated[int, Field(ge=1, le=12)]
    children: Annotated[int, Field(ge=0, le=10)] = 0
    services: list[ServiceSelection] = []

    @model_validator(mode="after")
    def check_stay(self) -> "StayRequest":
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        if (self.check_out - self.check_in).days > MAX_NIGHTS:
            raise ValueError(f"a stay can last at most {MAX_NIGHTS} nights")
        service_ids = [selection.service_id for selection in self.services]
        if len(service_ids) != len(set(service_ids)):
            raise ValueError("each service can be selected only once")
        return self

    @property
    def guests(self) -> int:
        return self.adults + self.children

    @property
    def nights(self) -> int:
        return (self.check_out - self.check_in).days


class BookingCreate(StayRequest):
    special_requests: (
        Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)] | None
    ) = None


class QuoteLine(Schema):
    service: ServiceBrief
    unit_price: Decimal
    quantity: int
    subtotal: Decimal


class BookingQuote(Schema):
    room: RoomBrief
    check_in: date
    check_out: date
    nights: int
    price_per_night: Decimal
    room_total: Decimal
    member_tier: MembershipTier | None = Field(
        description="The signed-in guest's club tier; empty when nobody is signed in"
    )
    member_discount: Decimal = Field(description="Taken off the room nights for club members")
    services: list[QuoteLine]
    total: Decimal


class ReviewRead(Schema):
    id: int
    rating: int
    title: str
    comment: str
    author_name: str
    created_at: datetime


class ReviewCreate(Schema):
    rating: Annotated[int, Field(ge=1, le=5)]
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=120)]
    comment: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=10, max_length=2000)
    ]


class BookingRead(Schema):
    id: int
    reference: str
    status: BookingStatus
    check_in: date
    check_out: date
    nights: int
    adults: int
    children: int
    total_price: Decimal
    member_tier: MembershipTier | None
    member_discount: Decimal
    special_requests: str | None
    created_at: datetime
    room: RoomBrief
    service_links: list[QuoteLine] = Field(serialization_alias="services")
    review: ReviewRead | None
    can_cancel: bool
    can_review: bool


class GuestBrief(Schema):
    id: int
    email: str
    full_name: str


class AdminBookingRead(BookingRead):
    guest: GuestBrief = Field(validation_alias="user")


class BookingStatusUpdate(Schema):
    status: BookingStatus
