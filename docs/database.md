# Database

PostgreSQL 18, accessed through SQLAlchemy 2 and versioned with Alembic migrations
(`backend/alembic/versions/`). Ten tables:

```mermaid
erDiagram
    users ||--|| profiles : "has (1-1)"
    users ||--o{ bookings : "makes (1-n)"
    rooms ||--o{ bookings : "is booked in (1-n)"
    rooms ||--o{ room_images : "has photos (1-n)"
    rooms ||--o{ room_amenities : ""
    amenities ||--o{ room_amenities : "n-m"
    bookings ||--o{ booking_services : ""
    services ||--o{ booking_services : "n-m"
    bookings ||--o| reviews : "is reviewed in (1-1)"

    users {
        int id PK
        varchar email UK "lowercase"
        varchar password_hash "argon2id"
        user_role role "guest | admin"
        bool is_active
    }
    profiles {
        int user_id PK, FK "shared primary key"
        varchar first_name
        varchar last_name
        varchar phone
        varchar country
        varchar avatar_url
        membership_tier membership_tier "silver | gold | platinum"
    }
    rooms {
        int id PK
        varchar slug UK
        varchar name
        varchar tagline
        text description
        numeric price_per_night "> 0"
        smallint size_m2
        bed_type bed_type
        smallint max_guests "1-12"
        varchar panorama_url "360° tour"
        bool is_active
    }
    room_images {
        int id PK
        int room_id FK
        varchar url
        varchar alt_text
        smallint position "unique per room, 0 = cover"
    }
    amenities {
        int id PK
        varchar slug UK
        varchar name UK
        varchar icon
    }
    room_amenities {
        int room_id PK, FK
        int amenity_id PK, FK
    }
    bookings {
        int id PK
        varchar reference UK "IB-XXXXXX"
        int user_id FK
        int room_id FK
        date check_in
        date check_out "> check_in"
        smallint adults ">= 1"
        smallint children
        booking_status status "pending | confirmed | cancelled | completed"
        numeric total_price
        text special_requests
    }
    services {
        int id PK
        varchar slug UK
        varchar name
        text description
        numeric price
        pricing_unit pricing_unit "per_stay | per_night | per_guest"
        varchar icon
        bool is_active
    }
    booking_services {
        int booking_id PK, FK
        int service_id PK, FK
        smallint quantity "> 0"
        numeric unit_price "price snapshot"
    }
    reviews {
        int id PK
        int booking_id FK, UK
        smallint rating "1-5"
        varchar title
        text comment
    }
```

Every table except the two link tables and `room_images` also has `created_at` and
`updated_at` (`timestamptz`).

## Relations

| Type | Where | How it is enforced |
|---|---|---|
| **1-1** | `users` ↔ `profiles` | `profiles.user_id` is both primary key and foreign key, so a second profile for the same user is impossible. Deleting a user deletes the profile (`ON DELETE CASCADE`). |
| **1-1** | `bookings` ↔ `reviews` | `reviews.booking_id` is `UNIQUE`: one review per stay, only for real stays. |
| **1-n** | `users` → `bookings`, `rooms` → `bookings` | `ON DELETE RESTRICT`: a user or a room with bookings can't be deleted, the booking history stays intact. |
| **1-n** | `rooms` → `room_images` | Ordered by `position`; photos are deleted with the room. |
| **n-m** | `rooms` ↔ `amenities` | Pure link table `room_amenities` with a composite primary key. |
| **n-m** | `bookings` ↔ `services` | Association table `booking_services` that carries its own data: `quantity` and `unit_price` (the price at booking time, so later price changes never alter past bookings). |

## Rules enforced by the database

- **No double bookings.** An exclusion constraint (`ex_bookings_no_overlapping_stays`, GiST
  index via the `btree_gist` extension) rejects two active bookings of the same room with
  overlapping `[check_in, check_out)` ranges. Cancelled bookings don't count, and the checkout
  day is free for the next guest.
- Check constraints for every numeric rule: positive prices, `check_out > check_in`, at least
  one adult, rating between 1 and 5, quantity above zero.
- Emails are unique and stored lowercase.
- Native PostgreSQL enums for roles, membership tiers, bed types, booking statuses and pricing
  units.
- Deterministic constraint names (`pk_`, `fk_`, `uq_`, `ck_`, `ix_` prefixes), so migrations are
  readable and errors point to the exact rule that failed.

## Demo data

`uv run python -m app.db.seed` (or `--reset`) creates 10 rooms with 24 photos, 8 amenities,
5 services, an admin and two guests with profiles, and 6 bookings (completed with and without
a review, confirmed, pending and cancelled) with dates relative to the day the seed runs. Demo
credentials come from `.env` (see `.env.example`).
