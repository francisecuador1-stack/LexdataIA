-- ════════════════════════════════════════════════════════════
-- Migration: corpus_semantico
-- Adds corpus admin models, semantic search infrastructure,
-- and textoVerificado flag for existing normas.
-- ════════════════════════════════════════════════════════════

-- 1. New enums
DO $$ BEGIN
  CREATE TYPE "EstadoDocumentoFuente" AS ENUM (
    'CARGADO', 'EXTRAYENDO', 'EXTRAIDO', 'EN_REVISION', 'PUBLICADO', 'RECHAZADO', 'ERROR'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EstadoArticuloExtraido" AS ENUM (
    'PROPUESTO', 'EDITADO', 'APROBADO', 'DESCARTADO'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EstadoJobIngesta" AS ENUM (
    'PENDIENTE', 'EJECUTANDO', 'COMPLETADO', 'FALLIDO'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. New columns on normas
ALTER TABLE normas ADD COLUMN IF NOT EXISTS texto_verificado BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE normas ADD COLUMN IF NOT EXISTS fuente_documento_id UUID;
ALTER TABLE normas ADD COLUMN IF NOT EXISTS indexado_at TIMESTAMPTZ;
ALTER TABLE normas ADD COLUMN IF NOT EXISTS modelo_embedding TEXT;

-- 3. New columns on corpus_chunks
ALTER TABLE corpus_chunks ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;
ALTER TABLE corpus_chunks ADD COLUMN IF NOT EXISTS encabezado TEXT;
ALTER TABLE corpus_chunks ADD COLUMN IF NOT EXISTS tokens INTEGER;
ALTER TABLE corpus_chunks ADD COLUMN IF NOT EXISTS modelo_embedding TEXT;
ALTER TABLE corpus_chunks ADD COLUMN IF NOT EXISTS dimensiones INTEGER;
ALTER TABLE corpus_chunks ADD COLUMN IF NOT EXISTS indexado_at TIMESTAMPTZ;

-- Index + unique constraint on corpus_chunks
CREATE INDEX IF NOT EXISTS corpus_chunks_norma_id_idx ON corpus_chunks (norma_id);
CREATE UNIQUE INDEX IF NOT EXISTS corpus_chunks_norma_id_orden_key ON corpus_chunks (norma_id, orden);

-- 4. NormaFuenteDocumento
CREATE TABLE IF NOT EXISTS norma_fuente_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_archivo TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  tamano_bytes INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  hash_sha256 TEXT NOT NULL,
  paginas INTEGER,
  fuente "FuenteNorma" NOT NULL,
  tipo "TipoNorma" NOT NULL,
  organismo_emisor TEXT NOT NULL,
  fecha_publicacion TIMESTAMPTZ,
  registro_oficial TEXT,
  estado "EstadoDocumentoFuente" NOT NULL DEFAULT 'CARGADO',
  texto_plano TEXT,
  error_mensaje TEXT,
  subido_por_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK from normas to fuente_documento
ALTER TABLE normas
  ADD CONSTRAINT normas_fuente_documento_id_fkey
  FOREIGN KEY (fuente_documento_id) REFERENCES norma_fuente_documentos(id)
  ON DELETE SET NULL;

-- 5. ArticuloExtraido
CREATE TABLE IF NOT EXISTS articulos_extraidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID NOT NULL REFERENCES norma_fuente_documentos(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL,
  codigo_propuesto TEXT NOT NULL,
  identificador TEXT NOT NULL,
  titulo TEXT NOT NULL,
  categoria TEXT,
  texto_normativo TEXT NOT NULL,
  resumen_ejecutivo TEXT,
  fase_phva "FasePHVA",
  modulos_relacionados TEXT[] DEFAULT '{}',
  controles_sugeridos JSONB,
  pagina_inicio INTEGER,
  offset_inicio INTEGER,
  offset_fin INTEGER,
  metodo_extraccion TEXT NOT NULL,
  confianza DOUBLE PRECISION,
  fidelidad_verificada BOOLEAN NOT NULL DEFAULT false,
  campos_generados_ia TEXT[] DEFAULT '{}',
  estado "EstadoArticuloExtraido" NOT NULL DEFAULT 'PROPUESTO',
  revisado_por_id UUID,
  revisado_at TIMESTAMPTZ,
  nota_revision TEXT,
  UNIQUE (documento_id, orden)
);

-- 6. NormaVersion
CREATE TABLE IF NOT EXISTS norma_versiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norma_id UUID NOT NULL REFERENCES normas(id),
  version TEXT NOT NULL,
  texto_normativo TEXT NOT NULL,
  resumen_ejecutivo TEXT NOT NULL,
  estado "EstadoNorma" NOT NULL,
  hash_sha256 TEXT NOT NULL,
  motivo_cambio TEXT,
  creado_por_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (norma_id, version)
);

-- 7. JobIngesta
CREATE TABLE IF NOT EXISTS jobs_ingesta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID REFERENCES norma_fuente_documentos(id),
  tipo TEXT NOT NULL,
  estado "EstadoJobIngesta" NOT NULL DEFAULT 'PENDIENTE',
  progreso INTEGER NOT NULL DEFAULT 0,
  total_items INTEGER,
  items_ok INTEGER NOT NULL DEFAULT 0,
  items_error INTEGER NOT NULL DEFAULT 0,
  error_mensaje TEXT,
  iniciado_por_id UUID NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Vector index (HNSW cosine) on corpus_chunks
CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX IF NOT EXISTS corpus_chunks_embedding_hnsw
  ON corpus_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 9. Full-text search in Spanish (replaces LIKE)
ALTER TABLE normas ADD COLUMN IF NOT EXISTS busqueda_tsv tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce(titulo, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(identificador, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(resumen_ejecutivo, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(texto_normativo, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS normas_busqueda_tsv_gin ON normas USING gin (busqueda_tsv);

ALTER TABLE corpus_chunks ADD COLUMN IF NOT EXISTS busqueda_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(contenido, ''))) STORED;

CREATE INDEX IF NOT EXISTS corpus_chunks_busqueda_tsv_gin ON corpus_chunks USING gin (busqueda_tsv);

-- 10. Mark existing normas with placeholder text as unverified
UPDATE normas
   SET texto_verificado = false
 WHERE texto_normativo LIKE '%TODO: verificar con LEGAL_ADMIN%';

-- 11. Grant permissions to lexdata_app on new tables
DO $$ BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON norma_fuente_documentos TO lexdata_app;
  GRANT SELECT, INSERT, UPDATE, DELETE ON articulos_extraidos TO lexdata_app;
  GRANT SELECT, INSERT, UPDATE, DELETE ON norma_versiones TO lexdata_app;
  GRANT SELECT, INSERT, UPDATE, DELETE ON jobs_ingesta TO lexdata_app;
EXCEPTION WHEN undefined_object THEN
  RAISE NOTICE 'Role lexdata_app does not exist yet — grants skipped (OK for local dev)';
END $$;
