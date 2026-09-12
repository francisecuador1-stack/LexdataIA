import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Privileged database connection (role: postgres).
 *
 * INV-11: This is the ONLY service allowed to use the postgres superuser role.
 * Used exclusively for:
 *   - Tenant provisioning (creating tenant rows, initial setup)
 *   - Catalog administration (seeding normas, controles when LEGAL_ADMIN)
 *   - Migration-related maintenance
 *
 * NEVER inject this service into request-scoped handlers.
 * All request traffic MUST go through PrismaService (lexdata_app role).
 */
@Injectable()
export class SystemDbService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: { url: process.env['SYSTEM_DB_URL'] },
      },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
