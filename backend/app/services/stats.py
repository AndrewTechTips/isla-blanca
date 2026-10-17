"""Numbers for the admin dashboard, computed with SQL aggregates."""

from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import Date, case, cast, func, select
from sqlalchemy.orm import Session

from app.models import Booking, BookingStatus, Room, User, UserRole
from app.schemas.admin import DashboardStats, MonthlyRevenue, RoomPerformance
from app.schemas.room import RoomBrief
from app.services.rooms import ACTIVE_STATUSES

OCCUPANCY_WINDOW_DAYS = 30
MONTHS_OF_REVENUE = 12


def _occupancy(db: Session, start: date, active_rooms: int) -> float:
    """Share of room-nights booked in [start, start + window)."""
    if active_rooms == 0:
        return 0.0
    end = start + timedelta(days=OCCUPANCY_WINDOW_DAYS)
    # Clip every booking to the window, then add up the nights that fall inside it.
    nights = func.greatest(
        cast(func.least(Booking.check_out, end), Date)
        - cast(func.greatest(Booking.check_in, start), Date),
        0,
    )
    booked = db.scalar(
        select(func.coalesce(func.sum(nights), 0))
        .join(Booking.room)
        .where(
            Room.is_active,
            Booking.status.in_(ACTIVE_STATUSES),
            Booking.check_in < end,
            Booking.check_out > start,
        )
    )
    return round(int(booked) / (active_rooms * OCCUPANCY_WINDOW_DAYS), 3)


def dashboard(db: Session) -> DashboardStats:
    today = date.today()
    not_cancelled = Booking.status != BookingStatus.CANCELLED

    by_status = {status: 0 for status in BookingStatus}
    for status, count in db.execute(select(Booking.status, func.count()).group_by(Booking.status)):
        by_status[status] = count

    total_rooms, active_rooms = db.execute(
        select(func.count(), func.count().filter(Room.is_active)).select_from(Room)
    ).one()

    month = func.to_char(Booking.check_in, "YYYY-MM")
    first_month = (today.replace(day=1) - timedelta(days=365)).replace(day=1)
    revenue_by_month = [
        MonthlyRevenue(month=row.month, revenue=row.revenue, bookings=row.bookings)
        for row in db.execute(
            select(
                month.label("month"),
                func.sum(Booking.total_price).label("revenue"),
                func.count().label("bookings"),
            )
            .where(not_cancelled, Booking.check_in >= first_month)
            .group_by(month)
            .order_by(month)
        )
    ][-MONTHS_OF_REVENUE:]

    room_revenue = func.coalesce(
        func.sum(case((not_cancelled, Booking.total_price), else_=0)), 0
    ).label("revenue")
    room_bookings = func.count(Booking.id).filter(not_cancelled).label("bookings")
    top_rooms = [
        RoomPerformance(room=RoomBrief.model_validate(room), bookings=bookings, revenue=revenue)
        for room, bookings, revenue in db.execute(
            select(Room, room_bookings, room_revenue)
            .outerjoin(Booking, Booking.room_id == Room.id)
            .group_by(Room.id)
            .order_by(room_revenue.desc(), Room.id)
            .limit(5)
        )
    ]

    return DashboardStats(
        total_guests=db.scalar(
            select(func.count()).select_from(User).where(User.role == UserRole.GUEST)
        )
        or 0,
        total_rooms=total_rooms,
        active_rooms=active_rooms,
        bookings_by_status=by_status,
        revenue_total=db.scalar(
            select(func.coalesce(func.sum(Booking.total_price), 0)).where(not_cancelled)
        )
        or Decimal(0),
        occupancy_next_30_days=_occupancy(db, today, active_rooms),
        upcoming_check_ins=db.scalar(
            select(func.count())
            .select_from(Booking)
            .where(
                Booking.status.in_((BookingStatus.PENDING, BookingStatus.CONFIRMED)),
                Booking.check_in >= today,
                Booking.check_in < today + timedelta(days=7),
            )
        )
        or 0,
        revenue_by_month=revenue_by_month,
        top_rooms=top_rooms,
    )
