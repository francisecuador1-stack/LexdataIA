#!/usr/bin/env bash
# Apply all SQL migrations in supabase/migrations/ in alphabetical order.
# Aborts on the first error (ON_ERROR_STOP=1).
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

MIGRATIONS_DIR="$(cd "$(dirname "$0")/../supabase/migrations" && pwd)"

count=0
for f in "$MIGRATIONS_DIR"/*.sql; do
  [ -f "$f" ] || continue
  echo "Applying $(basename "$f")..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
  count=$((count + 1))
done

echo "Applied $count migration(s)."
