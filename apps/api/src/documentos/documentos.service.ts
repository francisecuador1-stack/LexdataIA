import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return { data: [], total: 0 };
  }

  async create(data: any) {
    return { id: 'stub', ...data };
  }

  async aprobar(id: string) {
    return { id, estado: 'APROBADO' };
  }

  async firmar(id: string, data: any) {
    return { id, estado: 'FIRMADO' };
  }

  async listSolicitudesFirma() {
    return { data: [], total: 0 };
  }
}
