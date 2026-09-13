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
 * The Proxy on PrismaService automatically routes model access here
 * when a tenant transaction is active.
 */
export const tenantTxStore = new AsyncLocalStorage<Prisma.TransactionClient>();

/**
 * Model accessor names on PrismaClient, derived from Prisma DMMF at import time.
 * This ensures new models are automatically included — no manual list to maintain.
 */
const PRISMA_MODEL_NAMES: Set<string> = (() => {
  const dmmf = Prisma.dmmf?.datamodel?.models;
  if (!dmmf || dmmf.length === 0) {
    throw new Error(
      'Prisma DMMF not available. Run `pnpm db:generate` first. ' +
      'Without DMMF, the tenant Proxy cannot route queries and RLS isolation is broken.',
    );
  }
  return new Set(dmmf.map((m: { name: string }) => {
    const n = m.name;
    return n.charAt(0).toLowerCase() + n.slice(1);
  }));
})();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();

    // Return a Proxy that transparently routes model access to the
    // transactional client when a tenant context is active.
    // This means all 189+ existing `this.prisma.<model>.findMany(...)` calls
    // automatically run inside the SET LOCAL transaction — no code changes needed.
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (typeof prop === 'string' && PRISMA_MODEL_NAMES.has(prop)) {
          const txClient = tenantTxStore.getStore();
          if (txClient) {
            return (txClient as any)[prop];
          }
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Execute `fn` inside an interactive transaction that has SET LOCAL
   * for RLS tenant isolation. The tx client is stored in AsyncLocalStorage
   * so that the Proxy automatically routes model access to it.
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
        // Store the tx client — the Proxy will route model access here
        return tenantTxStore.run(tx, fn);
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  /**
   * Returns the tenant-scoped transactional client if inside a request
   * with tenant context, otherwise returns `this` (the base client).
   * Kept for explicit use in cases where the Proxy pattern doesn't apply.
   */
  get tenantClient(): PrismaClient | Prisma.TransactionClient {
    return tenantTxStore.getStore() ?? this;
  }
}
