"""Add the club discount to bookings.

Each booking records the guest's club tier when they booked and what it took off the room
nights. Existing bookings keep their price: no tier and no discount.

Revision ID: 0cdc836d1f07
Revises: 1a79fdcb8bb2
Create Date: 2026-10-21 13:35:32.827109+00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0cdc836d1f07"
down_revision: str | Sequence[str] | None = "1a79fdcb8bb2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# The type already exists: profiles use it.
membership_tier = postgresql.ENUM(
    "silver", "gold", "platinum", name="membership_tier", create_type=False
)


def upgrade() -> None:
    op.add_column("bookings", sa.Column("member_tier", membership_tier, nullable=True))
    op.add_column(
        "bookings",
        sa.Column(
            "member_discount",
            sa.Numeric(precision=10, scale=2),
            server_default=sa.text("0"),
            nullable=False,
        ),
    )
    op.create_check_constraint(
        op.f("ck_bookings_member_discount_non_negative"), "bookings", "member_discount >= 0"
    )


def downgrade() -> None:
    op.drop_constraint(op.f("ck_bookings_member_discount_non_negative"), "bookings", type_="check")
    op.drop_column("bookings", "member_discount")
    op.drop_column("bookings", "member_tier")
