-- Force RLS even for table owners (closes the bypass-via-owner loophole).
-- Without FORCE, the table owner (postgres or whatever role created the table)
-- can read all rows regardless of RLS policies.

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'tenants',
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
      'tratamiento_activos', 'proceso_normas', 'agente_mensajes',
      'normas', 'controles_normativos', 'principios_rectores',
      'principio_preguntas_auditoria', 'categorias_datos',
      'amenazas', 'vulnerabilidades', 'diagnostico_dimensiones',
      'diagnostico_preguntas', 'checklist_items', 'cursos',
      'curso_preguntas', 'pims_modulos', 'pims_preguntas',
      'corpus_chunks'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
  END LOOP;
END
$$;
