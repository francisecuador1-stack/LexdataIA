import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async generar(data: any) {
    // TODO: enqueue PDF generation
    return { id: 'stub', estado: 'EN_COLA' };
  }

  async download(id: string) {
    return { id, url: 'stub' };
  }
}
