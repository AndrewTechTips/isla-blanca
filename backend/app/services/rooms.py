"""Room catalogue: search with availability, details, booked dates and reviews."""

from collections.abc import Sequence
from datetime import date

from sqlalchemy import ColumnElement, Select, and_, exists, func, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import NotFoundError
from app.models import Amenity, Booking, BookingStatus, Review, Room, User
from app.schemas.booking import ReviewRead
from app.schemas.common import Page, PageParams
from app.schemas.room import (
    DateRange,
    RatingSummary,
    RoomAvailability,
    RoomDetail,
    RoomSearch,
    RoomSort,
    RoomSummary,
)
from app.services.pagination import paginate

ACTIVE_STATUSES = (BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED)


def overlaps(check_in: date, check_out: date) -> ColumnElement[bool]:
    """Active bookings whose [check_in, check_out) range intersects the given one."""
    return and_(
        Booking.status.in_(ACTIVE_STATUSES),
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    )


def is_available(db: Session, room_id: int, check_in: date, check_out: date) -> bool:
    taken = select(Booking.id).where(Booking.room_id == room_id, overlaps(check_in, check_out))
    return not db.scalar(select(exists(taken)))


def ratings_for(db: Session, room_ids: Sequence[int]) -> dict[int, RatingSummary]:
    rows = db.execute(
        select(Booking.room_id, func.avg(Review.rating), func.count(Review.id))
        .join(Review.booking)
        .where(Booking.room_id.in_(room_ids))
        .group_by(Booking.room_id)
    )
    return {
        room_id: RatingSummary(average=round(float(avg), 1), count=count)
        for room_id, avg, count in rows
    }


def _search_query(search: RoomSearch) -> Select[tuple[Room]]:
    query = select(Room).where(Room.is_active)
    if search.check_in and search.check_out:
        taken = select(Booking.id).where(
            Booking.room_id == Room.id, overlaps(search.check_in, search.check_out)
        )
        query = query.where(~exists(taken))
    if search.guests:
        query = query.where(Room.max_guests >= search.guests)
    if search.min_price is not None:
        query = query.where(Room.price_per_night >= search.min_price)
    if search.max_price is not None:
        query = query.where(Room.price_per_night <= search.max_price)
    for slug in search.amenities:
        query = query.where(Room.amenities.any(Amenity.slug == slug))

    order = {
        RoomSort.RECOMMENDED: (Room.id,),
        RoomSort.PRICE_ASC: (Room.price_per_night, Room.id),
        RoomSort.PRICE_DESC: (Room.price_per_night.desc(), Room.id),
        RoomSort.SIZE_DESC: (Room.size_m2.desc(), Room.id),
    }[search.sort]
    return query.order_by(*order)


def search(db: Session, search: RoomSearch, params: PageParams) -> Page[RoomSummary]:
    query = _search_query(search).options(selectinload(Room.images))
    rooms, total = paginate(db, query, params)
    ratings = ratings_for(db, [room.id for room in rooms])
    items = [
        RoomSummary.model_validate(room).model_copy(
            update={"rating": ratings.get(room.id, RatingSummary())}
        )
        for room in rooms
    ]
    return Page.build(items, total=total, page=params.page, size=params.size)


def get_room(db: Session, slug: str, *, include_inactive: bool = False) -> Room:
    query = (
        select(Room)
        .where(Room.slug == slug)
        .options(selectinload(Room.images), selectinload(Room.amenities))
    )
    room = db.scalar(query)
    if room is None or (not room.is_active and not include_inactive):
        raise NotFoundError("Room not found.", code="room_not_found")
    return room


def room_detail(db: Session, room: Room) -> RoomDetail:
    rating = ratings_for(db, [room.id]).get(room.id, RatingSummary())
    return RoomDetail.model_validate(room).model_copy(update={"rating": rating})


def availability(db: Session, room: Room, start: date, end: date) -> RoomAvailability:
    rows = db.execute(
        select(Booking.check_in, Booking.check_out)
        .where(Booking.room_id == room.id, overlaps(start, end))
        .order_by(Booking.check_in)
    )
    booked = [DateRange(check_in=check_in, check_out=check_out) for check_in, check_out in rows]
    return RoomAvailability(room_id=room.id, start=start, end=end, booked=booked)


def reviews(db: Session, room: Room, params: PageParams) -> Page[ReviewRead]:
    query = (
        select(Review)
        .join(Review.booking)
        .where(Booking.room_id == room.id)
        .options(selectinload(Review.booking).selectinload(Booking.user).selectinload(User.profile))
        .order_by(Review.created_at.desc(), Review.id.desc())
    )
    items, total = paginate(db, query, params)
    return Page.build(
        [ReviewRead.model_validate(review) for review in items],
        total=total,
        page=params.page,
        size=params.size,
    )
