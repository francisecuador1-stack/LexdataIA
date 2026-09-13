#!/usr/bin/env bash
# Apply SQL migrations from supabase/migrations/ in alphabetical order.
#
# Tracks applied migrations in a `schema_migrations` table (filename PK,
# applied_at, checksum). Each migration runs inside a transaction together
# with its INSERT into the ledger — all or nothing.
#
# - Already-applied files are skipped.
# - If a file was applied but its checksum changed, the script aborts
#   (an applied migration must not be edited; create a new one instead).
#
# Why not `supabase db push`? It requires the Supabase CLI linked to a
# project and doesn't work with plain Postgres or in CI without extra
# config. A self-contained ledger keeps the toolchain simple.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

MIGRATIONS_DIR="$(cd "$(dirname "$0")/../supabase/migrations" && pwd)"

# Ensure the ledger table exists (idempotent).
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename    text PRIMARY KEY,
  checksum    text NOT NULL,
  applied_at  timestamptz NOT NULL DEFAULT now()
);
SQL

applied=0
skipped=0

for f in "$MIGRATIONS_DIR"/*.sql; do
  [ -f "$f" ] || continue
  filename="$(basename "$f")"
  checksum="$(sha256sum "$f" | cut -d' ' -f1)"

  # Check if already applied
  existing_checksum="$(psql "$DATABASE_URL" -tAq \
    -c "SELECT checksum FROM schema_migrations WHERE filename = '$filename'" 2>/dev/null || true)"

  if [ -n "$existing_checksum" ]; then
    # Verify checksum hasn't changed
    if [ "$existing_checksum" != "$checksum" ]; then
      echo "ERROR: Migration $filename was already applied with checksum" >&2
      echo "  applied:  $existing_checksum" >&2
      echo "  current:  $checksum" >&2
      echo "  An applied migration must not be edited. Create a new migration instead." >&2
      exit 1
    fi
    echo "  skipping $filename (already applied)"
    skipped=$((skipped + 1))
    continue
  fi

  # Apply inside a transaction: migration SQL + ledger INSERT
  echo "  applying $filename..."
  {
    echo "BEGIN;"
    cat "$f"
    echo ""
    echo "INSERT INTO schema_migrations (filename, checksum) VALUES ('$filename', '$checksum');"
    echo "COMMIT;"
  } | psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q

  applied=$((applied + 1))
done

echo "Migrations: $applied applied, $skipped skipped."
