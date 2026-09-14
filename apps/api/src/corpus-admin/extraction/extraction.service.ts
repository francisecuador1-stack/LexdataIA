import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { segmentar } from './segmentador';
import { verificarFidelidad } from './verificador-fidelidad';

@Injectable()
export class ExtractionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Run extraction synchronously on a document.
   * In production this would be enqueued via BullMQ; for now it runs inline
   * to keep the pipeline functional without Redis dependency.
   *
   * §6 steps 1-5
   */
  async extraer(documentoId: string, userId: string, tenantId: string) {
    const doc = await this.prisma.normaFuenteDocumento.findUnique({
      where: { id: documentoId },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    if (doc.estado === 'PUBLICADO') {
      throw new ConflictException('Documento ya publicado');
    }

    // Idempotent: if already extracted or extracting, check for existing job
    const existingJob = await this.prisma.jobIngesta.findFirst({
      where: {
        documentoId,
        tipo: 'extraccion',
        estado: { in: ['PENDIENTE', 'EJECUTANDO'] },
      },
    });
    if (existingJob) return existingJob;

    // Create job record
    const job = await this.prisma.jobIngesta.create({
      data: {
        documentoId,
        tipo: 'extraccion',
        estado: 'EJECUTANDO',
        iniciadoPorId: userId,
        startedAt: new Date(),
      },
    });

    try {
      // Update document state
      await this.prisma.normaFuenteDocumento.update({
        where: { id: documentoId },
        data: { estado: 'EXTRAYENDO' },
      });

      // Step 1: Get plain text
      // For now, use textoPlano if already set, otherwise the document
      // needs PDF extraction (will be done in worker with pdfjs-dist)
      let textoPlano = doc.textoPlano;
      if (!textoPlano) {
        if (doc.mimeType === 'text/plain') {
          // TXT: textoPlano should have been stored at upload time
          // For now we leave a placeholder
          textoPlano = '';
        } else {
          // PDF/DOCX: requires external extraction (pdfjs-dist / mammoth)
          // For now store a note; the worker will handle this
          await this.prisma.jobIngesta.update({
            where: { id: job.id },
            data: {
              estado: 'FALLIDO',
              errorMensaje: 'Extracción de PDF/DOCX requiere el worker. Suba un archivo TXT o espere al worker.',
              finishedAt: new Date(),
            },
          });
          await this.prisma.normaFuenteDocumento.update({
            where: { id: documentoId },
            data: { estado: 'ERROR', errorMensaje: 'Extracción de texto no disponible sin worker' },
          });
          return job;
        }
      }

      // Store plain text on the document
      await this.prisma.normaFuenteDocumento.update({
        where: { id: documentoId },
        data: { textoPlano },
      });

      // Step 2: Regex segmentation
      const segmentos = segmentar({
        texto: textoPlano,
        tipo: doc.tipo as 'NACIONAL' | 'INTERNACIONAL',
        fuente: doc.fuente,
      });

      // Step 3: Claude pass — skipped for now (PR 3 delivers regex-first)
      // Claude would be called here for segments the regex missed

      // Step 4: Fidelity verification
      // Step 5: Persist articles
      // Clear any existing articles from previous extraction
      await this.prisma.articuloExtraido.deleteMany({
        where: { documentoId },
      });

      let itemsOk = 0;
      let itemsError = 0;

      for (let i = 0; i < segmentos.length; i++) {
        const seg = segmentos[i]!;
        const fidelidad = verificarFidelidad(seg.textoNormativo, textoPlano);

        // Build proposed code: FUENTE-IDENTIFICADOR (e.g., LOPDP-ART-7)
        const codigoPropuesto = buildCodigo(doc.fuente, seg.identificador);

        await this.prisma.articuloExtraido.create({
          data: {
            documentoId,
            orden: i + 1,
            codigoPropuesto,
            identificador: seg.identificador,
            titulo: seg.titulo,
            textoNormativo: seg.textoNormativo,
            paginaInicio: seg.paginaInicio,
            offsetInicio: seg.offsetInicio,
            offsetFin: seg.offsetFin,
            metodoExtraccion: seg.metodoExtraccion,
            confianza: seg.confianza,
            fidelidadVerificada: fidelidad,
            estado: 'PROPUESTO',
            camposGeneradosIA: [],
          },
        });

        if (fidelidad) itemsOk++;
        else itemsError++;
      }

      // Update job and document state
      await this.prisma.jobIngesta.update({
        where: { id: job.id },
        data: {
          estado: 'COMPLETADO',
          progreso: 100,
          totalItems: segmentos.length,
          itemsOk,
          itemsError,
          finishedAt: new Date(),
        },
      });

      await this.prisma.normaFuenteDocumento.update({
        where: { id: documentoId },
        data: { estado: 'EXTRAIDO' },
      });

      // Audit
      await this.audit.registrar({
        tenantId,
        actorType: 'SISTEMA',
        actorId: userId,
        accion: 'CORPUS_EXTRACCION_COMPLETADA',
        entidad: 'NormaFuenteDocumento',
        entidadId: documentoId,
        despues: {
          articulosExtraidos: segmentos.length,
          conFidelidad: itemsOk,
          sinFidelidad: itemsError,
        },
      });

      return job;
    } catch (error) {
      // Mark job as failed
      await this.prisma.jobIngesta.update({
        where: { id: job.id },
        data: {
          estado: 'FALLIDO',
          errorMensaje: error instanceof Error ? error.message : String(error),
          finishedAt: new Date(),
        },
      });
      await this.prisma.normaFuenteDocumento.update({
        where: { id: documentoId },
        data: { estado: 'ERROR', errorMensaje: error instanceof Error ? error.message : String(error) },
      });
      throw error;
    }
  }

  /**
   * List extracted articles for a document.
   */
  async listArticulos(documentoId: string) {
    const doc = await this.prisma.normaFuenteDocumento.findUnique({
      where: { id: documentoId },
      select: { id: true },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');

    return this.prisma.articuloExtraido.findMany({
      where: { documentoId },
      orderBy: { orden: 'asc' },
    });
  }

  /**
   * Update an extracted article (edit fields, approve/discard).
   */
  async updateArticulo(
    articuloId: string,
    data: {
      titulo?: string;
      textoNormativo?: string;
      resumenEjecutivo?: string;
      categoria?: string;
      fasePHVA?: string;
      estado?: 'APROBADO' | 'DESCARTADO' | 'EDITADO';
      notaRevision?: string;
    },
    userId: string,
    tenantId: string,
  ) {
    const articulo = await this.prisma.articuloExtraido.findUnique({
      where: { id: articuloId },
      include: { documento: { select: { textoPlano: true } } },
    });
    if (!articulo) throw new NotFoundException('Artículo no encontrado');

    // INV: cannot approve an article with unverified fidelity unless it was edited
    if (data.estado === 'APROBADO' && !articulo.fidelidadVerificada) {
      // If the user edited the text, re-verify fidelity
      if (data.textoNormativo && articulo.documento.textoPlano) {
        const fidelidad = verificarFidelidad(data.textoNormativo, articulo.documento.textoPlano);
        if (!fidelidad) {
          throw new BadRequestException(
            'No se puede aprobar: el texto editado no coincide con el documento fuente. ' +
            'Verifique que el texto sea literal del documento original.',
          );
        }
      } else if (!data.textoNormativo) {
        throw new BadRequestException(
          'No se puede aprobar un artículo con fidelidad no verificada sin editar el texto primero.',
        );
      }
    }

    // Re-verify fidelity if text was edited
    let fidelidadVerificada = articulo.fidelidadVerificada;
    if (data.textoNormativo && articulo.documento.textoPlano) {
      fidelidadVerificada = verificarFidelidad(data.textoNormativo, articulo.documento.textoPlano);
    }

    const updated = await this.prisma.articuloExtraido.update({
      where: { id: articuloId },
      data: {
        ...(data.titulo !== undefined && { titulo: data.titulo }),
        ...(data.textoNormativo !== undefined && { textoNormativo: data.textoNormativo }),
        ...(data.resumenEjecutivo !== undefined && { resumenEjecutivo: data.resumenEjecutivo }),
        ...(data.categoria !== undefined && { categoria: data.categoria }),
        ...(data.fasePHVA !== undefined && { fasePHVA: data.fasePHVA as any }),
        ...(data.estado !== undefined && { estado: data.estado as any }),
        ...(data.notaRevision !== undefined && { notaRevision: data.notaRevision }),
        fidelidadVerificada,
        revisadoPorId: userId,
        revisadoAt: new Date(),
      },
    });

    await this.audit.registrar({
      tenantId,
      actorType: 'HUMANO',
      actorId: userId,
      accion: data.estado === 'APROBADO' ? 'CORPUS_ARTICULO_APROBADO'
        : data.estado === 'DESCARTADO' ? 'CORPUS_ARTICULO_DESCARTADO'
        : 'CORPUS_ARTICULO_EDITADO',
      entidad: 'ArticuloExtraido',
      entidadId: articuloId,
      antes: { estado: articulo.estado },
      despues: { estado: updated.estado, fidelidadVerificada },
    });

    return updated;
  }

  /**
   * Split an article into two at a given position.
   */
  async dividirArticulo(articuloId: string, userId: string, tenantId: string) {
    const articulo = await this.prisma.articuloExtraido.findUnique({
      where: { id: articuloId },
    });
    if (!articulo) throw new NotFoundException('Artículo no encontrado');

    // Split at the midpoint of the text
    const texto = articulo.textoNormativo;
    const midPoint = Math.floor(texto.length / 2);

    // Find a paragraph break near the midpoint
    const nearestBreak = texto.indexOf('\n\n', midPoint - 100);
    const splitAt = nearestBreak > 0 && nearestBreak < midPoint + 200
      ? nearestBreak
      : midPoint;

    const textoParte1 = texto.slice(0, splitAt).trim();
    const textoParte2 = texto.slice(splitAt).trim();

    // Shift orders of subsequent articles
    await this.prisma.articuloExtraido.updateMany({
      where: {
        documentoId: articulo.documentoId,
        orden: { gt: articulo.orden },
      },
      data: { orden: { increment: 1 } },
    });

    // Update current article with first half
    await this.prisma.articuloExtraido.update({
      where: { id: articuloId },
      data: {
        textoNormativo: textoParte1,
        fidelidadVerificada: false,
        estado: 'PROPUESTO',
      },
    });

    // Create second article
    const parte2 = await this.prisma.articuloExtraido.create({
      data: {
        documentoId: articulo.documentoId,
        orden: articulo.orden + 1,
        codigoPropuesto: `${articulo.codigoPropuesto}-B`,
        identificador: `${articulo.identificador} (cont.)`,
        titulo: `${articulo.titulo} (continuación)`,
        textoNormativo: textoParte2,
        metodoExtraccion: 'manual',
        confianza: null,
        fidelidadVerificada: false,
        estado: 'PROPUESTO',
        camposGeneradosIA: [],
      },
    });

    await this.audit.registrar({
      tenantId,
      actorType: 'HUMANO',
      actorId: userId,
      accion: 'CORPUS_ARTICULO_DIVIDIDO',
      entidad: 'ArticuloExtraido',
      entidadId: articuloId,
      despues: { nuevoArticuloId: parte2.id },
    });

    return { original: articuloId, nuevo: parte2.id };
  }

  /**
   * Publish approved articles as Norma + ControlNormativo + NormaVersion.
   * Only if ALL articles are APROBADO or DESCARTADO.
   * §5.1 POST /corpus/admin/documentos/:id/publicar
   */
  async publicar(
    documentoId: string,
    motivoCambio: string,
    userId: string,
    tenantId: string,
  ) {
    const doc = await this.prisma.normaFuenteDocumento.findUnique({
      where: { id: documentoId },
      include: { articulos: { orderBy: { orden: 'asc' } } },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    if (doc.estado === 'PUBLICADO') {
      throw new ConflictException('Documento ya publicado');
    }

    // Validate all articles are resolved
    const pendientes = doc.articulos.filter(
      (a) => a.estado !== 'APROBADO' && a.estado !== 'DESCARTADO',
    );
    if (pendientes.length > 0) {
      throw new BadRequestException(
        `Hay ${pendientes.length} artículos sin resolver. Todos deben estar APROBADO o DESCARTADO.`,
      );
    }

    const aprobados = doc.articulos.filter((a) => a.estado === 'APROBADO');
    if (aprobados.length === 0) {
      throw new BadRequestException('No hay artículos aprobados para publicar.');
    }

    // Validate fidelity on all approved articles
    const sinFidelidad = aprobados.filter((a) => !a.fidelidadVerificada);
    if (sinFidelidad.length > 0) {
      throw new BadRequestException(
        `${sinFidelidad.length} artículos aprobados sin fidelidad verificada. Edite el texto primero.`,
      );
    }

    if (!motivoCambio) {
      throw new BadRequestException('motivoCambio es obligatorio.');
    }

    // Transaction: create/update Norma records
    const normasCreadas: string[] = [];
    const normasActualizadas: string[] = [];

    for (const art of aprobados) {
      const hashSha256 = createHash('sha256')
        .update(`${art.codigoPropuesto}|${art.textoNormativo}`)
        .digest('hex');

      // Check if norma already exists
      const existing = await this.prisma.norma.findFirst({
        where: { codigo: art.codigoPropuesto },
      });

      if (existing) {
        // Create version snapshot before updating
        await this.prisma.normaVersion.create({
          data: {
            normaId: existing.id,
            version: existing.version,
            textoNormativo: existing.textoNormativo,
            resumenEjecutivo: existing.resumenEjecutivo,
            estado: existing.estado,
            hashSha256: existing.hashSha256,
            motivoCambio,
            creadoPorId: userId,
          },
        });

        // Bump version
        const currentVersion = parseFloat(existing.version) || 1.0;
        const newVersion = (currentVersion + 0.1).toFixed(1);

        await this.prisma.norma.update({
          where: { id: existing.id },
          data: {
            textoNormativo: art.textoNormativo,
            resumenEjecutivo: art.resumenEjecutivo ?? existing.resumenEjecutivo,
            titulo: art.titulo,
            categoria: art.categoria ?? existing.categoria,
            fasePHVA: (art.fasePHVA ?? existing.fasePHVA) as any,
            version: newVersion,
            hashSha256,
            textoVerificado: true,
            fuenteDocumentoId: documentoId,
          },
        });
        normasActualizadas.push(existing.id);
      } else {
        // Create new norma
        const norma = await this.prisma.norma.create({
          data: {
            codigo: art.codigoPropuesto,
            fuente: doc.fuente as any,
            tipo: doc.tipo as any,
            identificador: art.identificador,
            titulo: art.titulo,
            categoria: art.categoria ?? 'General',
            resumenEjecutivo: art.resumenEjecutivo ?? art.titulo,
            textoNormativo: art.textoNormativo,
            organismoEmisor: doc.organismoEmisor,
            fechaEmision: doc.fechaPublicacion ?? new Date(),
            version: '1.0',
            estado: 'VIGENTE',
            fasePHVA: (art.fasePHVA ?? 'PLANIFICAR') as any,
            hashSha256,
            modulosRelacionados: art.modulosRelacionados,
            textoVerificado: true,
            fuenteDocumentoId: documentoId,
          },
        });
        normasCreadas.push(norma.id);
      }
    }

    // Update document state
    await this.prisma.normaFuenteDocumento.update({
      where: { id: documentoId },
      data: { estado: 'PUBLICADO' },
    });

    // Audit
    await this.audit.registrar({
      tenantId,
      actorType: 'HUMANO',
      actorId: userId,
      accion: 'CORPUS_PUBLICADO',
      entidad: 'NormaFuenteDocumento',
      entidadId: documentoId,
      despues: {
        normasCreadas: normasCreadas.length,
        normasActualizadas: normasActualizadas.length,
        motivoCambio,
      },
    });

    return {
      normasCreadas: normasCreadas.length,
      normasActualizadas: normasActualizadas.length,
      totalArticulosAprobados: aprobados.length,
      descartados: doc.articulos.length - aprobados.length,
    };
  }
}

function buildCodigo(fuente: string, identificador: string): string {
  // "Art. 7" → "LOPDP-ART-7"
  // "§6.1.2" → "ISO27001-6-1-2"
  const clean = identificador
    .replace(/^Art(?:ículo|\.)\s*/i, 'ART-')
    .replace(/^§\s*/, '')
    .replace(/^Disp\.\s*/i, 'DISP-')
    .replace(/\./g, '-')
    .replace(/\s+/g, '-')
    .toUpperCase();

  return `${fuente}-${clean}`;
}
