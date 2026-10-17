from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import DbSession, Pagination
from app.core.exceptions import BusinessRuleError
from app.schemas.booking import ReviewRead
from app.schemas.common import ErrorResponse, Page
from app.schemas.room import RoomAvailability, RoomDetail, RoomSearch, RoomSummary
from app.services import rooms

router = APIRouter(prefix="/rooms", tags=["rooms"])

NOT_FOUND = {404: {"model": ErrorResponse, "description": "Room not found"}}
MAX_AVAILABILITY_DAYS = 366


@router.get("", response_model=Page[RoomSummary], summary="Search rooms")
def search_rooms(
    filters: Annotated[RoomSearch, Query()], db: DbSession, pagination: Pagination
) -> Page[RoomSummary]:
    """Active rooms, optionally only those free for the given dates and party size."""
    return rooms.search(db, filters, pagination)


@router.get("/{slug}", response_model=RoomDetail, responses=NOT_FOUND, summary="Room details")
def read_room(slug: str, db: DbSession) -> RoomDetail:
    return rooms.room_detail(db, rooms.get_room(db, slug))


@router.get(
    "/{slug}/availability",
    response_model=RoomAvailability,
    responses=NOT_FOUND,
    summary="Booked date ranges, for the availability calendar",
)
def read_availability(
    slug: str,
    db: DbSession,
    start: Annotated[date | None, Query(description="Defaults to today")] = None,
    end: Annotated[date | None, Query(description="Defaults to 90 days after start")] = None,
) -> RoomAvailability:
    start = start or date.today()
    end = end or start + timedelta(days=90)
    if end <= start or (end - start).days > MAX_AVAILABILITY_DAYS:
        raise BusinessRuleError(
            f"end must be after start, within {MAX_AVAILABILITY_DAYS} days.", code="invalid_range"
        )
    return rooms.availability(db, rooms.get_room(db, slug), start, end)


@router.get(
    "/{slug}/reviews",
    response_model=Page[ReviewRead],
    responses=NOT_FOUND,
    summary="Guest reviews of a room",
)
def read_reviews(slug: str, db: DbSession, pagination: Pagination) -> Page[ReviewRead]:
    return rooms.reviews(db, rooms.get_room(db, slug), pagination)
