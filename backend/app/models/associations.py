"""Pure many-to-many link tables (no extra columns).

Link tables that carry their own data, like `booking_services`, are full models instead.
"""

from sqlalchemy import Column, ForeignKey, Index, Table

from app.db.base import Base

# n-m: rooms <-> amenities
room_amenities = Table(
    "room_amenities",
    Base.metadata,
    Column("room_id", ForeignKey("rooms.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
    # The primary key already indexes room_id first; this covers lookups by amenity.
    Index("ix_room_amenities_amenity_id", "amenity_id"),
)
