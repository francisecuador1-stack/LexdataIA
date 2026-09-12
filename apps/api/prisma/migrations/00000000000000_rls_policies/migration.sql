-- RLS Policies for LEXDATA IA — SGPDP LOPDP Ecuador
-- Pattern: every request sets app.tenant_id and app.rol via SET LOCAL in transaction

-- ════════════════════════════════════════════════════════════
-- Tenant-isolated tables (INV-1)
-- ════════════════════════════════════════════════════════════

-- Macro: enable RLS + create tenant isolation policy
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'usuarios', 'clientes', 'tratamientos', 'activos', 'riesgos',
      'controles', 'medidas', 'hallazgos', 'evidencias', 'documentos',
      'firmas', 'solicitudes_firma', 'incidentes', 'auditorias',
      'revisiones_tecnicas', 'checklist_respuestas', 'recomendaciones',
      'acciones_correctivas', 'planes_accion', 'brechas',
      'diagnostico_respuestas', 'gobierno_items', 'roles_sgpdp',
      'recursos_evaluacion', 'validacion_principios', 'principios_estado',
      'categorias_datos_tenant', 'evaluaciones_eipd', 'procesos',
      'solicitudes_arco', 'kpi_snapshots', 'madurez_snapshots',
      'lecciones', 'oportunidades_mejora', 'inscripciones',
      'evaluaciones', 'certificados', 'pims_respuestas',
      'solicitudes_registro', 'audit_logs',
      'agente_conversaciones', 'agente_actividad',
      'norma_favoritas', 'norma_vistas',
      'tratamiento_activos'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (tenant_id = current_setting(''app.tenant_id'')::uuid)',
      tbl
    );
  END LOOP;
END
$$;

-- ════════════════════════════════════════════════════════════
-- Corpus normativo — global, read-only para operadores (INV-2)
-- ════════════════════════════════════════════════════════════

ALTER TABLE normas ENABLE ROW LEVEL SECURITY;
CREATE POLICY normas_read ON normas FOR SELECT USING (true);
CREATE POLICY normas_write ON normas FOR ALL
  USING (current_setting('app.rol', true) = 'LEGAL_ADMIN');

ALTER TABLE controles_normativos ENABLE ROW LEVEL SECURITY;
CREATE POLICY controles_normativos_read ON controles_normativos FOR SELECT USING (true);
CREATE POLICY controles_normativos_write ON controles_normativos FOR ALL
  USING (current_setting('app.rol', true) = 'LEGAL_ADMIN');

ALTER TABLE principios_rectores ENABLE ROW LEVEL SECURITY;
CREATE POLICY principios_read ON principios_rectores FOR SELECT USING (true);

ALTER TABLE principio_preguntas_auditoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY principio_preguntas_read ON principio_preguntas_auditoria FOR SELECT USING (true);

-- Catálogos globales
ALTER TABLE categorias_datos ENABLE ROW LEVEL SECURITY;
CREATE POLICY categorias_datos_read ON categorias_datos FOR SELECT USING (true);

ALTER TABLE amenazas ENABLE ROW LEVEL SECURITY;
CREATE POLICY amenazas_read ON amenazas FOR SELECT USING (true);

ALTER TABLE vulnerabilidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY vulnerabilidades_read ON vulnerabilidades FOR SELECT USING (true);

ALTER TABLE diagnostico_dimensiones ENABLE ROW LEVEL SECURITY;
CREATE POLICY dimensiones_read ON diagnostico_dimensiones FOR SELECT USING (true);

ALTER TABLE diagnostico_preguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY preguntas_diag_read ON diagnostico_preguntas FOR SELECT USING (true);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY checklist_items_read ON checklist_items FOR SELECT USING (true);

ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY cursos_read ON cursos FOR SELECT USING (true);

ALTER TABLE curso_preguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY curso_preguntas_read ON curso_preguntas FOR SELECT USING (true);

ALTER TABLE pims_modulos ENABLE ROW LEVEL SECURITY;
CREATE POLICY pims_modulos_read ON pims_modulos FOR SELECT USING (true);

ALTER TABLE pims_preguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY pims_preguntas_read ON pims_preguntas FOR SELECT USING (true);

ALTER TABLE corpus_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY corpus_chunks_read ON corpus_chunks FOR SELECT USING (true);

-- ════════════════════════════════════════════════════════════
-- Append-only constraints (INV-3, INV-4)
-- ════════════════════════════════════════════════════════════

-- Evidencias: no update, no delete
CREATE POLICY evidencias_no_update ON evidencias FOR UPDATE USING (false);
CREATE POLICY evidencias_no_delete ON evidencias FOR DELETE USING (false);

-- Audit log: no update, no delete
CREATE POLICY audit_log_no_update ON audit_logs FOR UPDATE USING (false);
CREATE POLICY audit_log_no_delete ON audit_logs FOR DELETE USING (false);
