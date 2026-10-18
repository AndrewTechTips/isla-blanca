# Deployment

```
GitHub Pages (static site)  ──HTTPS──▶  Render (API, Docker)  ──TLS──▶  Neon (PostgreSQL)
andrewtechtips.github.io/isla-blanca     isla-blanca-api.onrender.com
```

| Part | Where | How it gets there |
|---|---|---|
| Website | GitHub Pages | `.github/workflows/pages.yml` builds it on every push to `main` |
| API | Render, free web service | `render.yaml` Blueprint, built from `backend/Dockerfile` |
| Database | Neon, free PostgreSQL | migrations run by the API container on every start |

## Containers

| Image | Dockerfile | Contents |
|---|---|---|
| API | `backend/Dockerfile` | Python 3.13 slim, dependencies installed by uv from `uv.lock`, runs as a non-root user, has a health check |
| Website | `frontend/Dockerfile` | Built with Node 24, served by nginx, which also forwards `/api` to the API |

When the API container starts (`backend/docker-entrypoint.sh`) it:

1. runs `alembic upgrade head`, so the schema always matches the code;
2. loads the demo data if `SEED_DEMO_DATA=true` (only into an empty database);
3. starts uvicorn on `$PORT` and trusts the host's proxy headers.

### Everything locally in Docker

```bash
cp .env.example .env          # once
docker compose up --build     # database, API and website
```

- Website: http://localhost:8080 (nginx forwards `/api` to the API, like the Vite dev server does)
- API docs: http://localhost:8000/docs

For day-to-day development only the database runs in Docker (`docker compose up -d db`), and the
API and site run from source with live reload (see the README).

## Configuration

API (environment variables, read by `app/core/config.py`):

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | `postgres://` and `postgresql://` URLs from hosting providers are accepted as they are |
| `JWT_SECRET_KEY` | 48+ random characters | Render generates one |
| `CORS_ORIGINS` | `["https://andrewtechtips.github.io"]` | JSON list of sites allowed to call the API |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `120` | |
| `SEED_DEMO_DATA` | `true` | Fills an empty database with the demo content |
| `SEED_ADMIN_PASSWORD`, `SEED_GUEST_PASSWORD` | | Passwords of the demo accounts |

Website (build time, set by the Pages workflow):

| Variable | Value | Notes |
|---|---|---|
| `VITE_BASE` | `/isla-blanca/` | Pages serves the site from a folder; links and files get this prefix (`lib/assets.ts`) |
| `VITE_API_URL` | the Render URL | From the repository variable `API_URL` |

## First deployment

1. **Database (Neon)**: create a project (region: Frankfurt, PostgreSQL 17 or newer) and copy its
   connection string.
2. **API (Render)**: Dashboard → New → Blueprint → this repository. Render reads `render.yaml`
   and asks for `DATABASE_URL` (the Neon string) and the two demo passwords. The first deploy
   creates the tables and the demo data; check `https://<service>.onrender.com/api/v1/health`.
3. **Website (GitHub Pages)**: in the repository settings, Pages → Source: GitHub Actions, and
   Secrets and variables → Actions → Variables → `API_URL` = the Render address. Push to `main`
   (or run the workflow by hand); the site appears at `https://andrewtechtips.github.io/isla-blanca/`.
4. If the site's address differs, update `CORS_ORIGINS` on Render.

## Things to know

- Render's free services sleep after 15 minutes without traffic; the first request after that
  takes about a minute while the API wakes up.
- GitHub Pages cannot rewrite URLs, so the workflow copies `index.html` to `404.html`: opening a
  deep link such as `/isla-blanca/rooms/infinity-pool-villa` loads the app, which shows the page.
- CI (`.github/workflows/ci.yml`) runs the API tests against PostgreSQL, the site's lint, tests
  and build, and builds both Docker images on every push and pull request.
