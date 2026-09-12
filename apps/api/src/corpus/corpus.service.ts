import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CorpusService {
  constructor(private readonly prisma: PrismaService) {}

  async listNormas() {
    return { data: [], total: 0 };
  }

  async busquedaSemantica(query: string) {
    // TODO: integrate vector search for semantic matching
    return { query, results: [] };
  }

  async findNorma(id: string) {
    return { id, titulo: 'stub', contenido: 'stub' };
  }

  async listControles() {
    return { data: [], total: 0 };
  }

  async listPrincipios() {
    return { data: [], total: 0 };
  }

  async findPrincipio(id: string) {
    return { id, nombre: 'stub' };
  }

  async getMatriz() {
    // TODO: return the 18 normative controls matrix
    return { controles: [], total: 18 };
  }
}
