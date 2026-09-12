import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async getLogs() {
    return { data: [], total: 0 };
  }

  async verifyChain() {
    // TODO: verify integrity of the full audit hash chain
    return { valido: true, totalRegistros: 0 };
  }
}
