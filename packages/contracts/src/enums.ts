import { z } from 'zod';

// ── Core ──
export const RolSchema = z.enum(['SUPERADMIN', 'LEGAL_ADMIN', 'DPO_HUMANO', 'DPO_ANALISTA', 'CLIENTE_ADMIN', 'CLIENTE_COLABORADOR', 'AUDITOR_EXTERNO', 'MARK_AI']);
export type Rol = z.infer<typeof RolSchema>;

export const ActorTypeSchema = z.enum(['HUMANO', 'MARK_AI', 'SISTEMA']);
export type ActorType = z.infer<typeof ActorTypeSchema>;

export const FasePHVASchema = z.enum(['PLANIFICAR', 'HACER', 'VERIFICAR', 'ACTUAR']);
export type FasePHVA = z.infer<typeof FasePHVASchema>;

// ── Normas ──
export const TipoNormaSchema = z.enum(['NACIONAL', 'INTERNACIONAL']);
export type TipoNorma = z.infer<typeof TipoNormaSchema>;

export const FuenteNormaSchema = z.enum(['CRE', 'LOPDP', 'RGLOPDP', 'SPDP', 'SGPDP', 'ISO_27001', 'ISO_27701', 'ISO_42001', 'NIST']);
export type FuenteNorma = z.infer<typeof FuenteNormaSchema>;

export const EstadoNormaSchema = z.enum(['VIGENTE', 'DEROGADA', 'PROYECTO']);
export type EstadoNorma = z.infer<typeof EstadoNormaSchema>;

export const EstadoPrincipioSchema = z.enum(['VERIFICADO', 'PENDIENTE', 'NO_VERIFICADO']);
export type EstadoPrincipio = z.infer<typeof EstadoPrincipioSchema>;

// ── Tratamientos y Riesgos ──
export const EstadoTratamientoSchema = z.enum(['PENDIENTE', 'VALIDADO', 'CON_OBSERVACIONES']);
export type EstadoTratamiento = z.infer<typeof EstadoTratamientoSchema>;

export const NivelRiesgoSchema = z.enum(['BAJO', 'MEDIO', 'ALTO', 'CRITICO']);
export type NivelRiesgo = z.infer<typeof NivelRiesgoSchema>;

export const EstadoRiesgoSchema = z.enum(['IDENTIFICADO', 'EN_TRATAMIENTO', 'MITIGADO', 'ACEPTADO']);
export type EstadoRiesgo = z.infer<typeof EstadoRiesgoSchema>;

export const NivelCategoriaDatosSchema = z.enum(['ESTANDAR', 'REFORZADO', 'MAXIMO', 'MAXIMO_REPRESENTANTE']);
export type NivelCategoriaDatos = z.infer<typeof NivelCategoriaDatosSchema>;

export const CriticidadActivoSchema = z.enum(['BAJA', 'MEDIA', 'ALTA']);
export type CriticidadActivo = z.infer<typeof CriticidadActivoSchema>;

// ── Controles ──
export const TipoControlSchema = z.enum(['TECNICO', 'ORGANIZATIVO', 'LEGAL', 'DOCUMENTAL']);
export type TipoControl = z.infer<typeof TipoControlSchema>;

export const EstadoControlSchema = z.enum(['PROPUESTA', 'APROBADA', 'EN_IMPLEMENTACION', 'IMPLEMENTADO', 'EN_PROGRESO', 'PENDIENTE']);
export type EstadoControl = z.infer<typeof EstadoControlSchema>;

export const EficaciaSchema = z.enum(['ALTA', 'MEDIA', 'BAJA', 'NO_EVALUADA']);
export type Eficacia = z.infer<typeof EficaciaSchema>;

export const ConfianzaSchema = z.enum(['ALTA', 'MEDIA', 'BAJA', 'NO_EVALUADA']);
export type Confianza = z.infer<typeof ConfianzaSchema>;

export const SuficienciaSchema = z.enum(['SUFICIENTE', 'PROPORCIONAL', 'INSUFICIENTE', 'NO_EVALUADA']);
export type Suficiencia = z.infer<typeof SuficienciaSchema>;

// ── Hallazgos ──
export const TipoHallazgoSchema = z.enum(['NC_MAYOR', 'NC_MENOR', 'OBSERVACION', 'OPORTUNIDAD', 'BUENA_PRACTICA', 'HALLAZGO_DISENO']);
export type TipoHallazgo = z.infer<typeof TipoHallazgoSchema>;

export const SeveridadHallazgoSchema = z.enum(['CRITICA', 'MAYOR', 'MENOR']);
export type SeveridadHallazgo = z.infer<typeof SeveridadHallazgoSchema>;

export const EstadoHallazgoSchema = z.enum(['ABIERTO', 'EN_PROCESO', 'PENDIENTE_EVIDENCIA', 'CERRADO', 'NO_RESUELTO']);
export type EstadoHallazgo = z.infer<typeof EstadoHallazgoSchema>;

// ── Auditoría ──
export const EstadoAuditoriaSchema = z.enum(['PROGRAMADA', 'EN_EJECUCION', 'CERRADA']);
export type EstadoAuditoria = z.infer<typeof EstadoAuditoriaSchema>;

export const TipoAuditoriaSchema = z.enum(['INTERNA', 'EXTERNA']);
export type TipoAuditoria = z.infer<typeof TipoAuditoriaSchema>;

export const RespuestaChecklistSchema = z.enum(['CUMPLE', 'NO_CUMPLE', 'PARCIAL', 'NO_APLICA']);
export type RespuestaChecklist = z.infer<typeof RespuestaChecklistSchema>;

export const PerfilChecklistSchema = z.enum(['LOPDP', 'ISO_27701', 'VIDEOVIGILANCIA', 'SALUD_SENSIBLES', 'INTELIGENCIA_ARTIFICIAL']);
export type PerfilChecklist = z.infer<typeof PerfilChecklistSchema>;

// ── Incidentes ──
export const TipoIncidenteSchema = z.enum(['CONFIDENCIALIDAD', 'INTEGRIDAD', 'DISPONIBILIDAD']);
export type TipoIncidente = z.infer<typeof TipoIncidenteSchema>;

export const EstadoIncidenteSchema = z.enum(['DETECTADO', 'EN_CONTENCION', 'NOTIFICADO_SPDP', 'CERRADO']);
export type EstadoIncidente = z.infer<typeof EstadoIncidenteSchema>;

// ── Mejora Continua ──
export const EstadoRecomendacionSchema = z.enum(['EMITIDA', 'PENDIENTE', 'EN_PROCESO', 'EN_IMPLEMENTACION', 'IMPLEMENTADA', 'VERIFICADO', 'CERRADA']);
export type EstadoRecomendacion = z.infer<typeof EstadoRecomendacionSchema>;

export const EstadoPlanAccionSchema = z.enum(['COMPROMETIDO', 'EN_EJECUCION', 'COMPLETADO', 'VENCIDO']);
export type EstadoPlanAccion = z.infer<typeof EstadoPlanAccionSchema>;

export const NivelMadurezSchema = z.enum(['INICIAL', 'GESTIONADO', 'DEFINIDO', 'CONTROLADO', 'OPTIMIZADO']);
export type NivelMadurez = z.infer<typeof NivelMadurezSchema>;

// ── Diagnóstico ──
export const RespuestaDiagnosticoSchema = z.enum(['CUMPLE', 'PARCIAL', 'NO_CUMPLE']);
export type RespuestaDiagnostico = z.infer<typeof RespuestaDiagnosticoSchema>;

export const RespuestaPIMSSchema = z.enum(['IMPLEMENTADO', 'EN_PROCESO', 'NO_IMPLEMENTADO']);
export type RespuestaPIMS = z.infer<typeof RespuestaPIMSSchema>;

export const EstadoRolSchema = z.enum(['DEFINIDO', 'PARCIALMENTE_DEFINIDO', 'NO_DEFINIDO']);
export type EstadoRol = z.infer<typeof EstadoRolSchema>;

export const EstadoRecursoSchema = z.enum(['SUFICIENTE', 'INSUFICIENTE', 'NO_EVALUADO']);
export type EstadoRecurso = z.infer<typeof EstadoRecursoSchema>;

// ── Cotización ──
export const CasoCotizacionSchema = z.enum(['A', 'B']);
export type CasoCotizacion = z.infer<typeof CasoCotizacionSchema>;
