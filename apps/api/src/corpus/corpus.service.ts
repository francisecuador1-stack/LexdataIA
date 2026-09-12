import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CorpusService {
  constructor(private readonly prisma: PrismaService) {}

  async listNormas(params: {
    tipo?: string; fuente?: string; fasePHVA?: string;
    categoria?: string; estado?: string; q?: string;
    limit?: number; cursor?: string;
  }) {
    const where: Prisma.NormaWhereInput = {};
    if (params.tipo) where.tipo = params.tipo as any;
    if (params.fuente) where.fuente = params.fuente as any;
    if (params.fasePHVA) where.fasePHVA = params.fasePHVA as any;
    if (params.categoria) where.categoria = params.categoria;
    if (params.estado) where.estado = params.estado as any;
    if (params.q) {
      where.OR = [
        { titulo: { contains: params.q, mode: 'insensitive' } },
        { resumenEjecutivo: { contains: params.q, mode: 'insensitive' } },
        { identificador: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const take = params.limit ?? 50;
    const normas = await this.prisma.norma.findMany({
      where,
      include: { controlesNormativos: true },
      orderBy: { codigo: 'asc' },
      take: take + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });

    const hasMore = normas.length > take;
    if (hasMore) normas.pop();

    return {
      data: normas,
      total: await this.prisma.norma.count({ where }),
      hasMore,
      cursor: normas[normas.length - 1]?.id,
    };
  }

  async getNormaByCodigo(codigo: string) {
    return this.prisma.norma.findUnique({
      where: { codigo },
      include: {
        controlesNormativos: true,
      },
    });
  }

  async getMatriz(fasePHVA?: string) {
    const where: Prisma.ControlNormativoWhereInput = {};
    if (fasePHVA) where.fasePHVA = fasePHVA as any;

    return this.prisma.controlNormativo.findMany({
      where,
      include: { norma: { select: { codigo: true, fuente: true, identificador: true, titulo: true } } },
      orderBy: { fasePHVA: 'asc' },
    });
  }

  async listPrincipios() {
    return this.prisma.principioRector.findMany({
      include: { preguntas: { orderBy: { orden: 'asc' } } },
      orderBy: { orden: 'asc' },
    });
  }

  async getPrincipio(id: string) {
    return this.prisma.principioRector.findUnique({
      where: { id },
      include: {
        preguntas: { orderBy: { orden: 'asc' } },
        estados: true,
      },
    });
  }

  async actualizarEstadoPrincipio(tenantId: string, principioId: string, estado: string, userId: string, hashEvidencia?: string) {
    return this.prisma.principioEstado.upsert({
      where: { tenantId_principioId: { tenantId, principioId } },
      create: {
        tenantId, principioId,
        estado: estado as any,
        verificadoAt: estado === 'VERIFICADO' ? new Date() : null,
        verificadoPor: estado === 'VERIFICADO' ? userId : null,
        hashEvidencia,
      },
      update: {
        estado: estado as any,
        verificadoAt: estado === 'VERIFICADO' ? new Date() : null,
        verificadoPor: estado === 'VERIFICADO' ? userId : null,
        hashEvidencia,
      },
    });
  }

  async toggleFavorita(tenantId: string, usuarioId: string, normaId: string) {
    const existing = await this.prisma.normaFavorita.findUnique({
      where: { tenantId_usuarioId_normaId: { tenantId, usuarioId, normaId } },
    });
    if (existing) {
      await this.prisma.normaFavorita.delete({ where: { id: existing.id } });
      return { favorita: false };
    }
    await this.prisma.normaFavorita.create({ data: { tenantId, usuarioId, normaId } });
    return { favorita: true };
  }

  async registrarVista(tenantId: string, usuarioId: string, normaId: string) {
    return this.prisma.normaVista.create({ data: { tenantId, usuarioId, normaId } });
  }

  async buscar(q: string) {
    // Text search using Prisma contains (for now)
    // TODO: Implement hybrid vector + tsvector search with RRF
    const normas = await this.prisma.norma.findMany({
      where: {
        OR: [
          { titulo: { contains: q, mode: 'insensitive' } },
          { resumenEjecutivo: { contains: q, mode: 'insensitive' } },
          { textoNormativo: { contains: q, mode: 'insensitive' } },
          { identificador: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { controlesNormativos: true },
      take: 10,
    });
    return { data: normas, total: normas.length };
  }

  async getStats() {
    const [nacionales, internacionales, controles] = await Promise.all([
      this.prisma.norma.count({ where: { tipo: 'NACIONAL' } }),
      this.prisma.norma.count({ where: { tipo: 'INTERNACIONAL' } }),
      this.prisma.controlNormativo.count(),
    ]);
    return { nacionales, internacionales, total: nacionales + internacionales, controles };
  }
}
