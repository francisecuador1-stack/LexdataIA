import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return { data: [], total: 0 };
  }

  async findOne(id: string) {
    return { id, nombre: 'stub' };
  }

  async create(data: any) {
    return { id: 'stub', ...data };
  }

  async update(id: string, data: any) {
    return { id, ...data };
  }

  async listUsuarios(tenantId: string) {
    return { data: [], total: 0 };
  }

  async createUsuario(tenantId: string, data: any) {
    return { id: 'stub', tenantId, ...data };
  }
}
