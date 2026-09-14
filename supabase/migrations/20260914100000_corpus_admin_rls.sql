-- ════════════════════════════════════════════════════════════
-- Migration: corpus_admin_rls
-- Enable RLS on the 4 tables created in 20260914000000.
-- D.6: INV-1 defense in depth — RLS even though these are global tables.
-- ════════════════════════════════════════════════════════════

-- Corpus admin tables are GLOBAL (not tenant-scoped), but we still
-- enable RLS and create policies restricted to LEGAL_ADMIN role
-- as defense in depth per INV-1.

-- norma_fuente_documentos
ALTER TABLE norma_fuente_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE norma_fuente_documentos FORCE ROW LEVEL SECURITY;

CREATE POLICY norma_fuente_documentos_select ON norma_fuente_documentos
  FOR SELECT TO lexdata_app
  USING (true); -- Readable by any authenticated role

CREATE POLICY norma_fuente_documentos_insert ON norma_fuente_documentos
  FOR INSERT TO lexdata_app
  WITH CHECK (
    current_setting('request.jwt.claims', true)::jsonb ->> 'rol'
    IN ('LEGAL_ADMIN', 'SUPERADMIN')
  );

CREATE POLICY norma_fuente_documentos_update ON norma_fuente_documentos
  FOR UPDATE TO lexdata_app
  USING (
    current_setting('request.jwt.claims', true)::jsonb ->> 'rol'
    IN ('LEGAL_ADMIN', 'SUPERADMIN')
  );

CREATE POLICY norma_fuente_documentos_delete ON norma_fuente_documentos
  FOR DELETE TO lexdata_app
  USING (
    current_setting('request.jwt.claims', true)::jsonb ->> 'rol'
    IN ('LEGAL_ADMIN', 'SUPERADMIN')
  );

-- articulos_extraidos
ALTER TABLE articulos_extraidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE articulos_extraidos FORCE ROW LEVEL SECURITY;

CREATE POLICY articulos_extraidos_select ON articulos_extraidos
  FOR SELECT TO lexdata_app USING (true);

CREATE POLICY articulos_extraidos_modify ON articulos_extraidos
  FOR ALL TO lexdata_app
  USING (
    current_setting('request.jwt.claims', true)::jsonb ->> 'rol'
    IN ('LEGAL_ADMIN', 'SUPERADMIN')
  );

-- norma_versiones
ALTER TABLE norma_versiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE norma_versiones FORCE ROW LEVEL SECURITY;

CREATE POLICY norma_versiones_select ON norma_versiones
  FOR SELECT TO lexdata_app USING (true);

CREATE POLICY norma_versiones_insert ON norma_versiones
  FOR INSERT TO lexdata_app
  WITH CHECK (
    current_setting('request.jwt.claims', true)::jsonb ->> 'rol'
    IN ('LEGAL_ADMIN', 'SUPERADMIN')
  );

-- jobs_ingesta
ALTER TABLE jobs_ingesta ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_ingesta FORCE ROW LEVEL SECURITY;

CREATE POLICY jobs_ingesta_select ON jobs_ingesta
  FOR SELECT TO lexdata_app USING (true);

CREATE POLICY jobs_ingesta_modify ON jobs_ingesta
  FOR ALL TO lexdata_app
  USING (true); -- Jobs are created by system, viewable by all

-- Fix D.6: make the FK constraint idempotent
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'normas_fuente_documento_id_fkey'
  ) THEN
    ALTER TABLE normas
      ADD CONSTRAINT normas_fuente_documento_id_fkey
      FOREIGN KEY (fuente_documento_id) REFERENCES norma_fuente_documentos(id)
      ON DELETE SET NULL;
  END IF;
END $$;
