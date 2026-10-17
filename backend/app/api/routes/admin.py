"""Staff-only endpoints. Every route here requires an admin token."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status

from app.api.deps import DbSession, Pagination, require_admin
from app.models import Amenity, Booking, BookingStatus, Room, Service
from app.schemas.admin import DashboardStats
from app.schemas.booking import AdminBookingRead, BookingStatusUpdate
from app.schemas.catalog import (
    AmenityCreate,
    AmenityRead,
    AmenityUpdate,
    ServiceCreate,
    ServiceRead,
    ServiceUpdate,
)
from app.schemas.common import ErrorResponse, Page
from app.schemas.room import RoomCreate, RoomDetail, RoomUpdate
from app.schemas.user import UserRead
from app.services import bookings, catalog, room_admin, rooms, stats, users

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
    responses={
        401: {"model": ErrorResponse, "description": "Not signed in"},
        403: {"model": ErrorResponse, "description": "Not an admin"},
    },
)

# --- Dashboard -------------------------------------------------------------------------------


@router.get("/stats", response_model=DashboardStats, summary="Dashboard numbers")
def dashboard(db: DbSession) -> DashboardStats:
    return stats.dashboard(db)


# --- Bookings --------------------------------------------------------------------------------


@router.get("/bookings", response_model=Page[AdminBookingRead], summary="All bookings")
def list_bookings(
    db: DbSession,
    pagination: Pagination,
    status: BookingStatus | None = None,
    room_id: int | None = None,
    guest_email: Annotated[str | None, Query(max_length=255)] = None,
) -> Page[AdminBookingRead]:
    return bookings.list_all(
        db, pagination, status=status, room_id=room_id, guest_email=guest_email
    )


@router.patch(
    "/bookings/{reference}",
    response_model=AdminBookingRead,
    summary="Confirm, complete or cancel a booking",
)
def update_booking_status(reference: str, data: BookingStatusUpdate, db: DbSession) -> Booking:
    return bookings.change_status(db, reference, data.status)


# --- Guests ----------------------------------------------------------------------------------


@router.get("/users", response_model=Page[UserRead], summary="All accounts")
def list_users(db: DbSession, pagination: Pagination) -> Page[UserRead]:
    return users.list_users(db, pagination)


# --- Rooms -----------------------------------------------------------------------------------


@router.get("/rooms", response_model=list[RoomDetail], summary="All rooms, including inactive")
def list_rooms(db: DbSession) -> list[Room]:
    return room_admin.list_all(db)


@router.post(
    "/rooms", response_model=RoomDetail, status_code=status.HTTP_201_CREATED, summary="Add a room"
)
def create_room(data: RoomCreate, db: DbSession) -> RoomDetail:
    return rooms.room_detail(db, room_admin.create(db, data))


@router.patch("/rooms/{room_id}", response_model=RoomDetail, summary="Edit a room")
def update_room(room_id: int, data: RoomUpdate, db: DbSession) -> RoomDetail:
    return rooms.room_detail(db, room_admin.update(db, room_id, data))


@router.delete(
    "/rooms/{room_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={409: {"model": ErrorResponse, "description": "Room has bookings"}},
    summary="Delete a room without bookings",
)
def delete_room(room_id: int, db: DbSession) -> Response:
    room_admin.delete(db, room_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Services --------------------------------------------------------------------------------


@router.get("/services", response_model=list[ServiceRead], summary="All services")
def list_services(db: DbSession) -> list[Service]:
    return catalog.list_services(db, include_inactive=True)


@router.post(
    "/services",
    response_model=ServiceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a service",
)
def create_service(data: ServiceCreate, db: DbSession) -> Service:
    return catalog.create_service(db, data)


@router.patch("/services/{service_id}", response_model=ServiceRead, summary="Edit a service")
def update_service(service_id: int, data: ServiceUpdate, db: DbSession) -> Service:
    return catalog.update_service(db, service_id, data)


@router.delete(
    "/services/{service_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={409: {"model": ErrorResponse, "description": "Service used in bookings"}},
    summary="Delete a service never booked",
)
def delete_service(service_id: int, db: DbSession) -> Response:
    catalog.delete_service(db, service_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Amenities -------------------------------------------------------------------------------


@router.post(
    "/amenities",
    response_model=AmenityRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add an amenity",
)
def create_amenity(data: AmenityCreate, db: DbSession) -> Amenity:
    return catalog.create_amenity(db, data)


@router.patch("/amenities/{amenity_id}", response_model=AmenityRead, summary="Edit an amenity")
def update_amenity(amenity_id: int, data: AmenityUpdate, db: DbSession) -> Amenity:
    return catalog.update_amenity(db, amenity_id, data)


@router.delete(
    "/amenities/{amenity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an amenity (removed from every room)",
)
def delete_amenity(amenity_id: int, db: DbSession) -> Response:
    catalog.delete_amenity(db, amenity_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
