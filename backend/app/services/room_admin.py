"""Staff management of rooms: create, edit, photos, amenities, delete."""

from sqlalchemy import exists, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import ConflictError, NotFoundError
from app.models import Amenity, Booking, Room, RoomImage
from app.schemas.room import RoomCreate, RoomImageIn, RoomUpdate


def list_all(db: Session) -> list[Room]:
    query = (
        select(Room)
        .options(selectinload(Room.images), selectinload(Room.amenities))
        .order_by(Room.id)
    )
    return list(db.scalars(query))


def get(db: Session, room_id: int) -> Room:
    room = db.get(Room, room_id, options=[selectinload(Room.images), selectinload(Room.amenities)])
    if room is None:
        raise NotFoundError("Room not found.", code="room_not_found")
    return room


def _amenities(db: Session, ids: list[int]) -> list[Amenity]:
    amenities = list(db.scalars(select(Amenity).where(Amenity.id.in_(ids))))
    missing = set(ids) - {amenity.id for amenity in amenities}
    if missing:
        raise NotFoundError(f"Unknown amenity ids: {sorted(missing)}.", code="amenity_not_found")
    return amenities


def _images(images: list[RoomImageIn]) -> list[RoomImage]:
    return [
        RoomImage(url=image.url, alt_text=image.alt_text, position=position)
        for position, image in enumerate(images)
    ]


def _commit(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ConflictError("A room with this slug already exists.", code="slug_taken") from error


def create(db: Session, data: RoomCreate) -> Room:
    fields = data.model_dump(exclude={"amenity_ids", "images"})
    room = Room(**fields)
    room.amenities = _amenities(db, data.amenity_ids)
    room.images = _images(data.images)
    db.add(room)
    _commit(db)
    return get(db, room.id)


def update(db: Session, room_id: int, data: RoomUpdate) -> Room:
    room = get(db, room_id)
    changes = data.model_dump(exclude_unset=True, exclude={"amenity_ids", "images"})
    for field, value in changes.items():
        setattr(room, field, value)
    if data.amenity_ids is not None:
        room.amenities = _amenities(db, data.amenity_ids)
    if data.images is not None:
        # Remove the old photos first so the (room_id, position) unique constraint holds.
        room.images.clear()
        db.flush()
        room.images = _images(data.images)
    _commit(db)
    return get(db, room.id)


def delete(db: Session, room_id: int) -> None:
    room = get(db, room_id)
    if db.scalar(select(exists().where(Booking.room_id == room.id))):
        raise ConflictError(
            "This room has bookings. Deactivate it instead of deleting it.", code="room_in_use"
        )
    db.delete(room)
    db.commit()
