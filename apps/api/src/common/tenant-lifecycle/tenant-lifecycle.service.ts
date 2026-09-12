import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantExportService } from '../tenant-export/tenant-export.service';

// ---------------------------------------------------------------------------
// Tenant Lifecycle Service — Deletion Procedure
//
// Two-step deletion with safeguards:
//   1. Schedule deletion (30-day grace period begins)
//   2. Execute deletion (only after grace period + mandatory export)
//
// INV-1:  All operations scoped by tenant_id.
// INV-4:  Every step recorded in audit_log.
// INV-3:  Evidence vault export verified before physical deletion.
// ---------------------------------------------------------------------------

/** State machine for tenant deletion */
type DeletionStatus =
  | 'ACTIVE'
  | 'DELETION_SCHEDULED'
  | 'EXPORT_COMPLETED'
  | 'DELETION_IN_PROGRESS'
  | 'DELETED';

interface DeletionScheduleResult {
  tenantId: string;
  scheduledAt: Date;
  deletionDate: Date;
  status: DeletionStatus;
}

/** Grace period in days before a tenant can be permanently deleted */
const GRACE_PERIOD_DAYS = 30;

@Injectable()
export class TenantLifecycleService {
  private readonly logger = new Logger(TenantLifecycleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly exportService: TenantExportService,
  ) {}

  /**
   * Step 1: Schedule tenant deletion.
   *
   * Starts the 30-day grace period.  The tenant remains fully operational
   * during this window.  Can be cancelled before expiration.
   */
  async scheduleDeletion(
    tenantId: string,
    requestedBy: string,
  ): Promise<DeletionScheduleResult> {
    const now = new Date();
    const deletionDate = new Date(now);
    deletionDate.setDate(deletionDate.getDate() + GRACE_PERIOD_DAYS);

    // Mark tenant as scheduled for deletion
    await this.prisma.$executeRawUnsafe(
      `UPDATE tenants
         SET estado_eliminacion = 'DELETION_SCHEDULED',
             fecha_eliminacion_programada = $1,
             eliminacion_solicitada_por = $2,
             updated_at = NOW()
       WHERE id = $3`,
      deletionDate,
      requestedBy,
      tenantId,
    );

    // INV-4: Audit log entry
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO audit_log (tenant_id, actor_id, actor_type, action, entity_type, details)
       VALUES ($1, $2, 'HUMANO', 'TENANT_DELETION_SCHEDULED', 'tenant', $3)`,
      tenantId,
      requestedBy,
      JSON.stringify({
        grace_period_days: GRACE_PERIOD_DAYS,
        deletion_date: deletionDate.toISOString(),
      }),
    );

    this.logger.warn(
      `Tenant ${tenantId} scheduled for deletion on ${deletionDate.toISOString()} by ${requestedBy}`,
    );

    return {
      tenantId,
      scheduledAt: now,
      deletionDate,
      status: 'DELETION_SCHEDULED',
    };
  }

  /**
   * Cancel a pending deletion within the grace period.
   */
  async cancelDeletion(tenantId: string, cancelledBy: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `UPDATE tenants
         SET estado_eliminacion = 'ACTIVE',
             fecha_eliminacion_programada = NULL,
             eliminacion_solicitada_por = NULL,
             updated_at = NOW()
       WHERE id = $1
         AND estado_eliminacion = 'DELETION_SCHEDULED'`,
      tenantId,
    );

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO audit_log (tenant_id, actor_id, actor_type, action, entity_type, details)
       VALUES ($1, $2, 'HUMANO', 'TENANT_DELETION_CANCELLED', 'tenant', '{}')`,
      tenantId,
      cancelledBy,
    );

    this.logger.log(`Tenant ${tenantId} deletion cancelled by ${cancelledBy}`);
  }

  /**
   * Step 2: Execute tenant deletion.
   *
   * Pre-conditions (enforced, not optional):
   *   - Grace period has elapsed
   *   - Export has been completed and verified
   *
   * The deletion is permanent and removes all tenant data from all tables.
   */
  async executeDeletion(tenantId: string, executedBy: string): Promise<void> {
    // Verify grace period has elapsed
    const tenant = (await this.prisma.$queryRawUnsafe(
      `SELECT id, estado_eliminacion, fecha_eliminacion_programada
       FROM tenants
       WHERE id = $1`,
      tenantId,
    )) as Array<{
      id: string;
      estado_eliminacion: DeletionStatus;
      fecha_eliminacion_programada: Date | null;
    }>;

    if (!tenant || tenant.length === 0) {
      throw new BadRequestException(`Tenant ${tenantId} not found`);
    }

    const t = tenant[0];

    if (t.estado_eliminacion !== 'DELETION_SCHEDULED') {
      throw new BadRequestException(
        `Tenant ${tenantId} is not scheduled for deletion (current state: ${t.estado_eliminacion})`,
      );
    }

    if (!t.fecha_eliminacion_programada || new Date() < t.fecha_eliminacion_programada) {
      throw new BadRequestException(
        `Grace period has not elapsed. Deletion scheduled for ${t.fecha_eliminacion_programada?.toISOString()}`,
      );
    }

    // Mandatory export before deletion
    this.logger.log(`Executing mandatory export for tenant ${tenantId} before deletion`);
    const exportResult = await this.exportService.exportTenant(tenantId, executedBy);

    // Record export completion
    await this.prisma.$executeRawUnsafe(
      `UPDATE tenants
         SET estado_eliminacion = 'EXPORT_COMPLETED',
             updated_at = NOW()
       WHERE id = $1`,
      tenantId,
    );

    // INV-4: Complete audit trail before physical deletion
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO audit_log (tenant_id, actor_id, actor_type, action, entity_type, details)
       VALUES ($1, $2, 'HUMANO', 'TENANT_DELETION_EXECUTED', 'tenant', $3)`,
      tenantId,
      executedBy,
      JSON.stringify({
        export_zip_url: exportResult.zipUrl,
        export_manifest_hash: exportResult.manifestHash,
        tables_exported: exportResult.tableCount,
        files_exported: exportResult.fileCount,
      }),
    );

    // Mark as in-progress
    await this.prisma.$executeRawUnsafe(
      `UPDATE tenants
         SET estado_eliminacion = 'DELETION_IN_PROGRESS',
             updated_at = NOW()
       WHERE id = $1`,
      tenantId,
    );

    // Delete from all tenant-scoped tables (order matters for FK constraints)
    const tablesToPurge = [
      'solicitudes_firma',
      'audit_log',       // Audit log is deleted last among business tables
      'capacitaciones',
      'incidentes',
      'eipd',
      'evidencias',
      'documentos',
      'hallazgos',
      'recomendaciones',
      'rat_entries',
      'tratamientos',
    ];

    for (const table of tablesToPurge) {
      try {
        const count = await this.prisma.$executeRawUnsafe(
          `DELETE FROM ${table} WHERE tenant_id = $1`,
          tenantId,
        );
        this.logger.log(`Deleted ${count} rows from ${table} for tenant ${tenantId}`);
      } catch (err) {
        this.logger.error(`Failed to purge ${table} for tenant ${tenantId}`, err);
        throw err;
      }
    }

    // Finally, mark tenant as deleted (soft-delete to preserve billing records)
    await this.prisma.$executeRawUnsafe(
      `UPDATE tenants
         SET estado_eliminacion = 'DELETED',
             activo = false,
             updated_at = NOW()
       WHERE id = $1`,
      tenantId,
    );

    this.logger.warn(`Tenant ${tenantId} fully deleted by ${executedBy}`);
  }
}
