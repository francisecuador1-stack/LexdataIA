import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  rol: string;
  sub: string;
}

/**
 * Holds the interactive-transaction Prisma client for the current request.
 * When populated, model queries should route through this client so they
 * run inside the same transaction as the SET LOCAL that set the RLS claims.
 */
export const tenantTxStore = new AsyncLocalStorage<Prisma.TransactionClient>();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Execute `fn` inside an interactive transaction that has SET LOCAL
   * for RLS tenant isolation. The tx client is stored in AsyncLocalStorage
   * so that `tenantClient` accessor returns it.
   *
   * INV-1: every business row has tenant_id and is protected by RLS.
   * INV-11: uses lexdata_app role with request.jwt.claims convention.
   */
  async withTenantTransaction<T>(
    ctx: TenantContext,
    fn: () => Promise<T>,
  ): Promise<T> {
    return this.$transaction(
      async (tx) => {
        const claims = JSON.stringify({
          tenant_id: ctx.tenantId,
          rol: ctx.rol,
          sub: ctx.sub,
        });
        // SET LOCAL lives for the duration of this interactive transaction.
        // Using parameterized query (not string interpolation).
        await tx.$executeRawUnsafe(
          `SELECT set_config('request.jwt.claims', $1, true)`,
          claims,
        );
        // Store the tx client and run the handler
        return tenantTxStore.run(tx, fn);
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  /**
   * Returns the tenant-scoped transactional client if inside a request
   * with tenant context, otherwise returns `this` (the base client).
   *
   * Services should use `this.prisma.tenantClient` for all tenant-scoped queries:
   *   this.prisma.tenantClient.tratamiento.findMany(...)
   */
  get tenantClient(): PrismaClient | Prisma.TransactionClient {
    return tenantTxStore.getStore() ?? this;
  }
}
