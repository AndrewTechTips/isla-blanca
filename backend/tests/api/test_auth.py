from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models import User
from app.services.users import get_by_email
from tests.factories import TEST_PASSWORD, auth_headers, make_user

REGISTER = {
    "email": "New.Guest@Example.com",
    "password": "a-long-password",
    "first_name": "Ana",
    "last_name": "Popescu",
    "country": "Romania",
}


def test_register_creates_guest_with_profile_and_signs_in(client: TestClient, db: Session) -> None:
    response = client.post("/api/v1/auth/register", json=REGISTER)

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == "new.guest@example.com"
    assert body["user"]["role"] == "guest"
    assert body["user"]["profile"]["full_name"] == "Ana Popescu"

    user = get_by_email(db, "new.guest@example.com")
    assert user is not None
    assert user.password_hash != REGISTER["password"]
    assert verify_password(REGISTER["password"], user.password_hash)


def test_register_rejects_a_taken_email(client: TestClient, db: Session) -> None:
    make_user(db, email="new.guest@example.com")

    response = client.post("/api/v1/auth/register", json=REGISTER)

    assert response.status_code == 409
    assert response.json()["code"] == "email_taken"


def test_register_validates_input(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register", json={**REGISTER, "email": "not-an-email", "password": "short"}
    )

    assert response.status_code == 422
    fields = {error["loc"][-1] for error in response.json()["detail"]}
    assert fields == {"email", "password"}


def test_login_returns_a_token_that_works(client: TestClient, db: Session) -> None:
    user = make_user(db, email="sofia@islablanca.test", password=TEST_PASSWORD)

    response = client.post(
        "/api/v1/auth/login", data={"username": "SOFIA@islablanca.test", "password": TEST_PASSWORD}
    )

    assert response.status_code == 200
    token = response.json()["access_token"]
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.json()["id"] == user.id


def test_login_with_wrong_password_or_unknown_email_looks_the_same(
    client: TestClient, db: Session
) -> None:
    make_user(db, email="sofia@islablanca.test", password=TEST_PASSWORD)

    wrong_password = client.post(
        "/api/v1/auth/login", data={"username": "sofia@islablanca.test", "password": "nope-nope"}
    )
    unknown_email = client.post(
        "/api/v1/auth/login", data={"username": "ghost@islablanca.test", "password": "nope-nope"}
    )

    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()


def test_disabled_account_cannot_sign_in(client: TestClient, db: Session) -> None:
    make_user(db, email="old@islablanca.test", password=TEST_PASSWORD, is_active=False)

    response = client.post(
        "/api/v1/auth/login", data={"username": "old@islablanca.test", "password": TEST_PASSWORD}
    )

    assert response.status_code == 401
    assert response.json()["code"] == "account_disabled"


def test_me_requires_a_valid_token(client: TestClient) -> None:
    assert client.get("/api/v1/auth/me").status_code == 401
    bad = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not.a.token"})
    assert bad.status_code == 401
    assert bad.headers["www-authenticate"] == "Bearer"


def test_update_profile_changes_only_sent_fields(client: TestClient, db: Session) -> None:
    user: User = make_user(db)

    response = client.patch(
        "/api/v1/auth/me", json={"phone": "+40 721 000 000"}, headers=auth_headers(user)
    )

    assert response.status_code == 200
    profile = response.json()["profile"]
    assert profile["phone"] == "+40 721 000 000"
    assert profile["first_name"] == "Test"
