#!/bin/sh
# Bring the schema up to date, optionally load the demo data, then start the API.
set -e

alembic upgrade head

if [ "$SEED_DEMO_DATA" = "true" ]; then
  # Only fills an empty database, so it is safe on every start.
  python -m app.db.seed
fi

# Render and other hosts sit behind a proxy: trust its X-Forwarded-* headers.
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" \
  --proxy-headers --forwarded-allow-ips "*"
