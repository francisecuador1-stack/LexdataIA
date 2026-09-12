import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashBytes, buildChainFields } from '../common/hash-chain';
import { Prisma } from '@prisma/client';

@Injectable()
export class EvidenciasService {
  constructor(private readonly prisma: PrismaService) {}

  /** List evidencias for a tenant with optional filters */
  async list(tenantId: string, params?: { controlId?: string; fase?: number; limit?: number; cursor?: string }) {
    const where: Prisma.EvidenciaWhereInput = { tenantId };
    if (params?.controlId) where.controlId = params.controlId;
    if (params?.fase) where.fase = params.fase;

    const take = params?.limit ?? 50;
    const data = await this.prisma.evidencia.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(params?.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });

    const hasMore = data.length > take;
    if (hasMore) data.pop();

    return { data, total: await this.prisma.evidencia.count({ where }), hasMore };
  }

  /**
   * Upload an evidence file with SHA-256 hash chain (INV-3).
   * The file buffer should be passed after streaming to storage.
   */
  async registrar(tenantId: string, input: {
    nombre: string; tipoDocumento: string; formato?: string;
    controlId?: string; fase?: number; dimensionId?: string;
    storageKey: string; mime?: string; sizeBytes: number;
    fileBuffer: Buffer; cargadoPorId: string; cargadoPorArea?: string;
  }) {
    // Compute SHA-256 of file content
    const contentHash = hashBytes(input.fileBuffer);

    // Get last evidence in chain for this tenant
    const lastEntry = await this.prisma.evidencia.findFirst({
      where: { tenantId },
      orderBy: { chainIndex: 'desc' },
      select: { hashSha256: true, chainIndex: true },
    });

    const chain = buildChainFields(contentHash, lastEntry ?? null, new Date());

    // INV-3: retención = created_at + 5 años
    const retencionHasta = new Date();
    retencionHasta.setFullYear(retencionHasta.getFullYear() + 5);

    return this.prisma.evidencia.create({
      data: {
        tenantId,
        nombre: input.nombre,
        tipoDocumento: input.tipoDocumento,
        formato: input.formato,
        controlId: input.controlId,
        fase: input.fase,
        dimensionId: input.dimensionId,
        storageKey: input.storageKey,
        mime: input.mime,
        sizeBytes: input.sizeBytes,
        hashSha256: chain.hashSha256,
        prevHash: chain.prevHash,
        chainIndex: chain.chainIndex,
        cargadoPorId: input.cargadoPorId,
        cargadoPorArea: input.cargadoPorArea,
        retencionHasta,
      },
    });
  }

  /** Verify hash chain integrity for a specific evidence */
  async verificar(tenantId: string, id: string) {
    const evidencia = await this.prisma.evidencia.findFirst({ where: { id, tenantId } });
    if (!evidencia) throw new NotFoundException('Evidencia no encontrada');

    // Get all evidences in order to verify chain
    const chain = await this.prisma.evidencia.findMany({
      where: { tenantId, chainIndex: { lte: evidencia.chainIndex } },
      orderBy: { chainIndex: 'asc' },
      select: { id: true, hashSha256: true, prevHash: true, chainIndex: true },
    });

    let valid = true;
    const GENESIS = 'GENESIS';
    for (let i = 0; i < chain.length; i++) {
      const row = chain[i]!;
      const expectedPrev = i === 0 ? GENESIS : chain[i - 1]!.hashSha256;
      if (row.prevHash !== expectedPrev || row.chainIndex !== i) {
        valid = false;
        break;
      }
    }

    return { id, hash: evidencia.hashSha256, chainIndex: evidencia.chainIndex, valid };
  }

  /** Get a pre-signed URL for downloading (5 min expiry) */
  async getUrl(tenantId: string, id: string) {
    const evidencia = await this.prisma.evidencia.findFirst({ where: { id, tenantId } });
    if (!evidencia) throw new NotFoundException('Evidencia no encontrada');
    // TODO: Generate pre-signed URL from S3/Supabase Storage
    return { url: `https://storage.lexdata.ec/${evidencia.storageKey}?expires=300`, expiresIn: 300 };
  }

  // No PATCH or DELETE endpoints exist (INV-3: append-only)
}
