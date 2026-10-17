from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.enums import MembershipTier, pg_enum

if TYPE_CHECKING:
    from app.models.user import User


class Profile(TimestampMixin, Base):
    """Guest details, in a strict 1-1 relation with `User`.

    The primary key is also the foreign key to `users.id` (shared primary key), so the
    database itself guarantees a user can never have more than one profile.
    """

    __tablename__ = "profiles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    first_name: Mapped[str] = mapped_column(String(80))
    last_name: Mapped[str] = mapped_column(String(80))
    phone: Mapped[str | None] = mapped_column(String(32))
    country: Mapped[str | None] = mapped_column(String(80))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    membership_tier: Mapped[MembershipTier] = mapped_column(
        pg_enum(MembershipTier, "membership_tier"),
        default=MembershipTier.SILVER,
        server_default=MembershipTier.SILVER,
    )

    user: Mapped["User"] = relationship(back_populates="profile")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
