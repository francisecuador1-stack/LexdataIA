import { z } from 'zod';

// Roles del sistema
export const RolSchema = z.enum([
  'SUPERADMIN', 'LEGAL_ADMIN', 'DPO_HUMANO', 'DPO_ANALISTA',
  'CLIENTE_ADMIN', 'CLIENTE_COLABORADOR', 'AUDITOR_EXTERNO', 'MARK_AI',
]);
export type Rol = z.infer<typeof RolSchema>;

// Fases PHVA
export const FasePHVASchema = z.enum([
  'PLANIFICAR', 'HACER', 'VERIFICAR', 'ACTUAR',
]);
export type FasePHVA = z.infer<typeof FasePHVASchema>;

// Número de fase
export const NumeroFaseSchema = z.enum(['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7']);
export type NumeroFase = z.infer<typeof NumeroFaseSchema>;

// Fuente normativa
export const FuenteNormativaSchema = z.enum([
  'LOPDP', 'RGLOPDP', 'CRE', 'SPDP', 'SGPDP',
  'ISO_27001', 'ISO_27701', 'ISO_42001', 'NIST',
]);
export type FuenteNormativa = z.infer<typeof FuenteNormativaSchema>;

// Estado de norma
export const EstadoNormaSchema = z.enum(['VIGENTE', 'DEROGADA', 'MODIFICADA']);
export type EstadoNorma = z.infer<typeof EstadoNormaSchema>;

// Estado de tratamiento (RAT)
export const EstadoTratamientoSchema = z.enum(['PENDIENTE', 'VALIDADO', 'CON_OBSERVACIONES']);
export type EstadoTratamiento = z.infer<typeof EstadoTratamientoSchema>;

// Nivel de riesgo
export const NivelRiesgoSchema = z.enum(['BAJO', 'MEDIO', 'ALTO', 'CRITICO']);
export type NivelRiesgo = z.infer<typeof NivelRiesgoSchema>;

// Estado de riesgo
export const EstadoRiesgoSchema = z.enum(['IDENTIFICADO', 'EN_TRATAMIENTO', 'MITIGADO', 'ACEPTADO']);
export type EstadoRiesgo = z.infer<typeof EstadoRiesgoSchema>;

// Estado de control
export const EstadoControlSchema = z.enum(['PROPUESTA', 'APROBADA', 'EN_IMPLEMENTACION', 'IMPLEMENTADO', 'PENDIENTE']);
export type EstadoControl = z.infer<typeof EstadoControlSchema>;

// Tipo de control
export const TipoControlSchema = z.enum(['TECNICO', 'ORGANIZATIVO', 'JURIDICO', 'DOCUMENTAL']);
export type TipoControl = z.infer<typeof TipoControlSchema>;

// Tipo de hallazgo
export const TipoHallazgoSchema = z.enum(['NCM', 'NCm', 'OBS', 'OM', 'BP']);
export type TipoHallazgo = z.infer<typeof TipoHallazgoSchema>;

// Estado de hallazgo
export const EstadoHallazgoSchema = z.enum(['ABIERTO', 'EN_PROCESO', 'PENDIENTE_EVIDENCIA', 'CERRADO']);
export type EstadoHallazgo = z.infer<typeof EstadoHallazgoSchema>;

// Estado de incidente
export const EstadoIncidenteSchema = z.enum(['DETECTADO', 'EN_INVESTIGACION', 'NOTIFICADO_SPDP', 'CERRADO']);
export type EstadoIncidente = z.infer<typeof EstadoIncidenteSchema>;

// Tipo de incidente
export const TipoIncidenteSchema = z.enum(['CONFIDENCIALIDAD', 'INTEGRIDAD', 'DISPONIBILIDAD']);
export type TipoIncidente = z.infer<typeof TipoIncidenteSchema>;

// Estado de recomendación
export const EstadoRecomendacionSchema = z.enum(['EMITIDA', 'EN_IMPLEMENTACION', 'IMPLEMENTADA', 'CERRADA']);
export type EstadoRecomendacion = z.infer<typeof EstadoRecomendacionSchema>;

// Estado de auditoría
export const EstadoAuditoriaSchema = z.enum(['PROGRAMADA', 'EN_EJECUCION', 'CERRADA']);
export type EstadoAuditoria = z.infer<typeof EstadoAuditoriaSchema>;

// Tipo de auditoría
export const TipoAuditoriaSchema = z.enum(['INTERNA', 'EXTERNA']);
export type TipoAuditoria = z.infer<typeof TipoAuditoriaSchema>;

// Actor del audit log
export const ActorTypeSchema = z.enum(['HUMANO', 'MARK_AI', 'SISTEMA']);
export type ActorType = z.infer<typeof ActorTypeSchema>;

// Estado de principio rector
export const EstadoPrincipioSchema = z.enum(['VERIFICADO', 'PENDIENTE', 'NO_VERIFICADO']);
export type EstadoPrincipio = z.infer<typeof EstadoPrincipioSchema>;

// Nivel de madurez
export const NivelMadurezSchema = z.enum(['INICIAL', 'GESTIONADO', 'DEFINIDO', 'CONTROLADO', 'OPTIMIZADO']);
export type NivelMadurez = z.infer<typeof NivelMadurezSchema>;

// Eficacia
export const NivelEficaciaSchema = z.enum(['ALTA', 'MEDIA', 'BAJA']);
export type NivelEficacia = z.infer<typeof NivelEficaciaSchema>;

// Evaluación organizacional
export const EstadoEvaluacionSchema = z.enum(['CUMPLE', 'PARCIAL', 'NO_CUMPLE']);
export type EstadoEvaluacion = z.infer<typeof EstadoEvaluacionSchema>;

// Nivel de categoría de datos
export const NivelCategoriaSchema = z.enum(['ESTANDAR', 'REFORZADO', 'MAXIMO']);
export type NivelCategoria = z.infer<typeof NivelCategoriaSchema>;

// Criticidad de activo
export const CriticidadSchema = z.enum(['ALTA', 'MEDIA', 'BAJA']);
export type Criticidad = z.infer<typeof CriticidadSchema>;

// Decisión EIPD
export const DecisionEIPDSchema = z.enum(['OBLIGATORIO', 'NO_REQUERIDO', 'PENDIENTE']);
export type DecisionEIPD = z.infer<typeof DecisionEIPDSchema>;

// Verificación de principio por tratamiento (RN-401)
export const VeredictoValidacionSchema = z.enum(['VALIDO', 'INCONSISTENCIA', 'BLOQUEADO']);
export type VeredictoValidacion = z.infer<typeof VeredictoValidacionSchema>;

// Estado de rol organizacional
export const EstadoRolSchema = z.enum(['DEFINIDO', 'PARCIALMENTE_DEFINIDO', 'NO_DEFINIDO']);
export type EstadoRol = z.infer<typeof EstadoRolSchema>;

// Suficiencia de recursos
export const EstadoRecursoSchema = z.enum(['SUFICIENTE', 'INSUFICIENTE', 'NO_EVALUADO']);
export type EstadoRecurso = z.infer<typeof EstadoRecursoSchema>;

// Severidad de brecha/gap
export const SeveridadSchema = z.enum(['CRITICA', 'ALTA', 'MEDIA', 'BAJA']);
export type Severidad = z.infer<typeof SeveridadSchema>;

// Diagnóstico PIMS respuesta
export const RespuestaPIMSSchema = z.enum(['IMPLEMENTADO', 'EN_PROCESO', 'NO_IMPLEMENTADO']);
export type RespuestaPIMS = z.infer<typeof RespuestaPIMSSchema>;
