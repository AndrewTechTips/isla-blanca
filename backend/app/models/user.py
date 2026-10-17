from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, String, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.models.enums import UserRole, pg_enum

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.profile import Profile


class User(IdMixin, TimestampMixin, Base):
    """Login identity. Personal details live in the 1-1 `Profile`."""

    __tablename__ = "users"
    __table_args__ = (CheckConstraint("email = lower(email)", name="email_lowercase"),)

    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(
        pg_enum(UserRole, "user_role"), default=UserRole.GUEST, server_default=UserRole.GUEST
    )
    is_active: Mapped[bool] = mapped_column(default=True, server_default=true())

    # 1-1: a user has exactly one profile, deleted together with the user.
    profile: Mapped["Profile"] = relationship(
        back_populates="user", cascade="all, delete-orphan", single_parent=True
    )
    # 1-n: a user makes many bookings (deletion is blocked by the database while any exist).
    bookings: Mapped[list["Booking"]] = relationship(back_populates="user", passive_deletes="all")

    def __repr__(self) -> str:
        return f"<User {self.id} {self.email}>"
