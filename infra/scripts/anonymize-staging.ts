#!/usr/bin/env ts-node
// ---------------------------------------------------------------------------
// LEXDATA IA — Staging Anonymization Script
//
// Creates a staging-safe database dump with fictional but coherent data.
//
// CRITICAL:
//   - NEVER copy production data to staging.
//   - This script generates synthetic data that preserves referential
//     integrity, schema shape, and realistic volumes.
//   - All PII (names, emails, cédulas, phone numbers) is replaced with
//     deterministic fakes (seeded PRNG for reproducibility).
//
// Usage:
//   npx ts-node infra/scripts/anonymize-staging.ts
//
// Prerequisites:
//   - DATABASE_URL pointing to the staging database
//   - Staging DB must have the same schema as production (run migrations first)
// ---------------------------------------------------------------------------

import * as crypto from 'crypto';

// ---------------------------------------------------------------------------
// Deterministic fake data generators (seeded for reproducibility)
// ---------------------------------------------------------------------------

class FakeGenerator {
  private seed: number;

  constructor(seed = 42) {
    this.seed = seed;
  }

  /** Simple seeded PRNG (Mulberry32) */
  private next(): number {
    this.seed |= 0;
    this.seed = (this.seed + 0x6d2b79f5) | 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  integer(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  uuid(): string {
    return crypto.randomUUID();
  }

  email(name: string): string {
    const domains = ['ejemplo.com', 'demo.ec', 'staging.lexdata.test'];
    return `${name.toLowerCase().replace(/\s+/g, '.')}@${this.pick(domains)}`;
  }

  cedula(): string {
    // Fictional Ecuadorian cédula-shaped number (10 digits, not real)
    return `09${this.integer(10000000, 99999999)}`;
  }

  phone(): string {
    return `+593${this.integer(900000000, 999999999)}`;
  }

  companyName(): string {
    const prefixes = ['Demo', 'Test', 'Staging', 'Fictional', 'Sample'];
    const suffixes = ['Corp S.A.', 'Cía. Ltda.', 'Solutions EC', 'Group S.A.S.'];
    return `${this.pick(prefixes)} ${this.pick(suffixes)}`;
  }

  personName(): string {
    const firstNames = [
      'Carlos', 'María', 'Juan', 'Ana', 'Pedro',
      'Lucía', 'Diego', 'Valentina', 'Andrés', 'Camila',
    ];
    const lastNames = [
      'García', 'Rodríguez', 'Martínez', 'López', 'González',
      'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres',
    ];
    return `${this.pick(firstNames)} ${this.pick(lastNames)}`;
  }

  hash(): string {
    return crypto.createHash('sha256').update(this.uuid()).digest('hex');
  }
}

// ---------------------------------------------------------------------------
// SQL generation for staging data
// ---------------------------------------------------------------------------

function generateStagingSQL(): string {
  const fake = new FakeGenerator(2026);
  const statements: string[] = [];

  statements.push('-- LEXDATA IA Staging Anonymization Script');
  statements.push('-- Generated: ' + new Date().toISOString());
  statements.push('-- WARNING: This data is entirely fictional.');
  statements.push('');
  statements.push('BEGIN;');
  statements.push('');

  // Clean existing staging data
  statements.push('-- Clean existing data (staging only!)');
  const tables = [
    'solicitudes_firma', 'audit_log', 'capacitaciones', 'incidentes',
    'eipd', 'evidencias', 'documentos', 'hallazgos', 'recomendaciones',
    'rat_entries', 'tratamientos', 'usuarios', 'tenants',
  ];
  for (const table of tables) {
    statements.push(`TRUNCATE ${table} CASCADE;`);
  }
  statements.push('');

  // Generate tenants
  const tenantCount = 5;
  const tenantIds: string[] = [];

  statements.push('-- Tenants');
  for (let i = 0; i < tenantCount; i++) {
    const id = fake.uuid();
    tenantIds.push(id);
    const name = fake.companyName();
    statements.push(
      `INSERT INTO tenants (id, nombre, ruc, plan, activo, created_at) VALUES ` +
      `('${id}', '${name}', '${fake.integer(1700000000, 1799999999)}001', 'PROFESIONAL', true, NOW());`
    );
  }
  statements.push('');

  // Generate users per tenant
  statements.push('-- Usuarios');
  const userIds: string[] = [];
  const roles = ['DPO_HUMANO', 'DPO_ANALISTA', 'CLIENTE_ADMIN', 'CLIENTE_COLABORADOR'];

  for (const tenantId of tenantIds) {
    for (let i = 0; i < 4; i++) {
      const userId = fake.uuid();
      userIds.push(userId);
      const name = fake.personName();
      const role = roles[i];
      statements.push(
        `INSERT INTO usuarios (id, tenant_id, nombre, email, rol, cedula, telefono, activo, created_at) VALUES ` +
        `('${userId}', '${tenantId}', '${name}', '${fake.email(name)}', '${role}', '${fake.cedula()}', '${fake.phone()}', true, NOW());`
      );
    }
  }
  statements.push('');

  // Generate tratamientos
  statements.push('-- Tratamientos');
  const tratamientoIds: string[] = [];
  const finalidades = [
    'Gestión de nómina y recursos humanos',
    'Facturación y cobros a clientes',
    'Marketing y comunicaciones comerciales',
    'Videovigilancia de instalaciones',
    'Atención de peticiones y reclamos',
  ];

  for (const tenantId of tenantIds) {
    for (let i = 0; i < 3; i++) {
      const id = fake.uuid();
      tratamientoIds.push(id);
      statements.push(
        `INSERT INTO tratamientos (id, tenant_id, nombre, finalidad, base_legal, estado, created_at) VALUES ` +
        `('${id}', '${tenantId}', 'TRAT-${fake.integer(100, 999)}', '${fake.pick(finalidades)}', 'CONSENTIMIENTO', 'EN_REVISION', NOW());`
      );
    }
  }
  statements.push('');

  // Generate evidencias with proper hashes
  statements.push('-- Evidencias (INV-3: with hash chain)');
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (const tenantId of tenantIds) {
    for (let i = 0; i < 3; i++) {
      const id = fake.uuid();
      const currentHash = fake.hash();
      statements.push(
        `INSERT INTO evidencias (id, tenant_id, nombre, hash_sha256, prev_hash, storage_path, estado_retencion, retencion_hasta, created_at) VALUES ` +
        `('${id}', '${tenantId}', 'EV-${fake.integer(1000, 9999)}.pdf', '${currentHash}', '${prevHash}', 'evidencias/${tenantId}/${id}.pdf', 'VIGENTE', NOW() + INTERVAL '5 years', NOW());`
      );
      prevHash = currentHash;
    }
  }
  statements.push('');

  // Generate audit_log entries
  statements.push('-- Audit log (INV-4: with hash chain)');
  let auditPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const actions = ['CREATE_TRATAMIENTO', 'UPLOAD_EVIDENCIA', 'REVIEW_HALLAZGO', 'LOGIN', 'EXPORT_REPORT'];
  for (const tenantId of tenantIds) {
    for (let i = 0; i < 5; i++) {
      const entryHash = fake.hash();
      statements.push(
        `INSERT INTO audit_log (id, tenant_id, actor_id, actor_type, action, entity_type, hash_sha256, prev_hash, details, created_at) VALUES ` +
        `('${fake.uuid()}', '${tenantId}', '${fake.pick(userIds)}', '${fake.pick(['HUMANO', 'MARK_AI', 'SISTEMA'])}', '${fake.pick(actions)}', 'tratamiento', '${entryHash}', '${auditPrevHash}', '{"staging": true}', NOW() - INTERVAL '${fake.integer(1, 90)} days');`
      );
      auditPrevHash = entryHash;
    }
  }
  statements.push('');

  statements.push('COMMIT;');
  statements.push('');
  statements.push('-- Staging anonymization complete.');

  return statements.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // eslint-disable-next-line no-console
  console.log('LEXDATA IA — Staging Anonymization Script');
  // eslint-disable-next-line no-console
  console.log('=========================================\n');

  if (process.env['NODE_ENV'] === 'production') {
    // eslint-disable-next-line no-console
    console.error('FATAL: This script must NEVER run against production.');
    process.exit(1);
  }

  const sql = generateStagingSQL();

  // Output SQL to stdout for piping into psql:
  //   npx ts-node infra/scripts/anonymize-staging.ts | psql $STAGING_DATABASE_URL
  // eslint-disable-next-line no-console
  console.log(sql);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Anonymization failed:', err);
  process.exit(1);
});
