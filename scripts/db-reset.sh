#!/usr/bin/env bash
# Reset the database: drop → apply migrations → generate Prisma client → seed.
# Safety: refuses to run against a non-local database unless
# LEXDATA_ALLOW_REMOTE_RESET=yes is set.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

# Guard against accidental reset of staging/prod
if [[ "$DATABASE_URL" != *"localhost"* && "$DATABASE_URL" != *"127.0.0.1"* && "$DATABASE_URL" != *"host.docker.internal"* ]]; then
  if [ "${LEXDATA_ALLOW_REMOTE_RESET:-}" != "yes" ]; then
    echo "ERROR: DATABASE_URL does not point to localhost." >&2
    echo "       Set LEXDATA_ALLOW_REMOTE_RESET=yes to override." >&2
    echo "       URL prefix: ${DATABASE_URL:0:40}..." >&2
    exit 1
  fi
  echo "WARNING: Resetting a REMOTE database (LEXDATA_ALLOW_REMOTE_RESET=yes)."
fi

echo "Dropping and recreating public schema..."
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "Applying migrations..."
bash "$(dirname "$0")/db-apply.sh"

echo "Generating Prisma client..."
pnpm --filter @lexdata/api exec prisma generate

echo "Seeding database..."
pnpm --filter @lexdata/api exec tsx prisma/seed.ts

echo "Database reset complete."
