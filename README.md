# Isla Blanca

A luxury resort booking platform set in Ibiza, "la Isla Blanca". Guests browse suites and villas,
check availability, book stays with extra services and leave reviews; staff manage rooms,
bookings and services from an admin dashboard.

Final project for the Web Application Development course.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS 4, Motion |
| Backend | Python 3.13, FastAPI, SQLAlchemy 2, Alembic, Pydantic, uv |
| Database | PostgreSQL 18 |
| Deployment | Docker, GitHub Actions, GitHub Pages (frontend), Render (API), Neon (database) |

## Project structure

```
isla-blanca/
├── backend/                 FastAPI REST API
│   ├── alembic/             database migrations
│   ├── app/
│   │   ├── api/             HTTP layer: routes and shared dependencies (/api/v1/...)
│   │   ├── core/            settings, security (JWT, Argon2) and error handling
│   │   ├── db/              SQLAlchemy base, session, demo seed
│   │   ├── models/          ORM models, one file per table
│   │   ├── schemas/         Pydantic request and response models
│   │   └── services/        business rules: bookings, pricing, availability, stats
│   └── tests/               pytest suite, runs against a real PostgreSQL
├── .github/workflows/       CI (tests, lint, builds) and the GitHub Pages deploy
├── docker/                  container setup (PostgreSQL init scripts)
├── docs/                    API, database, frontend, design spec, assets
├── frontend/                React + TypeScript single-page app
│   ├── public/images/       photos, icons, video and the 360° panorama
│   └── src/                 pages, sections, UI components, API client, theme
├── docker-compose.yml       database for development, or the whole app in containers
├── render.yaml              Render Blueprint for the API
└── .env.example
```

## Getting started

Requirements: Docker, [uv](https://docs.astral.sh/uv/) and Node.js 22+.

```bash
cp .env.example .env                 # local settings and demo passwords
docker compose up -d db              # PostgreSQL on localhost:5433

cd backend
uv sync                              # install dependencies
uv run alembic upgrade head          # create the tables
uv run python -m app.db.seed         # demo rooms, guests and bookings
uv run fastapi dev app/main.py       # API on http://localhost:8000
```

Interactive API docs: http://localhost:8000/docs (use **Authorize** with a demo account from
`.env` to try the protected routes).

```bash
uv run pytest                        # tests (use the isla_blanca_test database)
uv run ruff check . && uv run ruff format --check .
```

Then the website, in a second terminal:

```bash
cd frontend
npm install
npm run dev                          # http://localhost:5173
npm test                             # frontend tests (Vitest)
```

Demo accounts (admin and guests) are listed in `.env.example`; sign in as the admin to open the
staff dashboard at `/admin`.

### Everything in Docker

```bash
cp .env.example .env
docker compose up --build            # site on http://localhost:8080, API on :8000
```

The API container applies the migrations and loads the demo data on its first start.
Deployment to Neon, Render and GitHub Pages is described in [docs/deployment.md](docs/deployment.md).

## Documentation

- [Deployment: Docker, CI, Render, GitHub Pages, Neon](docs/deployment.md)
- [Frontend: structure, design system, pages](docs/frontend.md)
- [API: architecture, endpoints, booking rules, errors](docs/api.md)
- [Database: diagram, relations and constraints](docs/database.md)
- [Design spec: layout, typography, animations](docs/design-spec.md)
- [Images and media: where each file is used](docs/assets.md)
