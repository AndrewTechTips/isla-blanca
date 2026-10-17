from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, DbSession
from app.core.security import create_access_token
from app.models import User
from app.schemas.common import ErrorResponse
from app.schemas.user import ProfileUpdate, RegisterRequest, TokenResponse, UserRead
from app.services import users

router = APIRouter(prefix="/auth", tags=["auth"])


def _token_for(user: User) -> TokenResponse:
    token, expires_in = create_access_token(user.id)
    return TokenResponse(
        access_token=token, expires_in=expires_in, user=UserRead.model_validate(user)
    )


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": ErrorResponse, "description": "Email already registered"}},
    summary="Create a guest account and sign in",
)
def register(data: RegisterRequest, db: DbSession) -> TokenResponse:
    return _token_for(users.register(db, data))


@router.post(
    "/login",
    response_model=TokenResponse,
    responses={401: {"model": ErrorResponse, "description": "Wrong email or password"}},
    summary="Sign in with email (as `username`) and password",
)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession) -> TokenResponse:
    return _token_for(users.authenticate(db, form.username, form.password))


@router.get("/me", response_model=UserRead, summary="The signed-in user")
def read_me(user: CurrentUser) -> User:
    return user


@router.patch("/me", response_model=UserRead, summary="Update the signed-in user's profile")
def update_me(data: ProfileUpdate, user: CurrentUser, db: DbSession) -> User:
    return users.update_profile(db, user, data)
