import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  NormaSchema,
  TratamientoSchema,
  HallazgoSchema,
  EvidenciaSchema,
  IncidenteSchema,
  AuditLogSchema,
  CertificadoSchema,
  UserSchema,
  ClienteSchema,
  TenantSchema,
  RiesgoSchema,
  ControlSchema,
  RecomendacionSchema,
  DocumentoSchema,
  FirmaSchema,
  SolicitudFirmaSchema,
  EvaluacionCapacitacionSchema,
} from '../schemas';
import {
  RolSchema,
  ActorTypeSchema,
  NivelRiesgoSchema,
  EstadoHallazgoSchema,
  EstadoIncidenteSchema,
  EstadoTratamientoSchema,
  EstadoRecomendacionSchema,
} from '../enums';
import { ApiErrorSchema, PaginationQuerySchema } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a valid object from a Zod schema using sensible defaults */
function validPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    tenantId: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Contract tests: schema validation
// ---------------------------------------------------------------------------

describe('Contract tests: Zod schemas match expected API shapes', () => {

  // ─── Norma ───────────────────────────────────────────────────────────
  describe('NormaSchema', () => {
    const validNorma = {
      ...validPayload(),
      codigo: 'LOPDP-001',
      fuente: 'LOPDP',
      tipo: 'NACIONAL',
      identificador: 'Art. 7',
      titulo: 'Principio de legalidad',
      categoria: 'Principios',
      resumen: 'El tratamiento debe ser lícito.',
      textoNormativo: 'Los datos personales deben ser tratados de forma lícita...',
      fasePHVA: 'PLANIFICAR',
      estado: 'VIGENTE',
      organismoEmisor: 'Asamblea Nacional',
      fechaEmision: new Date('2021-05-26'),
      version: '1.0',
      hashSha256: 'a'.repeat(64),
    };

    it('accepts a valid norma', () => {
      expect(() => NormaSchema.parse(validNorma)).not.toThrow();
    });

    it('rejects norma without hashSha256', () => {
      const { hashSha256, ...without } = validNorma;
      expect(() => NormaSchema.parse(without)).toThrow();
    });

    it('rejects invalid fuente enum', () => {
      expect(() => NormaSchema.parse({ ...validNorma, fuente: 'GDPR' })).toThrow();
    });

    it('rejects invalid estado enum', () => {
      expect(() => NormaSchema.parse({ ...validNorma, estado: 'ARCHIVED' })).toThrow();
    });
  });

  // ─── Tratamiento ─────────────────────────────────────────────────────
  describe('TratamientoSchema', () => {
    const validTrat = {
      ...validPayload(),
      codigoRat: 'RAT-001',
      nombre: 'Gestión de nómina',
      finalidad: 'Pago de salarios',
      datosSensibles: false,
      estado: 'PENDIENTE',
    };

    it('accepts a valid tratamiento', () => {
      expect(() => TratamientoSchema.parse(validTrat)).not.toThrow();
    });

    it('accepts CON_OBSERVACIONES estado', () => {
      expect(() => TratamientoSchema.parse({ ...validTrat, estado: 'CON_OBSERVACIONES' })).not.toThrow();
    });

    it('rejects invalid estado', () => {
      expect(() => TratamientoSchema.parse({ ...validTrat, estado: 'APPROVED' })).toThrow();
    });

    it('rejects missing nombre', () => {
      const { nombre, ...without } = validTrat;
      expect(() => TratamientoSchema.parse(without)).toThrow();
    });
  });

  // ─── Hallazgo ────────────────────────────────────────────────────────
  describe('HallazgoSchema', () => {
    const validHallazgo = {
      ...validPayload(),
      codigo: 'H-001',
      tipo: 'NC_MAYOR',
      severidad: 'CRITICA',
      descripcion: 'Falta de cifrado en reposo',
      estado: 'ABIERTO',
    };

    it('accepts a valid hallazgo', () => {
      expect(() => HallazgoSchema.parse(validHallazgo)).not.toThrow();
    });

    it('accepts CERRADO estado with closure fields', () => {
      const closed = {
        ...validHallazgo,
        estado: 'CERRADO',
        verificacionEficacia: true,
        hashEvidencia: 'b'.repeat(64),
        cerradoPor: '550e8400-e29b-41d4-a716-446655440099',
        fechaCierre: new Date(),
      };
      expect(() => HallazgoSchema.parse(closed)).not.toThrow();
    });

    it('rejects invalid tipo enum', () => {
      expect(() => HallazgoSchema.parse({ ...validHallazgo, tipo: 'WARNING' })).toThrow();
    });

    it('rejects invalid severidad enum', () => {
      expect(() => HallazgoSchema.parse({ ...validHallazgo, severidad: 'LOW' })).toThrow();
    });
  });

  // ─── Evidencia ───────────────────────────────────────────────────────
  describe('EvidenciaSchema', () => {
    const validEvidencia = {
      ...validPayload(),
      nombre: 'Acta de revisión',
      tipo: 'PDF',
      hashSha256: 'c'.repeat(64),
      archivoUrl: 'https://storage.example.com/evidencias/file.pdf',
      tamano: 1024,
      creadoPorId: '550e8400-e29b-41d4-a716-446655440002',
      retencionHasta: new Date('2031-01-01'),
    };

    it('accepts a valid evidencia', () => {
      expect(() => EvidenciaSchema.parse(validEvidencia)).not.toThrow();
    });

    it('requires hashSha256 (immutable evidence chain)', () => {
      const { hashSha256, ...without } = validEvidencia;
      expect(() => EvidenciaSchema.parse(without)).toThrow();
    });

    it('requires retencionHasta', () => {
      const { retencionHasta, ...without } = validEvidencia;
      expect(() => EvidenciaSchema.parse(without)).toThrow();
    });

    it('accepts optional prevHash for chain linking', () => {
      const withPrev = { ...validEvidencia, prevHash: 'd'.repeat(64) };
      expect(() => EvidenciaSchema.parse(withPrev)).not.toThrow();
    });
  });

  // ─── Incidente ───────────────────────────────────────────────────────
  describe('IncidenteSchema', () => {
    const validIncidente = {
      ...validPayload(),
      codigo: 'INC-001',
      tipo: 'CONFIDENCIALIDAD',
      estado: 'DETECTADO',
      descripcion: 'Exfiltración de datos personales',
      fechaDeteccion: new Date('2026-06-15T10:00:00Z'),
      fechaMaxReporteSPDP: new Date('2026-06-18T10:00:00Z'),
      notificadoSPDP: false,
    };

    it('accepts a valid incidente', () => {
      expect(() => IncidenteSchema.parse(validIncidente)).not.toThrow();
    });

    it('requires fechaDeteccion', () => {
      const { fechaDeteccion, ...without } = validIncidente;
      expect(() => IncidenteSchema.parse(without)).toThrow();
    });

    it('requires fechaMaxReporteSPDP (72h deadline)', () => {
      const { fechaMaxReporteSPDP, ...without } = validIncidente;
      expect(() => IncidenteSchema.parse(without)).toThrow();
    });

    it('accepts NOTIFICADO_SPDP estado', () => {
      const notified = {
        ...validIncidente,
        estado: 'NOTIFICADO_SPDP',
        notificadoSPDP: true,
        fechaNotificacion: new Date(),
      };
      expect(() => IncidenteSchema.parse(notified)).not.toThrow();
    });

    it('rejects invalid tipo enum', () => {
      expect(() => IncidenteSchema.parse({ ...validIncidente, tipo: 'PHISHING' })).toThrow();
    });
  });

  // ─── AuditLog ────────────────────────────────────────────────────────
  describe('AuditLogSchema', () => {
    const validLog = {
      ...validPayload(),
      actorType: 'HUMANO',
      actorId: '550e8400-e29b-41d4-a716-446655440003',
      accion: 'CREATE',
      entidad: 'tratamientos',
      entidadId: '550e8400-e29b-41d4-a716-446655440004',
      detalle: 'Created new treatment RAT-001',
      hashSha256: 'e'.repeat(64),
    };

    it('accepts a valid audit log entry', () => {
      expect(() => AuditLogSchema.parse(validLog)).not.toThrow();
    });

    it('requires actorType from enum (HUMANO, MARK_AI, SISTEMA)', () => {
      expect(() => AuditLogSchema.parse({ ...validLog, actorType: 'BOT' })).toThrow();
    });

    it('accepts MARK_AI as actorType', () => {
      expect(() => AuditLogSchema.parse({ ...validLog, actorType: 'MARK_AI' })).not.toThrow();
    });

    it('accepts SISTEMA as actorType', () => {
      expect(() => AuditLogSchema.parse({ ...validLog, actorType: 'SISTEMA' })).not.toThrow();
    });

    it('requires hashSha256 for chain integrity', () => {
      const { hashSha256, ...without } = validLog;
      expect(() => AuditLogSchema.parse(without)).toThrow();
    });

    it('accepts optional prevHash and chainIndex', () => {
      const withChain = { ...validLog, chainIndex: 42, prevHash: 'f'.repeat(64) };
      expect(() => AuditLogSchema.parse(withChain)).not.toThrow();
    });
  });

  // ─── Riesgo ──────────────────────────────────────────────────────────
  describe('RiesgoSchema', () => {
    const validRiesgo = {
      ...validPayload(),
      tratamientoId: '550e8400-e29b-41d4-a716-446655440005',
      activoId: '550e8400-e29b-41d4-a716-446655440006',
      amenaza: 'Acceso no autorizado',
      impacto: 4,
      probabilidad: 3,
      score: 12,
      nivel: 'ALTO',
      estado: 'IDENTIFICADO',
      revisadoPorDPO: false,
    };

    it('accepts a valid riesgo', () => {
      expect(() => RiesgoSchema.parse(validRiesgo)).not.toThrow();
    });

    it('rejects impacto outside 1-5 range', () => {
      expect(() => RiesgoSchema.parse({ ...validRiesgo, impacto: 0 })).toThrow();
      expect(() => RiesgoSchema.parse({ ...validRiesgo, impacto: 6 })).toThrow();
    });

    it('rejects probabilidad outside 1-5 range', () => {
      expect(() => RiesgoSchema.parse({ ...validRiesgo, probabilidad: 0 })).toThrow();
      expect(() => RiesgoSchema.parse({ ...validRiesgo, probabilidad: 6 })).toThrow();
    });

    it('validates all NivelRiesgo values', () => {
      for (const nivel of ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'] as const) {
        expect(() => RiesgoSchema.parse({ ...validRiesgo, nivel })).not.toThrow();
      }
    });

    it('rejects invalid nivel', () => {
      expect(() => RiesgoSchema.parse({ ...validRiesgo, nivel: 'EXTREME' })).toThrow();
    });
  });

  // ─── Enums ───────────────────────────────────────────────────────────
  describe('Enum schemas', () => {
    it('RolSchema has all expected roles', () => {
      const roles = ['SUPERADMIN', 'LEGAL_ADMIN', 'DPO_HUMANO', 'DPO_ANALISTA', 'CLIENTE_ADMIN', 'CLIENTE_COLABORADOR', 'AUDITOR_EXTERNO', 'MARK_AI'];
      for (const role of roles) {
        expect(() => RolSchema.parse(role)).not.toThrow();
      }
    });

    it('ActorTypeSchema has exactly 3 values', () => {
      expect(ActorTypeSchema.options).toHaveLength(3);
      expect(ActorTypeSchema.options).toEqual(['HUMANO', 'MARK_AI', 'SISTEMA']);
    });

    it('NivelRiesgoSchema has exactly 4 levels', () => {
      expect(NivelRiesgoSchema.options).toHaveLength(4);
    });

    it('EstadoHallazgoSchema includes CERRADO', () => {
      expect(EstadoHallazgoSchema.options).toContain('CERRADO');
    });

    it('EstadoIncidenteSchema includes NOTIFICADO_SPDP', () => {
      expect(EstadoIncidenteSchema.options).toContain('NOTIFICADO_SPDP');
    });

    it('EstadoTratamientoSchema includes CON_OBSERVACIONES', () => {
      expect(EstadoTratamientoSchema.options).toContain('CON_OBSERVACIONES');
    });
  });

  // ─── API types ───────────────────────────────────────────────────────
  describe('API shared types', () => {
    it('ApiErrorSchema validates standard error response', () => {
      const error = { statusCode: 422, message: 'Validation failed', timestamp: '2026-01-01T00:00:00Z' };
      expect(() => ApiErrorSchema.parse(error)).not.toThrow();
    });

    it('PaginationQuerySchema applies defaults', () => {
      const result = PaginationQuerySchema.parse({});
      expect(result.limit).toBe(20);
      expect(result.orden).toBe('desc');
    });

    it('PaginationQuerySchema clamps limit to 100', () => {
      expect(() => PaginationQuerySchema.parse({ limit: 101 })).toThrow();
    });

    it('PaginationQuerySchema rejects limit < 1', () => {
      expect(() => PaginationQuerySchema.parse({ limit: 0 })).toThrow();
    });
  });

  // ─── Cross-schema relationships ──────────────────────────────────────
  describe('Cross-schema field compatibility', () => {
    it('Evidencia.creadoPorId is compatible with User.id type', () => {
      const userIdField = UserSchema.shape.id;
      const evidenciaCreadoPorField = EvidenciaSchema.shape.creadoPorId;
      // Both should accept UUID strings
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(() => userIdField.parse(uuid)).not.toThrow();
      expect(() => evidenciaCreadoPorField.parse(uuid)).not.toThrow();
    });

    it('Hallazgo.normaId references Norma.id (same UUID type)', () => {
      const normaIdField = NormaSchema.shape.id;
      const hallazgoNormaIdField = HallazgoSchema.shape.normaId;
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(() => normaIdField.parse(uuid)).not.toThrow();
      expect(() => hallazgoNormaIdField.parse(uuid)).not.toThrow();
    });

    it('Incidente.activoId references a UUID (same as Activo.id)', () => {
      const field = IncidenteSchema.shape.activoId;
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(() => field.parse(uuid)).not.toThrow();
    });

    it('all schemas with tenantId use UUID format', () => {
      const schemasWithTenant = [
        TratamientoSchema, HallazgoSchema, EvidenciaSchema, IncidenteSchema,
        AuditLogSchema, RiesgoSchema, ControlSchema, RecomendacionSchema,
      ];
      const uuid = '550e8400-e29b-41d4-a716-446655440001';
      for (const schema of schemasWithTenant) {
        expect(() => (schema as z.ZodObject<any>).shape.tenantId.parse(uuid)).not.toThrow();
      }
    });
  });
});
