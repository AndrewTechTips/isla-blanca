"""Move room panoramas to the tour folder.

The 360° panoramas now live in /images/tour/. Panoramas saved under another /images/ folder are
pointed at the same file name in tour/, so existing databases keep working.

Revision ID: 1a79fdcb8bb2
Revises: a89c13c2f55c
Create Date: 2026-10-18 16:01:17.525500+00:00
"""

from collections.abc import Sequence

from alembic import op

revision: str = "1a79fdcb8bb2"
down_revision: str | Sequence[str] | None = "a89c13c2f55c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        "UPDATE rooms "
        "SET panorama_url = '/images/tour/' || substring(panorama_url from '[^/]+$') "
        "WHERE panorama_url LIKE '/images/%' AND panorama_url NOT LIKE '/images/tour/%'"
    )


def downgrade() -> None:
    # The previous folder is not recorded; the files only exist in tour/ anyway.
    pass
