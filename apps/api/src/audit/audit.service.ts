import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashJson, buildChainFields } from '../common/hash-chain';
import { Prisma } from '@prisma/client';

interface RegistrarInput {
  tenantId: string;
  actorType: 'HUMANO' | 'MARK_AI' | 'SISTEMA';
  actorId: string;
  accion: string;
  entidad: string;
  entidadId: string;
  antes?: Record<string, unknown> | null;
  despues?: Record<string, unknown> | null;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append-only audit log entry with hash chain (INV-4).
   * Uses advisory lock to prevent chain gaps under concurrency.
   */
  async registrar(input: RegistrarInput) {
    // Redact sensitive fields from before/after
    const antes = input.antes ? this.redactPii(input.antes) as any : null;
    const despues = input.despues ? this.redactPii(input.despues) as any : null;

    // Use a transaction with advisory lock to ensure chain continuity
    return this.prisma.$transaction(async (tx) => {
      // Advisory lock per tenant to serialize chain writes
      const lockKey = this.hashToLockKey(input.tenantId);
      await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${lockKey})`);

      // Get the last entry for this tenant
      const lastEntry = await tx.auditLog.findFirst({
        where: { tenantId: input.tenantId },
        orderBy: { createdAt: 'desc' },
        select: { hashSha256: true, chainIndex: true },
      });

      // Compute content hash and chain fields
      const contentHash = hashJson({
        tenantId: input.tenantId,
        actorType: input.actorType,
        actorId: input.actorId,
        accion: input.accion,
        entidad: input.entidad,
        entidadId: input.entidadId,
      });

      const now = new Date();
      const chain = buildChainFields(
        contentHash,
        lastEntry ? { hashSha256: lastEntry.hashSha256, chainIndex: lastEntry.chainIndex } : null,
        now,
      );

      return tx.auditLog.create({
        data: {
          tenantId: input.tenantId,
          actorType: input.actorType,
          actorId: input.actorId,
          accion: input.accion,
          entidad: input.entidad,
          entidadId: input.entidadId,
          antes,
          despues,
          ip: input.ip,
          userAgent: input.userAgent,
          hashSha256: chain.hashSha256,
          prevHash: chain.prevHash,
          chainIndex: chain.chainIndex,
          createdAt: now,
        },
      });
    });
  }

  /** List audit logs with filters */
  async list(params: {
    tenantId: string;
    entidad?: string;
    actorId?: string;
    from?: Date;
    to?: Date;
    limit?: number;
    cursor?: string;
  }) {
    const where: Prisma.AuditLogWhereInput = { tenantId: params.tenantId };
    if (params.entidad) where.entidad = params.entidad;
    if (params.actorId) where.actorId = params.actorId;
    if (params.from || params.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = params.from;
      if (params.to) where.createdAt.lte = params.to;
    }

    const take = params.limit ?? 50;
    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });

    const hasMore = logs.length > take;
    if (hasMore) logs.pop();

    return {
      data: logs,
      total: await this.prisma.auditLog.count({ where }),
      hasMore,
      cursor: logs.length > 0 ? logs[logs.length - 1]?.id : undefined,
    };
  }

  /** Verify hash chain integrity for a tenant */
  async verifyChain(tenantId: string) {
    const rows = await this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { chainIndex: 'asc' },
      select: { id: true, hashSha256: true, prevHash: true, chainIndex: true, createdAt: true },
    });

    let brokenAt = -1;
    const GENESIS = 'GENESIS';

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const expectedPrev = i === 0 ? GENESIS : rows[i - 1]!.hashSha256;
      if (row.prevHash !== expectedPrev || row.chainIndex !== i) {
        brokenAt = i;
        break;
      }
    }

    return {
      tenantId,
      totalEntries: rows.length,
      valid: brokenAt === -1,
      brokenAtIndex: brokenAt,
      brokenAtId: brokenAt >= 0 ? rows[brokenAt]?.id : null,
    };
  }

  /** Verify a document/certificate by its verification code */
  async verificarCodigo(codigo: string) {
    // Look up in documentos or certificados by codigo
    const certificado = await this.prisma.certificado.findUnique({
      where: { codigo },
      select: { hashSha256: true, emitidoAt: true, evaluacion: { select: { curso: { select: { titulo: true } } } } },
    });

    if (certificado) {
      return {
        hash: certificado.hashSha256,
        emitido_at: certificado.emitidoAt,
        tipo: 'certificado',
        descripcion: certificado.evaluacion.curso.titulo,
        valido: true,
      };
    }

    return null;
  }

  /** Convert tenant UUID to a numeric lock key for pg_advisory_lock */
  private hashToLockKey(tenantId: string): number {
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      const char = tenantId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /** Redact PII from audit log payloads */
  private redactPii(obj: Record<string, unknown>): Record<string, unknown> {
    const SENSITIVE = ['passwordHash', 'mfaSecret', 'password', 'token', 'refreshToken'];
    const result = { ...obj };
    for (const key of SENSITIVE) {
      if (key in result) result[key] = '[REDACTED]';
    }
    return result;
  }
}
