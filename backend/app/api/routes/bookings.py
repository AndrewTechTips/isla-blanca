from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession, OptionalUser, Pagination
from app.models import Booking
from app.schemas.booking import BookingCreate, BookingQuote, BookingRead, ReviewCreate, StayRequest
from app.schemas.common import ErrorResponse, Page
from app.services import bookings

router = APIRouter(prefix="/bookings", tags=["bookings"])

NOT_FOUND = {404: {"model": ErrorResponse, "description": "Booking not found"}}
RULE_BROKEN = {422: {"model": ErrorResponse, "description": "A booking rule is not met"}}


@router.post(
    "/quote",
    response_model=BookingQuote,
    responses={404: {"model": ErrorResponse}, **RULE_BROKEN},
    summary="Price a stay without booking it",
)
def quote(data: StayRequest, db: DbSession, user: OptionalUser) -> BookingQuote:
    """Public: the price breakdown shown before the guest confirms. With a token, it includes
    the guest's club discount."""
    return bookings.quote(db, data, user)


@router.post(
    "",
    response_model=BookingRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse, "description": "Room already booked for these dates"},
        **RULE_BROKEN,
    },
    summary="Book a room",
)
def create_booking(data: BookingCreate, user: CurrentUser, db: DbSession) -> Booking:
    return bookings.create(db, user, data)


@router.get("", response_model=Page[BookingRead], summary="The signed-in guest's bookings")
def list_my_bookings(user: CurrentUser, db: DbSession, pagination: Pagination) -> Page[BookingRead]:
    return bookings.list_for_user(db, user, pagination)


@router.get("/{reference}", response_model=BookingRead, responses=NOT_FOUND, summary="One booking")
def read_booking(reference: str, user: CurrentUser, db: DbSession) -> Booking:
    return bookings.get_for_user(db, user, reference)


@router.post(
    "/{reference}/cancel",
    response_model=BookingRead,
    responses={**NOT_FOUND, **RULE_BROKEN},
    summary="Cancel a booking before arrival",
)
def cancel_booking(reference: str, user: CurrentUser, db: DbSession) -> Booking:
    return bookings.cancel(db, user, reference)


@router.post(
    "/{reference}/review",
    response_model=BookingRead,
    status_code=status.HTTP_201_CREATED,
    responses={**NOT_FOUND, 409: {"model": ErrorResponse}, **RULE_BROKEN},
    summary="Review a finished stay",
)
def review_booking(reference: str, data: ReviewCreate, user: CurrentUser, db: DbSession) -> Booking:
    return bookings.add_review(db, user, reference, data)
