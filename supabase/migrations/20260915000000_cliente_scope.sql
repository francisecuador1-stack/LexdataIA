-- ════════════════════════════════════════════════════════════
-- Migration: cliente_scope
-- Add clienteId to Tratamiento and Activo for multi-client
-- scoping within a single tenant.
-- ════════════════════════════════════════════════════════════

ALTER TABLE tratamientos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id);
CREATE INDEX IF NOT EXISTS tratamientos_cliente_id_idx ON tratamientos (cliente_id);

ALTER TABLE activos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id);
CREATE INDEX IF NOT EXISTS activos_cliente_id_idx ON activos (cliente_id);
