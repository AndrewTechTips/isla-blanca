# API

REST API under `/api/v1`, documented live with Swagger UI at `http://localhost:8000/docs`
(OpenAPI schema at `/openapi.json`).

## Architecture

Each request goes through the same layers, and each layer only talks to the one below it:

```
api/routes/*    HTTP: paths, status codes, auth dependencies, request/response schemas
     │
schemas/*       Pydantic models: validate input, shape output (never ORM objects directly)
     │
services/*      Business rules: pricing, availability, booking lifecycle, permissions
     │
models/*        SQLAlchemy ORM over PostgreSQL, which enforces the final guarantees
```

- Routes contain no queries. They call one service function and return its result.
- Services raise domain errors (`NotFoundError`, `ConflictError`, `BusinessRuleError`, ...)
  that a single handler in `core/exceptions.py` turns into HTTP responses.
- Shared dependencies (`DbSession`, `CurrentUser`, `AdminUser`, `Pagination`) live in
  `api/deps.py`.

## Authentication

- `POST /auth/register` creates a guest account and returns a token.
- `POST /auth/login` takes the OAuth2 password form (`username` = email, `password`) and returns
  `{ access_token, token_type: "bearer", expires_in, user }`.
- Send `Authorization: Bearer <token>` on protected routes. In Swagger, use **Authorize**.
- Tokens are JWTs signed with HS256 (`JWT_SECRET_KEY`), valid for `ACCESS_TOKEN_EXPIRE_MINUTES`.
- Passwords are hashed with Argon2id. A wrong password and an unknown email return the same
  response and take the same time, so accounts can't be discovered through the login form.
- Roles: `guest` and `admin`. Every `/admin/*` route requires an admin.

## Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | public | API and database status |
| POST | `/auth/register` | public | Create a guest account |
| POST | `/auth/login` | public | Sign in |
| GET | `/auth/me` | signed in | Current user with profile |
| PATCH | `/auth/me` | signed in | Update the profile |
| GET | `/rooms` | public | Search rooms (see filters below) |
| GET | `/rooms/{slug}` | public | Room details: photos, amenities, rating |
| GET | `/rooms/{slug}/availability` | public | Booked date ranges for a calendar |
| GET | `/rooms/{slug}/reviews` | public | Reviews, newest first |
| GET | `/amenities` | public | Amenity list |
| GET | `/services` | public | Active extras |
| POST | `/bookings/quote` | public | Price breakdown for a stay |
| POST | `/bookings` | guest | Book a room |
| GET | `/bookings` | guest | My bookings |
| GET | `/bookings/{reference}` | owner or admin | One booking |
| POST | `/bookings/{reference}/cancel` | owner or admin | Cancel before arrival |
| POST | `/bookings/{reference}/review` | owner | Review a finished stay |
| GET | `/admin/stats` | admin | Dashboard numbers |
| GET | `/admin/bookings` | admin | All bookings, filter by status, room, guest email |
| PATCH | `/admin/bookings/{reference}` | admin | Change status |
| GET | `/admin/users` | admin | All accounts |
| GET, POST | `/admin/rooms` | admin | All rooms (incl. inactive), create |
| PATCH, DELETE | `/admin/rooms/{id}` | admin | Edit (photos and amenities replaced when sent), delete |
| GET, POST | `/admin/services` | admin | All services, create |
| PATCH, DELETE | `/admin/services/{id}` | admin | Edit, delete |
| POST | `/admin/amenities` | admin | Create |
| PATCH, DELETE | `/admin/amenities/{id}` | admin | Edit, delete |

### Room search filters

`GET /rooms?check_in=2026-11-01&check_out=2026-11-04&guests=2&min_price=200&max_price=500&amenities=wifi&amenities=minibar&sort=price_asc&page=1&size=12`

- With dates, only rooms free for the whole stay are returned.
- `amenities` can repeat; a room must have all of them.
- `sort`: `recommended`, `price_asc`, `price_desc`, `size_desc`.

Lists are paginated: `{ items, total, page, size, pages }`.

## Booking rules

| Rule | Where it is enforced | Error |
|---|---|---|
| Dates: `check_out > check_in`, at most 30 nights | request schema | 422 |
| No check-in in the past | service | 422 `check_in_in_past` |
| Guests (adults + children) ≤ room capacity | service | 422 `too_many_guests` |
| Room free for the dates | service, then the database exclusion constraint for simultaneous requests | 409 `room_unavailable` |
| Services must exist and be active, each at most once | schema and service | 422 / 404 |
| Price is always computed on the server; service prices are stored per booking | service | — |
| Cancel only active bookings before the check-in day | service | 422 `booking_not_cancellable` |
| One review per stay, only after checkout, not for cancelled stays | service and database | 409 / 422 |
| Admin status changes: pending → confirmed/cancelled, confirmed → completed/cancelled | service | 422 `invalid_status_change` |
| Rooms and services that appear in bookings can't be deleted, only deactivated | service and `ON DELETE RESTRICT` | 409 |

Service quantity defaults to the pricing unit: `per_stay` = 1, `per_night` = nights,
`per_guest` = guests. The guest can override it.

## Errors

Every error has the same shape:

```json
{ "detail": "The room is already booked for these dates.", "code": "room_unavailable" }
```

`detail` is a readable message for the UI, `code` is stable for the frontend to branch on.
Request validation errors keep FastAPI's standard 422 format with a list of field errors.

## Tests

`uv run pytest`: 74 tests against a real PostgreSQL database, covering authentication, room
search and availability, the full booking lifecycle, admin permissions and CRUD, dashboard
numbers, the database relations and constraints, and the migrations.
