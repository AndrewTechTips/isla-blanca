# Isla Blanca

A luxury resort booking platform set in Ibiza, "la Isla Blanca". Guests browse suites and villas,
check availability, book stays with extra services and leave reviews; staff manage rooms,
bookings and services from an admin dashboard.

Final project for the Web Application Development course.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS, Motion |
| Backend | Python 3.13, FastAPI, SQLAlchemy 2, Alembic, Pydantic, uv |
| Database | PostgreSQL 18 |
| Deployment | Docker, GitHub Pages (frontend), Render (API) |

## Project structure

```
isla-blanca/
├── assets/                  design assets from the original template (assets/ASSETS.md)
├── backend/                 FastAPI REST API
│   ├── alembic/             database migrations
│   ├── app/
│   │   ├── api/             HTTP layer: routers and endpoints (/api/v1/...)
│   │   ├── core/            settings and security (password hashing)
│   │   ├── db/              SQLAlchemy base, session, demo seed
│   │   ├── models/          ORM models, one file per table
│   │   └── services/        business rules (pricing, ...)
│   └── tests/               pytest suite, runs against a real PostgreSQL
├── docker/                  container setup (PostgreSQL init scripts)
├── docs/                    database diagram, design spec
├── frontend/                React application (coming next)
├── docker-compose.yml
└── .env.example
```

## Getting started

Requirements: Docker and [uv](https://docs.astral.sh/uv/).

```bash
cp .env.example .env                 # local settings and demo passwords
docker compose up -d db              # PostgreSQL on localhost:5433

cd backend
uv sync                              # install dependencies
uv run alembic upgrade head          # create the tables
uv run python -m app.db.seed         # demo rooms, guests and bookings
uv run fastapi dev app/main.py       # API on http://localhost:8000
```

Interactive API docs: http://localhost:8000/docs

```bash
uv run pytest                        # tests (use the isla_blanca_test database)
uv run ruff check . && uv run ruff format --check .
```

## Documentation

- [Database: diagram, relations and constraints](docs/database.md)
- [Design spec: layout, typography, animations](docs/design-spec.md)

## Credits

Visual design based on the free Framer templates
[Aurelia Hotel](https://www.framer.com/marketplace/templates/aurelia-hotel/) by Slashdown and
[Sereno 360° Resort](https://www.framer.com/marketplace/templates/sereno-360-resort/) by on3step,
used under the Framer Community free content license. Photography and icons belong to their
original authors. The application code, database and features are our own work.
