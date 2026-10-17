"""Initial schema: users, profiles, rooms, amenities, bookings, services, reviews.

Revision ID: a89c13c2f55c
Revises:
Create Date: 2026-10-17 13:25:41.011217+00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "a89c13c2f55c"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


ENUM_TYPES = ("booking_status", "membership_tier", "user_role", "pricing_unit", "bed_type")


def upgrade() -> None:
    # Needed by the exclusion constraint that prevents overlapping bookings (GiST index on
    # a plain integer column together with a date range).
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist")

    op.create_table(
        "amenities",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("icon", sa.String(length=80), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_amenities")),
        sa.UniqueConstraint("name", name=op.f("uq_amenities_name")),
        sa.UniqueConstraint("slug", name=op.f("uq_amenities_slug")),
    )
    op.create_table(
        "rooms",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("tagline", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("price_per_night", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("size_m2", sa.SmallInteger(), nullable=False),
        sa.Column(
            "bed_type",
            sa.Enum("single", "double", "queen", "king", name="bed_type"),
            nullable=False,
        ),
        sa.Column("max_guests", sa.SmallInteger(), nullable=False),
        sa.Column("panorama_url", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("max_guests BETWEEN 1 AND 12", name=op.f("ck_rooms_max_guests_range")),
        sa.CheckConstraint("price_per_night > 0", name=op.f("ck_rooms_price_positive")),
        sa.CheckConstraint("size_m2 > 0", name=op.f("ck_rooms_size_positive")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_rooms")),
        sa.UniqueConstraint("slug", name=op.f("uq_rooms_slug")),
    )
    op.create_table(
        "services",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column(
            "pricing_unit",
            sa.Enum("per_stay", "per_night", "per_guest", name="pricing_unit"),
            nullable=False,
        ),
        sa.Column("icon", sa.String(length=80), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("price >= 0", name=op.f("ck_services_price_non_negative")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_services")),
        sa.UniqueConstraint("slug", name=op.f("uq_services_slug")),
    )
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("guest", "admin", name="user_role"),
            server_default="guest",
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("email = lower(email)", name=op.f("ck_users_email_lowercase")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
    )
    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("reference", sa.String(length=12), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("room_id", sa.Integer(), nullable=False),
        sa.Column("check_in", sa.Date(), nullable=False),
        sa.Column("check_out", sa.Date(), nullable=False),
        sa.Column("adults", sa.SmallInteger(), nullable=False),
        sa.Column("children", sa.SmallInteger(), server_default=sa.text("0"), nullable=False),
        sa.Column(
            "status",
            sa.Enum("pending", "confirmed", "cancelled", "completed", name="booking_status"),
            server_default="pending",
            nullable=False,
        ),
        sa.Column("total_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("special_requests", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        postgresql.ExcludeConstraint(
            (sa.column("room_id"), "="),
            (sa.text("daterange(check_in, check_out, '[)')"), "&&"),
            where=sa.text("status <> 'cancelled'"),
            using="gist",
            name="ex_bookings_no_overlapping_stays",
        ),
        sa.CheckConstraint("adults >= 1", name=op.f("ck_bookings_at_least_one_adult")),
        sa.CheckConstraint("check_out > check_in", name=op.f("ck_bookings_dates_ordered")),
        sa.CheckConstraint("children >= 0", name=op.f("ck_bookings_children_non_negative")),
        sa.CheckConstraint("total_price >= 0", name=op.f("ck_bookings_total_price_non_negative")),
        sa.ForeignKeyConstraint(
            ["room_id"], ["rooms.id"], name=op.f("fk_bookings_room_id_rooms"), ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_bookings_user_id_users"), ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_bookings")),
        sa.UniqueConstraint("reference", name=op.f("uq_bookings_reference")),
    )
    op.create_index(op.f("ix_bookings_room_id"), "bookings", ["room_id"], unique=False)
    op.create_index(op.f("ix_bookings_status"), "bookings", ["status"], unique=False)
    op.create_index(op.f("ix_bookings_user_id"), "bookings", ["user_id"], unique=False)
    op.create_table(
        "profiles",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("first_name", sa.String(length=80), nullable=False),
        sa.Column("last_name", sa.String(length=80), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("country", sa.String(length=80), nullable=True),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column(
            "membership_tier",
            sa.Enum("silver", "gold", "platinum", name="membership_tier"),
            server_default="silver",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_profiles_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("user_id", name=op.f("pk_profiles")),
    )
    op.create_table(
        "room_amenities",
        sa.Column("room_id", sa.Integer(), nullable=False),
        sa.Column("amenity_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["amenity_id"],
            ["amenities.id"],
            name=op.f("fk_room_amenities_amenity_id_amenities"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["room_id"],
            ["rooms.id"],
            name=op.f("fk_room_amenities_room_id_rooms"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("room_id", "amenity_id", name=op.f("pk_room_amenities")),
    )
    op.create_index("ix_room_amenities_amenity_id", "room_amenities", ["amenity_id"], unique=False)
    op.create_table(
        "room_images",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("room_id", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("alt_text", sa.String(length=255), nullable=False),
        sa.Column("position", sa.SmallInteger(), nullable=False),
        sa.CheckConstraint("position >= 0", name=op.f("ck_room_images_position_non_negative")),
        sa.ForeignKeyConstraint(
            ["room_id"], ["rooms.id"], name=op.f("fk_room_images_room_id_rooms"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_room_images")),
        sa.UniqueConstraint("room_id", "position", name=op.f("uq_room_images_room_id_position")),
    )
    op.create_index(op.f("ix_room_images_room_id"), "room_images", ["room_id"], unique=False)
    op.create_table(
        "booking_services",
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.SmallInteger(), nullable=False),
        sa.Column("unit_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.CheckConstraint("quantity > 0", name=op.f("ck_booking_services_quantity_positive")),
        sa.CheckConstraint(
            "unit_price >= 0", name=op.f("ck_booking_services_unit_price_non_negative")
        ),
        sa.ForeignKeyConstraint(
            ["booking_id"],
            ["bookings.id"],
            name=op.f("fk_booking_services_booking_id_bookings"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["service_id"],
            ["services.id"],
            name=op.f("fk_booking_services_service_id_services"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("booking_id", "service_id", name=op.f("pk_booking_services")),
    )
    op.create_index(
        op.f("ix_booking_services_service_id"), "booking_services", ["service_id"], unique=False
    )
    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.SmallInteger(), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("rating BETWEEN 1 AND 5", name=op.f("ck_reviews_rating_range")),
        sa.ForeignKeyConstraint(
            ["booking_id"],
            ["bookings.id"],
            name=op.f("fk_reviews_booking_id_bookings"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_reviews")),
        sa.UniqueConstraint("booking_id", name=op.f("uq_reviews_booking_id")),
    )


def downgrade() -> None:
    op.drop_table("reviews")
    op.drop_index(op.f("ix_booking_services_service_id"), table_name="booking_services")
    op.drop_table("booking_services")
    op.drop_index(op.f("ix_room_images_room_id"), table_name="room_images")
    op.drop_table("room_images")
    op.drop_index("ix_room_amenities_amenity_id", table_name="room_amenities")
    op.drop_table("room_amenities")
    op.drop_table("profiles")
    op.drop_index(op.f("ix_bookings_user_id"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_status"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_room_id"), table_name="bookings")
    op.drop_table("bookings")
    op.drop_table("users")
    op.drop_table("services")
    op.drop_table("rooms")
    op.drop_table("amenities")
    for enum_type in ENUM_TYPES:
        op.execute(f"DROP TYPE IF EXISTS {enum_type}")
