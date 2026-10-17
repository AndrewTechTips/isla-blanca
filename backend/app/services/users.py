"""Accounts: registration, login and profile updates."""

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import hash_password, verify_password
from app.models import Profile, User
from app.schemas.common import Page, PageParams
from app.schemas.user import ProfileUpdate, RegisterRequest, UserRead
from app.services.pagination import paginate


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


def register(db: Session, data: RegisterRequest) -> User:
    email = data.email.lower()
    if get_by_email(db, email) is not None:
        raise ConflictError("An account with this email already exists.", code="email_taken")

    user = User(
        email=email,
        password_hash=hash_password(data.password),
        profile=Profile(
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            country=data.country,
        ),
    )
    db.add(user)
    db.commit()
    return user


def authenticate(db: Session, email: str, password: str) -> User:
    user = get_by_email(db, email)
    # Always run the hash check, even for unknown emails, so timing reveals nothing.
    password_ok = verify_password(password, user.password_hash if user else None)
    if user is None or not password_ok:
        raise UnauthorizedError("Incorrect email or password.", code="invalid_credentials")
    if not user.is_active:
        raise UnauthorizedError("This account is disabled.", code="account_disabled")
    return user


def list_users(db: Session, params: PageParams) -> Page[UserRead]:
    query = select(User).options(selectinload(User.profile)).order_by(User.id)
    items, total = paginate(db, query, params)
    return Page.build(
        [UserRead.model_validate(user) for user in items],
        total=total,
        page=params.page,
        size=params.size,
    )


def update_profile(db: Session, user: User, data: ProfileUpdate) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user.profile, field, value)
    db.commit()
    return user
