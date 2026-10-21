"""Shared FastAPI dependencies: database session and the authenticated user."""

from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import User, UserRole
from app.schemas.common import PageParams, page_params

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{get_settings().api_v1_prefix}/auth/login", auto_error=False
)

DbSession = Annotated[Session, Depends(get_db)]
Pagination = Annotated[PageParams, Depends(page_params)]


def get_current_user(db: DbSession, token: Annotated[str | None, Depends(oauth2_scheme)]) -> User:
    user_id = decode_access_token(token) if token else None
    user = db.get(User, user_id) if user_id is not None else None
    if user is None:
        raise UnauthorizedError("Sign in to continue.")
    if not user.is_active:
        raise UnauthorizedError("This account is disabled.", code="account_disabled")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_optional_user(
    db: DbSession, token: Annotated[str | None, Depends(oauth2_scheme)]
) -> User | None:
    """The signed-in user on public endpoints that personalise their answer, else None."""
    user_id = decode_access_token(token) if token else None
    user = db.get(User, user_id) if user_id is not None else None
    return user if user is not None and user.is_active else None


OptionalUser = Annotated[User | None, Depends(get_optional_user)]


def require_admin(user: CurrentUser) -> User:
    if user.role != UserRole.ADMIN:
        raise ForbiddenError("Only resort staff can do this.")
    return user


AdminUser = Annotated[User, Depends(require_admin)]
