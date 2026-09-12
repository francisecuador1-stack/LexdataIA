import { z } from 'zod';
import {
  RolSchema, FasePHVASchema, FuenteNormativaSchema, EstadoNormaSchema,
  EstadoTratamientoSchema, NivelRiesgoSchema, EstadoRiesgoSchema,
  EstadoControlSchema, TipoControlSchema, TipoHallazgoSchema,
  EstadoHallazgoSchema, EstadoIncidenteSchema, TipoIncidenteSchema,
  ActorTypeSchema, EstadoRecomendacionSchema,
  EstadoAuditoriaSchema, TipoAuditoriaSchema,
  CriticidadSchema, SeveridadSchema,
} from './enums.js';

// --- Tenant ---
export const TenantSchema = z.object({
  id: z.string().uuid(),
  razonSocial: z.string().min(1),
  ruc: z.string().length(13),
  sector: z.string(),
  ciudad: z.string(),
  provincia: z.string(),
  createdAt: z.date(),
});
export type Tenant = z.infer<typeof TenantSchema>;

// --- User ---
export const UserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  nombre: z.string(),
  rol: RolSchema,
  activo: z.boolean(),
});
export type User = z.infer<typeof UserSchema>;

// --- Norma ---
export const NormaSchema = z.object({
  id: z.string().uuid(),
  fuente: FuenteNormativaSchema,
  identificador: z.string(),
  titulo: z.string(),
  categoria: z.string(),
  resumen: z.string(),
  textoNormativo: z.string(),
  fasePHVA: FasePHVASchema,
  estado: EstadoNormaSchema,
  ambito: z.enum(['NACIONAL', 'INTERNACIONAL']),
  organismoEmisor: z.string(),
  fechaEmision: z.date(),
  version: z.string(),
  hashSha256: z.string(),
});
export type Norma = z.infer<typeof NormaSchema>;

// --- Control Normativo ---
export const ControlNormativoSchema = z.object({
  id: z.string().uuid(),
  normaId: z.string().uuid(),
  titulo: z.string(),
  descripcion: z.string(),
  evidenciaRequerida: z.string(),
  fasePHVA: FasePHVASchema,
  hashSha256: z.string(),
});
export type ControlNormativo = z.infer<typeof ControlNormativoSchema>;

// --- Tratamiento (RAT) ---
export const TratamientoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  codigoRAT: z.string(),
  nombre: z.string(),
  finalidad: z.string(),
  baseLegitimacion: z.string().optional(),
  retencion: z.string().optional(),
  datosSensibles: z.boolean(),
  estado: EstadoTratamientoSchema,
  observacionesDPO: z.string().optional(),
});
export type Tratamiento = z.infer<typeof TratamientoSchema>;

// --- Activo ---
export const ActivoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  nombre: z.string(),
  tipo: z.string(),
  criticidad: CriticidadSchema,
  responsable: z.string(),
  ubicacion: z.string(),
  sistemas: z.string(),
  datosPersonales: z.boolean(),
});
export type Activo = z.infer<typeof ActivoSchema>;

// --- Riesgo ---
export const RiesgoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  tratamientoId: z.string().uuid(),
  activoId: z.string().uuid(),
  amenaza: z.string(),
  impacto: z.number().int().min(1).max(5),
  probabilidad: z.number().int().min(1).max(5),
  score: z.number().int(),
  nivel: NivelRiesgoSchema,
  estado: EstadoRiesgoSchema,
  revisadoPorDPO: z.boolean(),
});
export type Riesgo = z.infer<typeof RiesgoSchema>;

// --- Control ---
export const ControlSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  titulo: z.string(),
  tipo: TipoControlSchema,
  estado: EstadoControlSchema,
  baseNormativa: z.string(),
  prioridad: SeveridadSchema,
  plazo: z.date().optional(),
  eficacia: z.enum(['ALTA', 'MEDIA', 'BAJA']).optional(),
  confianzaEvidencia: z.enum(['ALTA', 'MEDIA', 'BAJA']).optional(),
});
export type Control = z.infer<typeof ControlSchema>;

// --- Hallazgo ---
export const HallazgoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  codigo: z.string(),
  tipo: TipoHallazgoSchema,
  descripcion: z.string(),
  estado: EstadoHallazgoSchema,
  fase: z.enum(['F1','F2','F3','F4','F5','F6','F7']),
  normaId: z.string().uuid().optional(),
  articuloRef: z.string().optional(),
  severidad: SeveridadSchema,
});
export type Hallazgo = z.infer<typeof HallazgoSchema>;

// --- Evidencia ---
export const EvidenciaSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  nombre: z.string(),
  tipo: z.string(),
  hashSha256: z.string(),
  prevHash: z.string().optional(),
  archivoUrl: z.string(),
  tamano: z.number(),
  creadoPor: z.string().uuid(),
  retencionHasta: z.date(),
  createdAt: z.date(),
});
export type Evidencia = z.infer<typeof EvidenciaSchema>;

// --- Incidente ---
export const IncidenteSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  codigo: z.string(),
  tipo: TipoIncidenteSchema,
  estado: EstadoIncidenteSchema,
  descripcion: z.string(),
  activoId: z.string().uuid().optional(),
  tratamientoId: z.string().uuid().optional(),
  fechaDeteccion: z.date(),
  fechaMaxReporteSPDP: z.date(),
  notificadoSPDP: z.boolean(),
  fechaNotificacion: z.date().optional(),
});
export type Incidente = z.infer<typeof IncidenteSchema>;

// --- Auditoría ---
export const AuditoriaSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  codigo: z.string(),
  tipo: TipoAuditoriaSchema,
  estado: EstadoAuditoriaSchema,
  objetivo: z.string(),
  responsable: z.string(),
  fecha: z.date(),
});
export type Auditoria = z.infer<typeof AuditoriaSchema>;

// --- Recomendación ---
export const RecomendacionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  codigo: z.string(),
  titulo: z.string(),
  descripcion: z.string(),
  estado: EstadoRecomendacionSchema,
  responsable: z.string(),
  plazo: z.date(),
  verificadaPor: z.string().uuid().optional(),
  fechaVerificacion: z.date().optional(),
  hashEvidencia: z.string().optional(),
});
export type Recomendacion = z.infer<typeof RecomendacionSchema>;

// --- Audit Log ---
export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  actorType: ActorTypeSchema,
  actorId: z.string().uuid(),
  accion: z.string(),
  entidad: z.string(),
  entidadId: z.string().uuid(),
  detalle: z.string(),
  hashSha256: z.string(),
  prevHash: z.string().optional(),
  createdAt: z.date(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

// --- Capacitación ---
export const CapacitacionModuloSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  nivel: z.enum(['BASICO', 'INTERMEDIO', 'AVANZADO']),
  categoria: z.string(),
  baseNormativa: z.string(),
  duracionMinutos: z.number(),
  descripcion: z.string(),
});
export type CapacitacionModulo = z.infer<typeof CapacitacionModuloSchema>;

export const EvaluacionCapacitacionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  moduloId: z.string().uuid(),
  puntaje: z.number().min(0).max(100),
  aprobado: z.boolean(),
  fecha: z.date(),
});
export type EvaluacionCapacitacion = z.infer<typeof EvaluacionCapacitacionSchema>;
