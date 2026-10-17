from datetime import datetime
from typing import Annotated

from pydantic import EmailStr, Field, StringConstraints

from app.models.enums import MembershipTier, UserRole
from app.schemas.common import Schema

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]
Phone = Annotated[str, StringConstraints(strip_whitespace=True, max_length=32)]
Password = Annotated[str, Field(min_length=8, max_length=128)]


class ProfileRead(Schema):
    first_name: str
    last_name: str
    full_name: str
    phone: str | None
    country: str | None
    avatar_url: str | None
    membership_tier: MembershipTier


class UserRead(Schema):
    id: int
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    profile: ProfileRead


class ProfileUpdate(Schema):
    first_name: Name | None = None
    last_name: Name | None = None
    phone: Phone | None = None
    country: Annotated[str, StringConstraints(max_length=80)] | None = None
    avatar_url: Annotated[str, StringConstraints(max_length=500)] | None = None


class RegisterRequest(Schema):
    email: EmailStr
    password: Password
    first_name: Name
    last_name: Name
    phone: Phone | None = None
    country: Annotated[str, StringConstraints(max_length=80)] | None = None


class TokenResponse(Schema):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead
