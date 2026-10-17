from decimal import Decimal

from app.models.enums import BookingStatus
from app.schemas.common import Schema
from app.schemas.room import RoomBrief


class MonthlyRevenue(Schema):
    month: str  # "2026-10"
    revenue: Decimal
    bookings: int


class RoomPerformance(Schema):
    room: RoomBrief
    bookings: int
    revenue: Decimal


class DashboardStats(Schema):
    total_guests: int
    total_rooms: int
    active_rooms: int
    bookings_by_status: dict[BookingStatus, int]
    revenue_total: Decimal
    occupancy_next_30_days: float  # 0..1, share of room-nights already booked
    upcoming_check_ins: int  # in the next 7 days
    revenue_by_month: list[MonthlyRevenue]
    top_rooms: list[RoomPerformance]
