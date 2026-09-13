-- Grant LOGIN to lexdata_app if it was created with NOLOGIN.
-- The initial migration creates lexdata_app as NOLOGIN; this migration
-- ensures the API can connect with this role.
--
-- Password must be set manually per environment (not stored in migrations):
--   ALTER ROLE lexdata_app PASSWORD 'your-secure-password';
--
-- See docs/RUNBOOK.md for provisioning instructions.

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'lexdata_app') THEN
    ALTER ROLE lexdata_app LOGIN;
  END IF;
END
$$;
