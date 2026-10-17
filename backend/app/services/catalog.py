"""Amenities and services: public lists and staff management."""

from sqlalchemy import exists, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models import Amenity, BookingService, Service
from app.schemas.catalog import AmenityCreate, AmenityUpdate, ServiceCreate, ServiceUpdate


def _commit_unique(db: Session, what: str) -> None:
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ConflictError(f"{what} with this slug or name already exists.") from error


# --- Amenities -------------------------------------------------------------------------------


def list_amenities(db: Session) -> list[Amenity]:
    return list(db.scalars(select(Amenity).order_by(Amenity.name)))


def get_amenity(db: Session, amenity_id: int) -> Amenity:
    amenity = db.get(Amenity, amenity_id)
    if amenity is None:
        raise NotFoundError("Amenity not found.", code="amenity_not_found")
    return amenity


def create_amenity(db: Session, data: AmenityCreate) -> Amenity:
    amenity = Amenity(**data.model_dump())
    db.add(amenity)
    _commit_unique(db, "An amenity")
    return amenity


def update_amenity(db: Session, amenity_id: int, data: AmenityUpdate) -> Amenity:
    amenity = get_amenity(db, amenity_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(amenity, field, value)
    _commit_unique(db, "An amenity")
    return amenity


def delete_amenity(db: Session, amenity_id: int) -> None:
    db.delete(get_amenity(db, amenity_id))  # links to rooms are removed by ON DELETE CASCADE
    db.commit()


# --- Services --------------------------------------------------------------------------------


def list_services(db: Session, *, include_inactive: bool = False) -> list[Service]:
    query = select(Service).order_by(Service.id)
    if not include_inactive:
        query = query.where(Service.is_active)
    return list(db.scalars(query))


def get_service(db: Session, service_id: int) -> Service:
    service = db.get(Service, service_id)
    if service is None:
        raise NotFoundError("Service not found.", code="service_not_found")
    return service


def create_service(db: Session, data: ServiceCreate) -> Service:
    service = Service(**data.model_dump())
    db.add(service)
    _commit_unique(db, "A service")
    return service


def update_service(db: Session, service_id: int, data: ServiceUpdate) -> Service:
    service = get_service(db, service_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    _commit_unique(db, "A service")
    return service


def delete_service(db: Session, service_id: int) -> None:
    service = get_service(db, service_id)
    if db.scalar(select(exists().where(BookingService.service_id == service.id))):
        raise ConflictError(
            "This service is part of existing bookings. Deactivate it instead.",
            code="service_in_use",
        )
    db.delete(service)
    db.commit()
