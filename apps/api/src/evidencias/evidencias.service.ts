import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvidenciasService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return { data: [], total: 0 };
  }

  async upload(data: any) {
    // TODO: compute SHA-256 and store in hash chain
    return { id: 'stub', hash: 'sha256-stub' };
  }

  async verificar(id: string) {
    // TODO: verify hash chain integrity
    return { id, valido: true, hash: 'sha256-stub' };
  }
}
