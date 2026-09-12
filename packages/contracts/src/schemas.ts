import { z } from 'zod';
import {
  RolSchema, FasePHVASchema, FuenteNormaSchema, TipoNormaSchema,
  EstadoNormaSchema, EstadoPrincipioSchema,
  EstadoTratamientoSchema, NivelRiesgoSchema, EstadoRiesgoSchema,
  NivelCategoriaDatosSchema, CriticidadActivoSchema,
  TipoControlSchema, EstadoControlSchema, EficaciaSchema, ConfianzaSchema, SuficienciaSchema,
  TipoHallazgoSchema, SeveridadHallazgoSchema, EstadoHallazgoSchema,
  EstadoAuditoriaSchema, TipoAuditoriaSchema,
  RespuestaChecklistSchema, PerfilChecklistSchema,
  TipoIncidenteSchema, EstadoIncidenteSchema,
  EstadoRecomendacionSchema, EstadoPlanAccionSchema, NivelMadurezSchema,
  RespuestaDiagnosticoSchema, RespuestaPIMSSchema,
  EstadoRolSchema, EstadoRecursoSchema,
  ActorTypeSchema, CasoCotizacionSchema,
} from './enums.js';

// --- Tenant ---
export const TenantSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1),
  plan: z.string().optional(),
  activo: z.boolean(),
  createdAt: z.date(),
});
export type Tenant = z.infer<typeof TenantSchema>;

// --- Cliente ---
export const ClienteSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  razonSocial: z.string().min(1),
  ruc: z.string().length(13),
  sector: z.string(),
  ciudad: z.string(),
  provincia: z.string(),
  sitioWeb: z.string().optional(),
  actividadEconomica: z.string().optional(),
  representanteLegal: z.string().optional(),
  cedulaRepresentante: z.string().max(10).optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  correoInstitucional: z.string().email().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Cliente = z.infer<typeof ClienteSchema>;

// --- User ---
export const UserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  nombre: z.string(),
  rol: RolSchema,
  activo: z.boolean(),
  avatarIniciales: z.string().max(3).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

// --- Norma ---
export const NormaSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  fuente: FuenteNormaSchema,
  tipo: TipoNormaSchema,
  identificador: z.string(),
  titulo: z.string(),
  categoria: z.string(),
  resumen: z.string(),
  textoNormativo: z.string(),
  fasePHVA: FasePHVASchema,
  estado: EstadoNormaSchema,
  organismoEmisor: z.string(),
  fechaEmision: z.date(),
  version: z.string(),
  hashSha256: z.string(),
  modulosRelacionados: z.array(z.string()).optional(),
  createdAt: z.date(),
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
  createdAt: z.date(),
});
export type ControlNormativo = z.infer<typeof ControlNormativoSchema>;

// --- Principio Rector ---
export const PrincipioRectorSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  baseNormativa: z.string(),
  definicion: z.string(),
  preguntasAuditoria: z.array(z.string()),
});
export type PrincipioRector = z.infer<typeof PrincipioRectorSchema>;

// --- Principio Estado ---
export const PrincipioEstadoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  principioId: z.string().uuid(),
  estado: EstadoPrincipioSchema,
  fechaVerificacion: z.date().optional(),
  hashSha256: z.string().optional(),
  createdAt: z.date(),
});
export type PrincipioEstado = z.infer<typeof PrincipioEstadoSchema>;

// --- Tratamiento (RAT) ---
export const TratamientoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  codigoRat: z.string(),
  nombre: z.string(),
  finalidad: z.string(),
  baseLegal: z.string().optional(),
  retencion: z.string().optional(),
  datosSensibles: z.boolean(),
  categorias: z.array(z.string()).optional(),
  estado: EstadoTratamientoSchema,
  observacionesDPO: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Tratamiento = z.infer<typeof TratamientoSchema>;

// --- Activo ---
export const ActivoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  nombre: z.string(),
  tipo: z.string(),
  criticidad: CriticidadActivoSchema,
  responsable: z.string(),
  ubicacion: z.string(),
  sistemas: z.string(),
  datosPersonales: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Activo = z.infer<typeof ActivoSchema>;

// --- Categoria de Datos ---
export const CategoriaDatosSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  baseNormativa: z.string(),
  nivel: NivelCategoriaDatosSchema,
  descripcion: z.string().optional(),
});
export type CategoriaDatos = z.infer<typeof CategoriaDatosSchema>;

// --- Amenaza ---
export const AmenazaSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
  createdAt: z.date(),
});
export type Amenaza = z.infer<typeof AmenazaSchema>;

// --- Vulnerabilidad ---
export const VulnerabilidadSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
  createdAt: z.date(),
});
export type Vulnerabilidad = z.infer<typeof VulnerabilidadSchema>;

// --- Riesgo ---
export const RiesgoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  tratamientoId: z.string().uuid(),
  activoId: z.string().uuid(),
  amenazaId: z.string().uuid().optional(),
  vulnerabilidadId: z.string().uuid().optional(),
  amenaza: z.string(),
  impacto: z.number().int().min(1).max(5),
  probabilidad: z.number().int().min(1).max(5),
  score: z.number().int(),
  nivel: NivelRiesgoSchema,
  estado: EstadoRiesgoSchema,
  revisadoPorDPO: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Riesgo = z.infer<typeof RiesgoSchema>;

// --- Evaluacion EIPD ---
export const EvaluacionEIPDSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  tratamientoId: z.string().uuid(),
  granEscala: z.boolean(),
  datosSensibles: z.boolean(),
  decisionesAuto: z.boolean(),
  perfilamiento: z.boolean(),
  menores: z.boolean(),
  decision: z.string(),
  estado: z.string(),
  createdAt: z.date(),
});
export type EvaluacionEIPD = z.infer<typeof EvaluacionEIPDSchema>;

// --- Proceso ---
export const ProcesoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  responsable: z.string().optional(),
  fasePHVA: FasePHVASchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Proceso = z.infer<typeof ProcesoSchema>;

// --- Control ---
export const ControlSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  titulo: z.string(),
  tipo: TipoControlSchema,
  estado: EstadoControlSchema,
  baseNormativa: z.string(),
  prioridad: z.string().optional(),
  plazo: z.date().optional(),
  eficacia: EficaciaSchema.optional(),
  confianzaEvidencia: ConfianzaSchema.optional(),
  suficiencia: SuficienciaSchema.optional(),
  fase: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Control = z.infer<typeof ControlSchema>;

// --- Medida ---
export const MedidaSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  controlId: z.string().uuid().optional(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  tipo: TipoControlSchema.optional(),
  estado: EstadoControlSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Medida = z.infer<typeof MedidaSchema>;

// --- Hallazgo ---
export const HallazgoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  codigo: z.string(),
  tipo: TipoHallazgoSchema,
  severidad: SeveridadHallazgoSchema,
  descripcion: z.string(),
  estado: EstadoHallazgoSchema,
  fase: z.string().optional(),
  normaId: z.string().uuid().optional(),
  articuloRef: z.string().optional(),
  documentoAfectado: z.string().optional(),
  verificacionEficacia: z.boolean().optional(),
  hashEvidencia: z.string().optional(),
  cerradoPor: z.string().uuid().optional(),
  fechaCierre: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
  dimension: z.string().optional(),
  controlId: z.string().uuid().optional(),
  creadoPorId: z.string().uuid(),
  retencionHasta: z.date(),
  createdAt: z.date(),
});
export type Evidencia = z.infer<typeof EvidenciaSchema>;

// --- Documento ---
export const DocumentoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  nombre: z.string(),
  tipo: z.string(),
  version: z.string().optional(),
  archivoUrl: z.string().optional(),
  hashSha256: z.string().optional(),
  creadoPorId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Documento = z.infer<typeof DocumentoSchema>;

// --- Firma ---
export const FirmaSchema = z.object({
  id: z.string().uuid(),
  documentoId: z.string().uuid(),
  userId: z.string().uuid(),
  firmadoAt: z.date().optional(),
  hashFirma: z.string().optional(),
  estado: z.string(),
  createdAt: z.date(),
});
export type Firma = z.infer<typeof FirmaSchema>;

// --- Solicitud de Firma ---
export const SolicitudFirmaSchema = z.object({
  id: z.string().uuid(),
  documentoId: z.string().uuid(),
  solicitanteId: z.string().uuid(),
  destinatarioId: z.string().uuid(),
  mensaje: z.string().optional(),
  estado: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SolicitudFirma = z.infer<typeof SolicitudFirmaSchema>;

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
  createdAt: z.date(),
  updatedAt: z.date(),
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
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Auditoria = z.infer<typeof AuditoriaSchema>;

// --- Checklist Pregunta ---
export const ChecklistPreguntaSchema = z.object({
  id: z.string().uuid(),
  perfil: PerfilChecklistSchema,
  pregunta: z.string(),
  articuloRef: z.string(),
  orden: z.number().int(),
});
export type ChecklistPregunta = z.infer<typeof ChecklistPreguntaSchema>;

// --- Checklist Respuesta ---
export const ChecklistRespuestaSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  preguntaId: z.string().uuid(),
  respuesta: RespuestaChecklistSchema,
  createdAt: z.date(),
});
export type ChecklistRespuesta = z.infer<typeof ChecklistRespuestaSchema>;

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
  dominio: z.string().optional(),
  prioridad: z.string().optional(),
  verificadoPorId: z.string().uuid().optional(),
  fechaVerificacion: z.date().optional(),
  hashEvidencia: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Recomendacion = z.infer<typeof RecomendacionSchema>;

// --- Plan de Acción ---
export const PlanAccionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  titulo: z.string(),
  estado: EstadoPlanAccionSchema,
  brechaId: z.string().uuid().optional(),
  responsable: z.string(),
  plazo: z.date(),
  hashEvidencia: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type PlanAccion = z.infer<typeof PlanAccionSchema>;

// --- Brecha ---
export const BrechaSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  codigo: z.string(),
  severidad: z.string(),
  descripcion: z.string(),
  dominio: z.string(),
  origen: z.string(),
  createdAt: z.date(),
});
export type Brecha = z.infer<typeof BrechaSchema>;

// --- Evaluación Organizacional ---
export const EvaluacionOrganizacionalSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  dimension: z.string(),
  pregunta: z.string(),
  baseNormativa: z.string(),
  respuesta: RespuestaDiagnosticoSchema.optional(),
  esDPO: z.boolean(),
  createdAt: z.date(),
});
export type EvaluacionOrganizacional = z.infer<typeof EvaluacionOrganizacionalSchema>;

// --- Rol Organizacional ---
export const RolOrganizacionalSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  nombre: z.string(),
  baseNormativa: z.string(),
  estado: EstadoRolSchema,
  actaRequerida: z.boolean(),
  hashActa: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type RolOrganizacional = z.infer<typeof RolOrganizacionalSchema>;

// --- Recurso Evaluación ---
export const RecursoEvaluacionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  bloque: z.string(),
  item: z.string(),
  estado: EstadoRecursoSchema,
  createdAt: z.date(),
});
export type RecursoEvaluacion = z.infer<typeof RecursoEvaluacionSchema>;

// --- Capacitación Módulo ---
export const CapacitacionModuloSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  nivel: z.enum(['BASICO', 'INTERMEDIO', 'AVANZADO']),
  categoria: z.string(),
  baseNormativa: z.string(),
  duracionMinutos: z.number(),
  descripcion: z.string(),
  orden: z.number().int().optional(),
});
export type CapacitacionModulo = z.infer<typeof CapacitacionModuloSchema>;

// --- Evaluación Capacitación ---
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

// --- Curso ---
export const CursoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  descripcion: z.string().optional(),
  duracionHoras: z.number().optional(),
  obligatorio: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Curso = z.infer<typeof CursoSchema>;

// --- Certificado ---
export const CertificadoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  cursoId: z.string().uuid().optional(),
  moduloId: z.string().uuid().optional(),
  codigo: z.string(),
  fechaEmision: z.date(),
  fechaExpiracion: z.date().optional(),
  hashSha256: z.string().optional(),
  createdAt: z.date(),
});
export type Certificado = z.infer<typeof CertificadoSchema>;

// --- Solicitud ARCO ---
export const SolicitudArcoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  tipo: z.enum(['ACCESO', 'RECTIFICACION', 'CANCELACION', 'OPOSICION']),
  solicitante: z.string(),
  email: z.string().email().optional(),
  descripcion: z.string(),
  estado: z.string(),
  fechaSolicitud: z.date(),
  fechaLimite: z.date(),
  fechaResolucion: z.date().optional(),
  responsableId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SolicitudArco = z.infer<typeof SolicitudArcoSchema>;

// --- Diagnóstico PIMS ---
export const DiagnosticoPIMSSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  modulo: z.number().int(),
  pregunta: z.number().int(),
  respuesta: RespuestaPIMSSchema.optional(),
  createdAt: z.date(),
});
export type DiagnosticoPIMS = z.infer<typeof DiagnosticoPIMSSchema>;

// --- Registro SPDP ---
export const RegistroSPDPSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  sector: z.string().optional(),
  trabajadores: z.string().optional(),
  sucursales: z.string().optional(),
  volumenRegistros: z.string().optional(),
  categoriasTitulares: z.array(z.string()).optional(),
  datosSalud: z.boolean(),
  datosBiometricos: z.boolean(),
  datosGeneticos: z.boolean(),
  datosMenores: z.boolean(),
  datosRaciales: z.boolean(),
  datosPoliticos: z.boolean(),
  datosReligiosos: z.boolean(),
  datosSindicales: z.boolean(),
  datosSexuales: z.boolean(),
  datosPenales: z.boolean(),
  descripcionSensibles: z.string().optional(),
  usaIA: z.boolean(),
  decisionesAutomatizadas: z.boolean(),
  realizaPerfilamiento: z.boolean(),
  transferenciasInternacionales: z.boolean(),
  cloudExtranjero: z.boolean(),
  sistemasTecnologicos: z.string().optional(),
  tieneRAT: z.boolean(),
  tieneEIPD: z.boolean(),
  tieneLIA: z.boolean(),
  tienePoliticas: z.boolean(),
  tieneDPO: z.boolean(),
  solicitudesARCO: z.string().optional(),
  incidentesAnuales: z.string().optional(),
  canalArco: z.string().optional(),
  responsableArco: z.string().optional(),
  verificacion: z.string().optional(),
  compromisoDirectivo: z.boolean(),
  comitePrivacidad: z.boolean(),
  antecedentesReclamos: z.boolean(),
  sancionesSPDP: z.boolean(),
  declaracionVeracidad: z.boolean(),
  notaAdicional: z.string().optional(),
  pdScore: z.number().int().optional(),
  nivelRiesgo: z.string().optional(),
  caso: CasoCotizacionSchema.optional(),
  honorarioMensual: z.number().int().optional(),
  completado: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type RegistroSPDP = z.infer<typeof RegistroSPDPSchema>;

// --- Lección Aprendida ---
export const LeccionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  titulo: z.string(),
  descripcion: z.string(),
  origen: z.string().optional(),
  hallazgoId: z.string().uuid().optional(),
  incidenteId: z.string().uuid().optional(),
  auditoriaId: z.string().uuid().optional(),
  creadoPorId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Leccion = z.infer<typeof LeccionSchema>;

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
  antes: z.any().optional(),
  despues: z.any().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  chainIndex: z.number().int().optional(),
  hashSha256: z.string(),
  prevHash: z.string().optional(),
  createdAt: z.date(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

// --- Madurez ---
export const MadurezSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  dimension: z.string(),
  nivel: NivelMadurezSchema,
  fecha: z.date(),
  observaciones: z.string().optional(),
  createdAt: z.date(),
});
export type Madurez = z.infer<typeof MadurezSchema>;
