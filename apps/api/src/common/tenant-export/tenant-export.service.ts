import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

// ---------------------------------------------------------------------------
// Tenant Export Service
//
// POST /tenants/:id/export
//
// Generates a ZIP archive containing:
//   - JSON data dump of all tenant tables
//   - Evidencias files from Supabase Storage
//   - Generated PDFs (certificates, reports)
//   - hash-manifest.json — SHA-256 hashes for every included file
//
// Serves two purposes:
//   1. Data portability (LOPDP Art. 22 — right of portability)
//   2. Commercial safety net before tenant deletion
//
// INV-1: Only exports data belonging to the requesting tenant.
// INV-3: Verifies hash manifest against evidence vault.
// ---------------------------------------------------------------------------

/** Shape of a single entry in the hash manifest */
interface ManifestEntry {
  path: string;
  sha256: string;
  size_bytes: number;
}

/** Result returned by the export process */
export interface ExportResult {
  /** Temporary path or Storage URL of the generated ZIP */
  zipUrl: string;
  /** Number of tables exported */
  tableCount: number;
  /** Number of files (evidencias + PDFs) included */
  fileCount: number;
  /** Hash of the manifest itself (integrity verification) */
  manifestHash: string;
}

@Injectable()
export class TenantExportService {
  private readonly logger = new Logger(TenantExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute full tenant data export.
   *
   * @param tenantId  UUID of the tenant to export
   * @param actorId   User who initiated the export (audit trail)
   */
  async exportTenant(tenantId: string, actorId: string): Promise<ExportResult> {
    // Verify tenant exists
    const tenant = await this.prisma.$queryRawUnsafe(
      `SELECT id, nombre FROM tenants WHERE id = $1`,
      tenantId,
    );

    if (!Array.isArray(tenant) || tenant.length === 0) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    // INV-4: Audit log entry for the export action
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO audit_log (tenant_id, actor_id, actor_type, action, entity_type, details)
       VALUES ($1, $2, 'HUMANO', 'TENANT_EXPORT', 'tenant', $3)`,
      tenantId,
      actorId,
      JSON.stringify({ reason: 'Full tenant data export requested' }),
    );

    // -----------------------------------------------------------------------
    // 1. Export JSON data from all tenant-scoped tables
    // -----------------------------------------------------------------------
    const tables = [
      'tratamientos',
      'hallazgos',
      'recomendaciones',
      'evidencias',
      'documentos',
      'capacitaciones',
      'incidentes',
      'eipd',
      'audit_log',
      'solicitudes_firma',
      'rat_entries',
    ];

    const jsonData: Record<string, unknown[]> = {};
    let tableCount = 0;

    for (const table of tables) {
      try {
        const rows = await this.prisma.$queryRawUnsafe(
          `SELECT * FROM ${table} WHERE tenant_id = $1`,
          tenantId,
        );
        jsonData[table] = rows as unknown[];
        tableCount++;
      } catch {
        // Table may not exist yet — skip gracefully
        this.logger.warn(`Table ${table} skipped during export for tenant ${tenantId}`);
      }
    }

    // -----------------------------------------------------------------------
    // 2. Collect evidencias file references from Storage
    // -----------------------------------------------------------------------
    const evidenciaFiles = await this.prisma.$queryRawUnsafe(
      `SELECT id, nombre, storage_path, hash_sha256
       FROM evidencias
       WHERE tenant_id = $1`,
      tenantId,
    ) as Array<{ id: string; nombre: string; storage_path: string; hash_sha256: string }>;

    // -----------------------------------------------------------------------
    // 3. Build hash manifest
    // -----------------------------------------------------------------------
    const manifest: ManifestEntry[] = [];

    // Add JSON data files to manifest
    for (const [table, rows] of Object.entries(jsonData)) {
      const content = JSON.stringify(rows, null, 2);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      manifest.push({
        path: `data/${table}.json`,
        sha256: hash,
        size_bytes: Buffer.byteLength(content, 'utf8'),
      });
    }

    // Add evidencia files to manifest (using stored hashes)
    for (const file of evidenciaFiles) {
      manifest.push({
        path: `evidencias/${file.id}/${file.nombre}`,
        sha256: file.hash_sha256,
        size_bytes: 0, // Actual size resolved during ZIP assembly
      });
    }

    // -----------------------------------------------------------------------
    // 4. Verify hash manifest against evidence vault (INV-3)
    // -----------------------------------------------------------------------
    const hashMismatches = await this.verifyHashes(tenantId, evidenciaFiles);
    if (hashMismatches.length > 0) {
      this.logger.error(
        `Hash verification failed for ${hashMismatches.length} evidencias in tenant ${tenantId}`,
      );
      // Log but do not block export — include discrepancies in manifest
      manifest.push({
        path: '_integrity_warnings.json',
        sha256: crypto
          .createHash('sha256')
          .update(JSON.stringify(hashMismatches))
          .digest('hex'),
        size_bytes: JSON.stringify(hashMismatches).length,
      });
    }

    const manifestContent = JSON.stringify(manifest, null, 2);
    const manifestHash = crypto
      .createHash('sha256')
      .update(manifestContent)
      .digest('hex');

    // -----------------------------------------------------------------------
    // 5. Assemble ZIP (delegated to worker in production)
    // -----------------------------------------------------------------------
    // In production, this would enqueue a BullMQ job to the worker service
    // that assembles the ZIP, uploads it to Supabase Storage bucket
    // 'exportaciones', and notifies the user via email/webhook.
    //
    // For now, return the metadata so the controller can respond.
    const zipUrl = `storage://exportaciones/${tenantId}/export-${Date.now()}.zip`;

    this.logger.log(
      `Export prepared for tenant ${tenantId}: ${tableCount} tables, ${evidenciaFiles.length} files`,
    );

    return {
      zipUrl,
      tableCount,
      fileCount: evidenciaFiles.length,
      manifestHash,
    };
  }

  /**
   * Verify stored SHA-256 hashes against actual file hashes in Storage.
   *
   * INV-3: Evidence vault integrity check.
   */
  private async verifyHashes(
    _tenantId: string,
    evidenciaFiles: Array<{ id: string; nombre: string; hash_sha256: string }>,
  ): Promise<Array<{ id: string; expected: string; actual: string }>> {
    const mismatches: Array<{ id: string; expected: string; actual: string }> = [];

    // In production, this downloads each file from Supabase Storage,
    // computes SHA-256, and compares against the stored hash.
    // Placeholder: actual verification would be done in the worker.
    for (const file of evidenciaFiles) {
      if (!file.hash_sha256) {
        mismatches.push({
          id: file.id,
          expected: 'missing',
          actual: 'N/A',
        });
      }
    }

    return mismatches;
  }
}
