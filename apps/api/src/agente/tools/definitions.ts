export const TOOL_DEFINITIONS = [
  {
    name: 'buscar_norma',
    description: 'Busca en el corpus normativo ecuatoriano (LOPDP, RGLOPDP, CRE, resoluciones SPDP/SGPDP, ISO, NIST). Devuelve artículos relevantes con sus citas y hashes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Texto de búsqueda' },
        fuente: { type: 'string', description: 'Filtro por fuente: LOPDP, RGLOPDP, CRE, SPDP, SGPDP, ISO_27001, ISO_27701, ISO_42001, NIST' },
      },
      required: ['query'],
    },
  },
  {
    name: 'estado_rat',
    description: 'Estado del Registro de Actividades de Tratamiento del cliente activo.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'resumen_riesgos',
    description: 'Resumen de riesgos del cliente activo: conteo por nivel, zona roja, EIPD obligatorias.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'listar_hallazgos',
    description: 'Lista hallazgos del cliente activo con filtros opcionales.',
    input_schema: {
      type: 'object' as const,
      properties: {
        estado: { type: 'string', description: 'ABIERTO, EN_PROCESO, CERRADO' },
        tipo: { type: 'string', description: 'NC_MAYOR, NC_MENOR, OBSERVACION' },
      },
    },
  },
  {
    name: 'estado_incidentes',
    description: 'Incidentes de seguridad activos con horas restantes al plazo de 72h.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'dpas_pendientes',
    description: 'Encargados sin DPA firmado y transferencias sin SCCs.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'estado_arco',
    description: 'Solicitudes ARCO en curso con plazos y tiempo de respuesta.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'proxima_auditoria',
    description: 'Próximas auditorías programadas con alcance.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'documentos_pendientes',
    description: 'Documentos por generar, en borrador o por aprobar.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'madurez_actual',
    description: 'Madurez global del SGPDP, por fase y brechas mayores.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'solicitar_firma_dpo',
    description: 'Crea solicitud de firma en la cola del DPO humano. Usar cuando una acción requiere aprobación humana.',
    input_schema: {
      type: 'object' as const,
      properties: {
        tipo: { type: 'string', description: 'Tipo de solicitud' },
        entidadId: { type: 'string', description: 'ID de la entidad' },
        motivo: { type: 'string', description: 'Motivo de la solicitud' },
      },
      required: ['tipo', 'entidadId', 'motivo'],
    },
  },
  {
    name: 'registrar_observacion',
    description: 'Registra una observación del agente en una entidad.',
    input_schema: {
      type: 'object' as const,
      properties: {
        entidad: { type: 'string' },
        entidadId: { type: 'string' },
        texto: { type: 'string' },
      },
      required: ['entidad', 'entidadId', 'texto'],
    },
  },
];
