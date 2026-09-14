import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

// RN-004: Magic bytes for allowed file types
const MAGIC_BYTES: Record<string, Buffer> = {
  'application/pdf': Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    Buffer.from([0x50, 0x4b, 0x03, 0x04]), // PK\x03\x04 (ZIP/DOCX)
};

const MAX_UPLOAD_BYTES = (parseInt(process.env['CORPUS_MAX_UPLOAD_MB'] ?? '50', 10)) * 1024 * 1024;

interface UploadInput {
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
  fuente: string;
  tipo: string;
  organismoEmisor: string;
  fechaPublicacion?: string;
  registroOficial?: string;
  userId: string;
  tenantId: string;
}

@Injectable()
export class CorpusAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Upload a source document (PDF/DOCX/TXT).
   * Validates magic bytes, computes SHA-256, rejects duplicates.
   */
  async uploadDocumento(input: UploadInput) {
    const { file, fuente, tipo, organismoEmisor, fechaPublicacion, registroOficial, userId, tenantId } = input;

    // Validate file size
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(`Archivo excede el límite de ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB`);
    }

    // Validate magic bytes — don't trust Content-Type from client
    const detectedMime = this.detectMimeType(file.buffer);
    if (!detectedMime) {
      throw new BadRequestException('Tipo de archivo no permitido. Solo PDF, DOCX o TXT.');
    }

    // Compute SHA-256 of the binary
    const hashSha256 = createHash('sha256').update(file.buffer).digest('hex');

    // Reject duplicate by hash (409 Conflict)
    const existing = await this.prisma.normaFuenteDocumento.findFirst({
      where: { hashSha256 },
    });
    if (existing) {
      throw new ConflictException(`Documento ya cargado (SHA-256: ${hashSha256.slice(0, 12)}…). ID: ${existing.id}`);
    }

    // Sanitize filename
    const safeFilename = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 200);

    // Store in Supabase Storage / MinIO
    const storageKey = `corpus-fuentes/${Date.now()}_${safeFilename}`;

    // TODO: Actually upload to storage provider (MinIO/Supabase)
    // For now, we store the key and the document metadata.
    // The actual upload will be wired when storage client is available.

    const documento = await this.prisma.normaFuenteDocumento.create({
      data: {
        nombreArchivo: safeFilename,
        mimeType: detectedMime,
        tamanoBytes: file.size,
        storageKey,
        hashSha256,
        fuente: fuente as any,
        tipo: tipo as any,
        organismoEmisor,
        fechaPublicacion: fechaPublicacion ? new Date(fechaPublicacion) : null,
        registroOficial: registroOficial ?? null,
        subidoPorId: userId,
      },
    });

    // Audit: document upload
    await this.audit.registrar({
      tenantId,
      actorType: 'HUMANO',
      actorId: userId,
      accion: 'CORPUS_DOCUMENTO_SUBIDO',
      entidad: 'NormaFuenteDocumento',
      entidadId: documento.id,
      despues: { nombreArchivo: safeFilename, hashSha256, fuente, tipo },
    });

    return documento;
  }

  /**
   * List documents with pagination.
   */
  async listDocumentos(params: { limit?: number; cursor?: string }) {
    const take = Math.min(params.limit ?? 20, 100);
    const items = await this.prisma.normaFuenteDocumento.findMany({
      take: take + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { articulos: true, normas: true, jobs: true } },
      },
    });

    const hasMore = items.length > take;
    const data = hasMore ? items.slice(0, take) : items;

    return {
      data,
      hasMore,
      cursor: hasMore && data.length > 0 ? data[data.length - 1]!.id : null,
    };
  }

  /**
   * Get document detail with extraction summary.
   */
  async getDocumento(id: string) {
    const doc = await this.prisma.normaFuenteDocumento.findUnique({
      where: { id },
      include: {
        articulos: { orderBy: { orden: 'asc' } },
        normas: { select: { id: true, codigo: true, titulo: true } },
        jobs: { orderBy: { createdAt: 'desc' }, take: 5 },
        _count: { select: { articulos: true } },
      },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');

    const articuloStats = {
      total: doc.articulos.length,
      aprobados: doc.articulos.filter((a) => a.estado === 'APROBADO').length,
      descartados: doc.articulos.filter((a) => a.estado === 'DESCARTADO').length,
      propuestos: doc.articulos.filter((a) => a.estado === 'PROPUESTO').length,
      sinFidelidad: doc.articulos.filter((a) => !a.fidelidadVerificada).length,
    };

    return { ...doc, articuloStats };
  }

  /**
   * Get a signed URL for previewing the original document.
   * Returns a short-lived URL (15 min).
   */
  async getArchivoUrl(id: string) {
    const doc = await this.prisma.normaFuenteDocumento.findUnique({
      where: { id },
      select: { storageKey: true, mimeType: true, nombreArchivo: true },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');

    // TODO: Generate signed URL from MinIO/Supabase Storage
    // For now return the storage key — the actual signed URL generation
    // will be wired when storage client is available.
    return {
      url: `/storage/${doc.storageKey}`,
      mimeType: doc.mimeType,
      nombreArchivo: doc.nombreArchivo,
      expiresIn: 900, // 15 minutes
    };
  }

  /**
   * Soft delete a document. 409 if already published.
   */
  async deleteDocumento(id: string, userId: string, tenantId: string) {
    const doc = await this.prisma.normaFuenteDocumento.findUnique({
      where: { id },
      select: { id: true, estado: true, nombreArchivo: true },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    if (doc.estado === 'PUBLICADO') {
      throw new ConflictException('No se puede eliminar un documento publicado');
    }

    // Soft delete: mark as RECHAZADO (preserves data for audit trail)
    await this.prisma.normaFuenteDocumento.update({
      where: { id },
      data: { estado: 'RECHAZADO' },
    });

    await this.audit.registrar({
      tenantId,
      actorType: 'HUMANO',
      actorId: userId,
      accion: 'CORPUS_DOCUMENTO_ELIMINADO',
      entidad: 'NormaFuenteDocumento',
      entidadId: id,
      antes: { estado: doc.estado },
      despues: { estado: 'RECHAZADO' },
    });

    return { success: true };
  }

  /**
   * Get index status for the semantic engine dashboard.
   */
  async getIndiceEstado() {
    const [normasTotales, normasVerificadas, normasIndexadas, chunksTotales] =
      await Promise.all([
        this.prisma.norma.count(),
        this.prisma.norma.count({ where: { textoVerificado: true } }),
        this.prisma.norma.count({ where: { indexadoAt: { not: null } } }),
        this.prisma.corpusChunk.count(),
      ]);

    // Count chunks with embedding via raw query (Prisma can't query Unsupported types)
    const chunksConEmbedding = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM corpus_chunks WHERE embedding IS NOT NULL
    `.then((r) => Number(r[0]?.count ?? 0));

    // Get latest indexation info
    const ultimaIndexacion = await this.prisma.norma.findFirst({
      where: { indexadoAt: { not: null } },
      orderBy: { indexadoAt: 'desc' },
      select: { indexadoAt: true, modeloEmbedding: true },
    });

    return {
      normasTotales,
      normasVerificadas,
      normasIndexadas,
      chunksTotales,
      chunksConEmbedding,
      modelo: ultimaIndexacion?.modeloEmbedding ?? null,
      dimensiones: 1024,
      ultimaIndexacion: ultimaIndexacion?.indexadoAt ?? null,
      pendientes: normasVerificadas - normasIndexadas,
    };
  }

  /**
   * Get job progress (for polling from the UI).
   */
  async getJob(id: string) {
    const job = await this.prisma.jobIngesta.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job no encontrado');
    return job;
  }

  // ─── Private helpers ───────────────────────────────────────

  /**
   * Detect MIME type from magic bytes.
   * Returns null if the file type is not allowed.
   */
  private detectMimeType(buffer: Buffer): string | null {
    if (buffer.length < 4) return null;

    const head = buffer.subarray(0, 4);

    // PDF: %PDF
    if (head.compare(MAGIC_BYTES['application/pdf']!, 0, 4, 0, 4) === 0) {
      return 'application/pdf';
    }

    // DOCX (ZIP container): PK\x03\x04
    if (
      head.compare(
        MAGIC_BYTES['application/vnd.openxmlformats-officedocument.wordprocessingml.document']!,
        0,
        4,
        0,
        4,
      ) === 0
    ) {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    // TXT: allow if all bytes are printable ASCII/UTF-8 (heuristic)
    const sample = buffer.subarray(0, Math.min(512, buffer.length));
    const isPrintable = sample.every(
      (b) => (b >= 0x20 && b <= 0x7e) || b === 0x0a || b === 0x0d || b === 0x09 || b >= 0xc0,
    );
    if (isPrintable) return 'text/plain';

    return null;
  }
}
