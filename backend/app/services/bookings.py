"""Booking use cases: price quotes, reservations, cancellations, reviews and status changes."""

from datetime import date

from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.orm.interfaces import LoaderOption

from app.core.exceptions import BusinessRuleError, ConflictError, ForbiddenError, NotFoundError
from app.models import Booking, BookingService, BookingStatus, Review, Room, Service, User, UserRole
from app.schemas.booking import (
    AdminBookingRead,
    BookingCreate,
    BookingQuote,
    BookingRead,
    QuoteLine,
    ReviewCreate,
    StayRequest,
)
from app.schemas.catalog import ServiceBrief
from app.schemas.common import Page, PageParams
from app.schemas.room import RoomBrief
from app.services.pagination import paginate
from app.services.pricing import service_quantity, stay_total
from app.services.rooms import is_available

# Which status changes staff may make. Cancelled and completed bookings are final.
ALLOWED_TRANSITIONS: dict[BookingStatus, set[BookingStatus]] = {
    BookingStatus.PENDING: {BookingStatus.CONFIRMED, BookingStatus.CANCELLED},
    BookingStatus.CONFIRMED: {BookingStatus.COMPLETED, BookingStatus.CANCELLED},
    BookingStatus.CANCELLED: set(),
    BookingStatus.COMPLETED: set(),
}


def _load_options() -> list[LoaderOption]:
    return [
        selectinload(Booking.room).selectinload(Room.images),
        selectinload(Booking.service_links).selectinload(BookingService.service),
        selectinload(Booking.review),
        selectinload(Booking.user).selectinload(User.profile),
    ]


# --- Quotes and creation ---------------------------------------------------------------------


def _bookable_room(db: Session, room_id: int) -> Room:
    room = db.get(Room, room_id, options=[selectinload(Room.images)])
    if room is None or not room.is_active:
        raise NotFoundError("Room not found.", code="room_not_found")
    return room


def _selected_services(db: Session, request: StayRequest) -> list[tuple[Service, int]]:
    ids = [selection.service_id for selection in request.services]
    if not ids:
        return []
    services = {s.id: s for s in db.scalars(select(Service).where(Service.id.in_(ids)))}
    selected = []
    for selection in request.services:
        service = services.get(selection.service_id)
        if service is None or not service.is_active:
            raise NotFoundError(
                f"Service {selection.service_id} is not available.", code="service_not_found"
            )
        quantity = selection.quantity or service_quantity(
            service.pricing_unit, nights=request.nights, guests=request.guests
        )
        selected.append((service, quantity))
    return selected


def quote(db: Session, request: StayRequest) -> BookingQuote:
    room = _bookable_room(db, request.room_id)
    if request.guests > room.max_guests:
        raise BusinessRuleError(
            f"{room.name} sleeps up to {room.max_guests} guests.", code="too_many_guests"
        )
    lines = [
        QuoteLine(
            service=ServiceBrief.model_validate(service),
            unit_price=service.price,
            quantity=quantity,
            subtotal=service.price * quantity,
        )
        for service, quantity in _selected_services(db, request)
    ]
    room_total = room.price_per_night * request.nights
    return BookingQuote(
        room=RoomBrief.model_validate(room),
        check_in=request.check_in,
        check_out=request.check_out,
        nights=request.nights,
        price_per_night=room.price_per_night,
        room_total=room_total,
        services=lines,
        total=stay_total(
            room.price_per_night,
            request.nights,
            [(line.unit_price, line.quantity) for line in lines],
        ),
    )


def create(db: Session, user: User, data: BookingCreate) -> Booking:
    if data.check_in < date.today():
        raise BusinessRuleError("Check-in can't be in the past.", code="check_in_in_past")

    priced = quote(db, data)
    if not is_available(db, data.room_id, data.check_in, data.check_out):
        raise ConflictError("The room is already booked for these dates.", code="room_unavailable")

    booking = Booking(
        user=user,
        room_id=data.room_id,
        check_in=data.check_in,
        check_out=data.check_out,
        adults=data.adults,
        children=data.children,
        status=BookingStatus.CONFIRMED,
        total_price=priced.total,
        special_requests=data.special_requests,
        service_links=[
            BookingService(
                service_id=line.service.id, unit_price=line.unit_price, quantity=line.quantity
            )
            for line in priced.services
        ],
    )
    db.add(booking)
    try:
        db.commit()
    except IntegrityError as error:
        # Two guests booking the same dates at the same moment: the database constraint wins.
        db.rollback()
        if "ex_bookings_no_overlapping_stays" in str(error.orig):
            raise ConflictError(
                "The room is already booked for these dates.", code="room_unavailable"
            ) from error
        raise
    return get(db, booking.reference)


# --- Reading ---------------------------------------------------------------------------------


def get(db: Session, reference: str) -> Booking:
    booking = db.scalar(
        select(Booking).where(Booking.reference == reference).options(*_load_options())
    )
    if booking is None:
        raise NotFoundError("Booking not found.", code="booking_not_found")
    return booking


def get_for_user(db: Session, user: User, reference: str) -> Booking:
    booking = get(db, reference)
    if booking.user_id != user.id and user.role != UserRole.ADMIN:
        # Same answer as a missing booking: don't reveal other guests' references.
        raise NotFoundError("Booking not found.", code="booking_not_found")
    return booking


def _page[R: BookingRead](
    db: Session, query: Select[tuple[Booking]], params: PageParams, schema: type[R]
) -> Page[R]:
    items, total = paginate(db, query.options(*_load_options()), params)
    return Page.build(
        [schema.model_validate(booking) for booking in items],
        total=total,
        page=params.page,
        size=params.size,
    )


def list_for_user(db: Session, user: User, params: PageParams) -> Page[BookingRead]:
    query = (
        select(Booking)
        .where(Booking.user_id == user.id)
        .order_by(Booking.check_in.desc(), Booking.id.desc())
    )
    return _page(db, query, params, BookingRead)


def list_all(
    db: Session,
    params: PageParams,
    *,
    status: BookingStatus | None = None,
    room_id: int | None = None,
    guest_email: str | None = None,
) -> Page[AdminBookingRead]:
    query = select(Booking).order_by(Booking.check_in.desc(), Booking.id.desc())
    if status:
        query = query.where(Booking.status == status)
    if room_id:
        query = query.where(Booking.room_id == room_id)
    if guest_email:
        query = query.join(Booking.user).where(User.email.ilike(f"%{guest_email.lower()}%"))
    return _page(db, query, params, AdminBookingRead)


# --- Changes ---------------------------------------------------------------------------------


def cancel(db: Session, user: User, reference: str) -> Booking:
    booking = get_for_user(db, user, reference)
    if not booking.can_cancel:
        raise BusinessRuleError(
            "This booking can no longer be cancelled.", code="booking_not_cancellable"
        )
    booking.status = BookingStatus.CANCELLED
    db.commit()
    return booking


def add_review(db: Session, user: User, reference: str, data: ReviewCreate) -> Booking:
    booking = get_for_user(db, user, reference)
    if booking.user_id != user.id:
        raise ForbiddenError("Only the guest who stayed can review this booking.")
    if booking.review is not None:
        raise ConflictError("This stay has already been reviewed.", code="already_reviewed")
    if not booking.can_review:
        raise BusinessRuleError(
            "You can review a stay once it has ended.", code="booking_not_reviewable"
        )
    booking.review = Review(**data.model_dump())
    db.commit()
    return booking


def change_status(db: Session, reference: str, new_status: BookingStatus) -> Booking:
    booking = get(db, reference)
    if new_status == booking.status:
        return booking
    if new_status not in ALLOWED_TRANSITIONS[booking.status]:
        raise BusinessRuleError(
            f"A {booking.status} booking can't become {new_status}.",
            code="invalid_status_change",
        )
    booking.status = new_status
    db.commit()
    return booking
