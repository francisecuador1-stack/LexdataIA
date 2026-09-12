-- ============================================================
-- LEXDATA IA — Initial Schema Migration
-- Generated: 2026-09-12
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- 1. EXTENSIONS
-- ════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ════════════════════════════════════════════════════════════
-- 2. APPLICATION ROLE (INV-11)
-- ════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'lexdata_app') THEN
    CREATE ROLE lexdata_app NOLOGIN NOBYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO lexdata_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO lexdata_app;

-- ════════════════════════════════════════════════════════════
-- 3. ENUMS
-- ════════════════════════════════════════════════════════════

CREATE TYPE "FasePHVA" AS ENUM ('PLANIFICAR', 'HACER', 'VERIFICAR', 'ACTUAR');
CREATE TYPE "TipoNorma" AS ENUM ('NACIONAL', 'INTERNACIONAL');
CREATE TYPE "FuenteNorma" AS ENUM ('CRE', 'LOPDP', 'RGLOPDP', 'SPDP', 'SGPDP', 'ISO_27001', 'ISO_27701', 'ISO_42001', 'NIST');
CREATE TYPE "EstadoNorma" AS ENUM ('VIGENTE', 'DEROGADA', 'PROYECTO');
CREATE TYPE "EstadoPrincipio" AS ENUM ('VERIFICADO', 'PENDIENTE', 'NO_VERIFICADO');

CREATE TYPE "EstadoTratamiento" AS ENUM ('PENDIENTE', 'VALIDADO', 'CON_OBSERVACIONES');
CREATE TYPE "NivelRiesgo" AS ENUM ('BAJO', 'MEDIO', 'ALTO', 'CRITICO');
CREATE TYPE "EstadoRiesgo" AS ENUM ('IDENTIFICADO', 'EN_TRATAMIENTO', 'MITIGADO', 'ACEPTADO');
CREATE TYPE "NivelCategoriaDatos" AS ENUM ('ESTANDAR', 'REFORZADO', 'MAXIMO', 'MAXIMO_REPRESENTANTE');
CREATE TYPE "CriticidadActivo" AS ENUM ('BAJA', 'MEDIA', 'ALTA');

CREATE TYPE "TipoControl" AS ENUM ('TECNICO', 'ORGANIZATIVO', 'LEGAL', 'DOCUMENTAL');
CREATE TYPE "EstadoControl" AS ENUM ('PROPUESTA', 'APROBADA', 'EN_IMPLEMENTACION', 'IMPLEMENTADO', 'EN_PROGRESO', 'PENDIENTE');
CREATE TYPE "Eficacia" AS ENUM ('ALTA', 'MEDIA', 'BAJA', 'NO_EVALUADA');
CREATE TYPE "Confianza" AS ENUM ('ALTA', 'MEDIA', 'BAJA', 'NO_EVALUADA');
CREATE TYPE "Suficiencia" AS ENUM ('SUFICIENTE', 'PROPORCIONAL', 'INSUFICIENTE', 'NO_EVALUADA');

CREATE TYPE "TipoHallazgo" AS ENUM ('NC_MAYOR', 'NC_MENOR', 'OBSERVACION', 'OPORTUNIDAD', 'BUENA_PRACTICA', 'HALLAZGO_DISENO');
CREATE TYPE "SeveridadHallazgo" AS ENUM ('CRITICA', 'MAYOR', 'MENOR');
CREATE TYPE "EstadoHallazgo" AS ENUM ('ABIERTO', 'EN_PROCESO', 'PENDIENTE_EVIDENCIA', 'CERRADO', 'NO_RESUELTO');

CREATE TYPE "EstadoAuditoria" AS ENUM ('PROGRAMADA', 'EN_EJECUCION', 'CERRADA');
CREATE TYPE "TipoAuditoria" AS ENUM ('INTERNA', 'EXTERNA');
CREATE TYPE "RespuestaChecklist" AS ENUM ('CUMPLE', 'NO_CUMPLE', 'PARCIAL', 'NO_APLICA');
CREATE TYPE "PerfilChecklist" AS ENUM ('LOPDP', 'ISO_27701', 'VIDEOVIGILANCIA', 'SALUD_SENSIBLES', 'INTELIGENCIA_ARTIFICIAL');

CREATE TYPE "TipoIncidente" AS ENUM ('CONFIDENCIALIDAD', 'INTEGRIDAD', 'DISPONIBILIDAD');
CREATE TYPE "EstadoIncidente" AS ENUM ('DETECTADO', 'EN_CONTENCION', 'NOTIFICADO_SPDP', 'CERRADO');

CREATE TYPE "EstadoRecomendacion" AS ENUM ('EMITIDA', 'PENDIENTE', 'EN_PROCESO', 'EN_IMPLEMENTACION', 'IMPLEMENTADA', 'VERIFICADO', 'CERRADA');
CREATE TYPE "EstadoPlanAccion" AS ENUM ('COMPROMETIDO', 'EN_EJECUCION', 'COMPLETADO', 'VENCIDO');
CREATE TYPE "NivelMadurez" AS ENUM ('INICIAL', 'GESTIONADO', 'DEFINIDO', 'CONTROLADO', 'OPTIMIZADO');

CREATE TYPE "RespuestaDiagnostico" AS ENUM ('CUMPLE', 'PARCIAL', 'NO_CUMPLE');
CREATE TYPE "RespuestaPIMS" AS ENUM ('IMPLEMENTADO', 'EN_PROCESO', 'NO_IMPLEMENTADO');
CREATE TYPE "EstadoRol" AS ENUM ('DEFINIDO', 'PARCIALMENTE_DEFINIDO', 'NO_DEFINIDO');
CREATE TYPE "EstadoRecurso" AS ENUM ('SUFICIENTE', 'INSUFICIENTE', 'NO_EVALUADO');

CREATE TYPE "Rol" AS ENUM ('SUPERADMIN', 'LEGAL_ADMIN', 'DPO_HUMANO', 'DPO_ANALISTA', 'CLIENTE_ADMIN', 'CLIENTE_COLABORADOR', 'AUDITOR_EXTERNO', 'MARK_AI');
CREATE TYPE "ActorType" AS ENUM ('HUMANO', 'MARK_AI', 'SISTEMA');
CREATE TYPE "CasoCotizacion" AS ENUM ('A', 'B');

-- ════════════════════════════════════════════════════════════
-- 4. TABLES
-- ════════════════════════════════════════════════════════════

-- ── 4.1 CORE: tenants, usuarios, clientes ──────────────────

CREATE TABLE tenants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text NOT NULL,
  plan       text NOT NULL DEFAULT 'standard',
  activo     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE usuarios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  email         text NOT NULL,
  nombre        text NOT NULL,
  rol           "Rol" NOT NULL,
  password_hash text NOT NULL,
  mfa_secret    text,
  mfa_enabled   boolean NOT NULL DEFAULT false,
  ultimo_acceso timestamptz,
  activo        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT usuarios_email_key UNIQUE (email)
);
CREATE INDEX idx_usuarios_tenant_id ON usuarios(tenant_id);

CREATE TABLE clientes (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   uuid NOT NULL REFERENCES tenants(id),
  razon_social                text NOT NULL,
  ruc                         varchar(13) NOT NULL,
  actividad_economica         text,
  sector                      text,
  representante_legal         text,
  cedula_representante        varchar(10),
  direccion                   text,
  ciudad                      text,
  provincia                   text,
  telefono                    text,
  email                       text,
  sitio_web                   text,
  empleados                   text,
  transferencia_internacional boolean NOT NULL DEFAULT false,
  paises_destino              text[] DEFAULT '{}',
  encargado_externo           boolean NOT NULL DEFAULT false,
  nombre_encargado            text,
  trata_datos_sensibles       boolean NOT NULL DEFAULT false,
  tipos_datos_sensibles       text[] DEFAULT '{}',
  decisiones_automatizadas    boolean NOT NULL DEFAULT false,
  perfilamiento               boolean NOT NULL DEFAULT false,
  videovigilancia             boolean NOT NULL DEFAULT false,
  menores_edad                boolean NOT NULL DEFAULT false,
  dpia_realizada              boolean NOT NULL DEFAULT false,
  brecha_previa_reportada     boolean NOT NULL DEFAULT false,
  fecha_formulario            timestamptz,
  nivel_riesgo                "NivelRiesgo",
  pd_score                    integer,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clientes_ruc_key UNIQUE (ruc)
);
CREATE INDEX idx_clientes_tenant_id ON clientes(tenant_id);

-- ── 4.2 CORPUS NORMATIVO ───────────────────────────────────

CREATE TABLE normas (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo               text NOT NULL,
  fuente               "FuenteNorma" NOT NULL,
  tipo                 "TipoNorma" NOT NULL,
  identificador        text NOT NULL,
  titulo               text NOT NULL,
  categoria            text NOT NULL,
  resumen_ejecutivo    text NOT NULL,
  texto_normativo      text NOT NULL,
  organismo_emisor     text NOT NULL,
  fecha_emision        timestamptz NOT NULL,
  version              text NOT NULL DEFAULT '1.0',
  estado               "EstadoNorma" NOT NULL DEFAULT 'VIGENTE',
  fase_phva            "FasePHVA" NOT NULL,
  hash_sha256          text NOT NULL,
  modulos_relacionados text[] DEFAULT '{}',
  embedding            vector(1024),
  created_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT normas_codigo_key UNIQUE (codigo),
  CONSTRAINT normas_fuente_identificador_key UNIQUE (fuente, identificador)
);

CREATE TABLE controles_normativos (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  norma_id            uuid NOT NULL REFERENCES normas(id),
  titulo              text NOT NULL,
  descripcion         text NOT NULL,
  evidencia_requerida text NOT NULL,
  fase_phva           "FasePHVA" NOT NULL,
  hash_sha256         text NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE principios_rectores (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         text NOT NULL,
  base_normativa text NOT NULL,
  definicion     text NOT NULL,
  orden          integer NOT NULL,
  CONSTRAINT principios_rectores_nombre_key UNIQUE (nombre)
);

CREATE TABLE principio_preguntas_auditoria (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  principio_id uuid NOT NULL REFERENCES principios_rectores(id),
  orden        integer NOT NULL,
  pregunta     text NOT NULL
);

CREATE TABLE principios_estado (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  principio_id   uuid NOT NULL REFERENCES principios_rectores(id),
  estado         "EstadoPrincipio" NOT NULL DEFAULT 'PENDIENTE',
  verificado_at  timestamptz,
  verificado_por uuid,
  hash_evidencia text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT principios_estado_tenant_principio_key UNIQUE (tenant_id, principio_id)
);

CREATE TABLE norma_favoritas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id),
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  norma_id   uuid NOT NULL REFERENCES normas(id),
  CONSTRAINT norma_favoritas_tenant_usuario_norma_key UNIQUE (tenant_id, usuario_id, norma_id)
);

CREATE TABLE norma_vistas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id),
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  norma_id   uuid NOT NULL REFERENCES normas(id),
  visto_at   timestamptz NOT NULL DEFAULT now()
);

-- ── 4.3 INVENTARIO Y RIESGOS ──────────────────────────────

CREATE TABLE procesos (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  parent_id uuid REFERENCES procesos(id),
  nombre    text NOT NULL,
  nivel     text NOT NULL,
  estado    text NOT NULL DEFAULT 'PENDIENTE'
);
CREATE INDEX idx_procesos_tenant_id ON procesos(tenant_id);

CREATE TABLE proceso_normas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proceso_id uuid NOT NULL REFERENCES procesos(id),
  norma_id   uuid NOT NULL REFERENCES normas(id),
  CONSTRAINT proceso_normas_proceso_norma_key UNIQUE (proceso_id, norma_id)
);

CREATE TABLE tratamientos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id),
  codigo_rat        text NOT NULL,
  nombre            text NOT NULL,
  finalidad         text NOT NULL,
  base_legal        text,
  categorias        text[] DEFAULT '{}',
  datos_sensibles   boolean NOT NULL DEFAULT false,
  retencion         text,
  area              text,
  estado            "EstadoTratamiento" NOT NULL DEFAULT 'PENDIENTE',
  observaciones_dpo text,
  validado_por      uuid,
  validado_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tratamientos_tenant_codigo_rat_key UNIQUE (tenant_id, codigo_rat)
);
CREATE INDEX idx_tratamientos_tenant_id ON tratamientos(tenant_id);

CREATE TABLE activos (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES tenants(id),
  nombre              text NOT NULL,
  tipo                text NOT NULL,
  criticidad          "CriticidadActivo" NOT NULL,
  responsable         text NOT NULL,
  ubicacion           text NOT NULL,
  sistemas            text[] DEFAULT '{}',
  contiene_personales boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_activos_tenant_id ON activos(tenant_id);

CREATE TABLE tratamiento_activos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tratamiento_id  uuid NOT NULL REFERENCES tratamientos(id),
  activo_id       uuid NOT NULL REFERENCES activos(id),
  CONSTRAINT tratamiento_activos_tratamiento_activo_key UNIQUE (tratamiento_id, activo_id)
);

CREATE TABLE categorias_datos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         text NOT NULL,
  base_normativa text NOT NULL,
  nivel          "NivelCategoriaDatos" NOT NULL,
  descripcion    text,
  CONSTRAINT categorias_datos_nombre_key UNIQUE (nombre)
);

CREATE TABLE categorias_datos_tenant (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  categoria_id uuid NOT NULL REFERENCES categorias_datos(id),
  activa       boolean NOT NULL DEFAULT false,
  CONSTRAINT categorias_datos_tenant_tenant_categoria_key UNIQUE (tenant_id, categoria_id)
);

CREATE TABLE amenazas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia           text NOT NULL,
  nombre            text NOT NULL,
  descripcion       text NOT NULL,
  probabilidad_base smallint NOT NULL
);

CREATE TABLE vulnerabilidades (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amenaza_id uuid NOT NULL REFERENCES amenazas(id),
  nombre     text NOT NULL
);

CREATE TABLE riesgos (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id),
  tratamiento_id       uuid NOT NULL REFERENCES tratamientos(id),
  activo_id            uuid NOT NULL REFERENCES activos(id),
  amenaza_id           uuid REFERENCES amenazas(id),
  vulnerabilidad_texto text,
  impacto              smallint NOT NULL,
  probabilidad         smallint NOT NULL,
  score                smallint NOT NULL,
  nivel                "NivelRiesgo" NOT NULL,
  estado               "EstadoRiesgo" NOT NULL DEFAULT 'IDENTIFICADO',
  requiere_eipd        boolean NOT NULL DEFAULT false,
  revisado_dpo         boolean NOT NULL DEFAULT false,
  revisado_at          timestamptz,
  riesgo_residual      smallint,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_riesgos_tenant_id ON riesgos(tenant_id);
CREATE INDEX idx_riesgos_nivel ON riesgos(nivel);

CREATE TABLE evaluaciones_eipd (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id),
  tratamiento_id       uuid NOT NULL REFERENCES tratamientos(id),
  tipo                 text NOT NULL DEFAULT 'EIPD',
  gran_escala          boolean NOT NULL DEFAULT false,
  sensibles            boolean NOT NULL DEFAULT false,
  decisiones_auto      boolean NOT NULL DEFAULT false,
  perfilamiento        boolean NOT NULL DEFAULT false,
  menores              boolean NOT NULL DEFAULT false,
  puntaje_mtge         smallint,
  decision             text NOT NULL DEFAULT 'OBLIGATORIO',
  estado               text NOT NULL DEFAULT 'Pendiente',
  informe_documento_id uuid,
  firmado_por          uuid,
  hash_sha256          text,
  created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_evaluaciones_eipd_tenant_id ON evaluaciones_eipd(tenant_id);

-- ── 4.4 DIAGNOSTICO, GOBIERNO, CONTROLES ──────────────────

CREATE TABLE diagnostico_dimensiones (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  orden  integer NOT NULL,
  CONSTRAINT diagnostico_dimensiones_nombre_key UNIQUE (nombre)
);

CREATE TABLE diagnostico_preguntas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension_id   uuid NOT NULL REFERENCES diagnostico_dimensiones(id),
  orden          integer NOT NULL,
  enunciado      text NOT NULL,
  base_normativa text NOT NULL,
  creada_por_dpo boolean NOT NULL DEFAULT false,
  tenant_id      uuid
);

CREATE TABLE diagnostico_respuestas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  pregunta_id    uuid NOT NULL REFERENCES diagnostico_preguntas(id),
  respuesta      "RespuestaDiagnostico" NOT NULL,
  respondido_por uuid,
  respondido_at  timestamptz,
  CONSTRAINT diagnostico_respuestas_tenant_pregunta_key UNIQUE (tenant_id, pregunta_id)
);
CREATE INDEX idx_diagnostico_respuestas_tenant_id ON diagnostico_respuestas(tenant_id);

CREATE TABLE gobierno_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  nombre         text NOT NULL,
  base_normativa text NOT NULL,
  verificado     boolean NOT NULL DEFAULT false,
  evidencia_id   uuid,
  verificado_at  timestamptz
);
CREATE INDEX idx_gobierno_items_tenant_id ON gobierno_items(tenant_id);

CREATE TABLE roles_sgpdp (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id),
  nombre           text NOT NULL,
  descripcion      text,
  base_normativa   text NOT NULL,
  requiere_acta    boolean NOT NULL DEFAULT false,
  estado           "EstadoRol" NOT NULL DEFAULT 'NO_DEFINIDO',
  hash_acta        text,
  acta_documento_id uuid,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_roles_sgpdp_tenant_id ON roles_sgpdp(tenant_id);

CREATE TABLE recursos_evaluacion (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id),
  categoria       text NOT NULL,
  items           text[] DEFAULT '{}',
  estado          "EstadoRecurso" NOT NULL DEFAULT 'NO_EVALUADO',
  observacion_dpo text
);
CREATE INDEX idx_recursos_evaluacion_tenant_id ON recursos_evaluacion(tenant_id);

CREATE TABLE brechas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  codigo       text NOT NULL,
  origen       text NOT NULL DEFAULT 'SISTEMA',
  severidad    text NOT NULL,
  descripcion  text NOT NULL,
  dominio      text NOT NULL,
  fase_origen  text,
  estado       text NOT NULL DEFAULT 'ABIERTA',
  detectada_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_brechas_tenant_id ON brechas(tenant_id);

CREATE TABLE controles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id),
  tipo                 "TipoControl" NOT NULL,
  categoria            text,
  titulo               text NOT NULL,
  descripcion          text,
  base_normativa       text NOT NULL,
  norma_id             uuid REFERENCES normas(id),
  estado               "EstadoControl" NOT NULL DEFAULT 'PROPUESTA',
  prioridad            text,
  plazo                timestamptz,
  responsable          text,
  suficiencia          "Suficiencia" NOT NULL DEFAULT 'NO_EVALUADA',
  eficacia             "Eficacia" NOT NULL DEFAULT 'NO_EVALUADA',
  confianza_evidencia  "Confianza" NOT NULL DEFAULT 'NO_EVALUADA',
  calificado_por       uuid,
  calificado_at        timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_controles_tenant_id ON controles(tenant_id);

CREATE TABLE medidas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  tipo           "TipoControl" NOT NULL,
  subtipo        text,
  titulo         text NOT NULL,
  descripcion    text,
  base_normativa text NOT NULL,
  responsable    text,
  estado         text NOT NULL DEFAULT 'PENDIENTE',
  contraparte    text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_medidas_tenant_id ON medidas(tenant_id);

CREATE TABLE validacion_principios (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id),
  tratamiento_id  uuid NOT NULL REFERENCES tratamientos(id),
  veredicto       text NOT NULL,
  motivo          text,
  validado_por    uuid,
  validado_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_validacion_principios_tenant_id ON validacion_principios(tenant_id);

CREATE TABLE planes_accion (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  titulo      text NOT NULL,
  brecha_ref  text,
  hallazgo_id uuid,
  brecha_id   uuid REFERENCES brechas(id),
  responsable text NOT NULL,
  plazo       timestamptz NOT NULL,
  estado      "EstadoPlanAccion" NOT NULL DEFAULT 'COMPROMETIDO',
  hash_cierre text,
  cerrado_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_planes_accion_tenant_id ON planes_accion(tenant_id);

-- ── 4.5 EVIDENCIAS Y DOCUMENTOS ───────────────────────────

CREATE TABLE evidencias (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id),
  nombre           text NOT NULL,
  tipo_documento   text NOT NULL,
  formato          text,
  dimension_id     uuid,
  control_id       uuid REFERENCES controles(id),
  fase             smallint,
  storage_key      text NOT NULL,
  mime             text,
  size_bytes       integer NOT NULL,
  hash_sha256      text NOT NULL,
  prev_hash        text,
  chain_index      integer NOT NULL DEFAULT 0,
  cargado_por_id   uuid NOT NULL REFERENCES usuarios(id),
  cargado_por_area text,
  retencion_hasta  timestamptz NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
  -- APPEND ONLY: no updated_at (INV-3)
);
CREATE INDEX idx_evidencias_tenant_id ON evidencias(tenant_id);
CREATE INDEX idx_evidencias_hash_sha256 ON evidencias(hash_sha256);

CREATE TABLE documentos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id),
  tipo            text NOT NULL,
  titulo          text NOT NULL,
  version         text NOT NULL DEFAULT '1.0',
  estado          text NOT NULL DEFAULT 'PENDIENTE',
  contenido_md    text,
  pdf_storage_key text,
  hash_sha256     text,
  generado_por    "ActorType" NOT NULL DEFAULT 'SISTEMA',
  aprobado_por    uuid,
  aprobado_at     timestamptz,
  firma_id        uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_documentos_tenant_id ON documentos(tenant_id);

CREATE TABLE firmas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES tenants(id),
  documento_id        uuid NOT NULL REFERENCES documentos(id),
  usuario_id          uuid NOT NULL REFERENCES usuarios(id),
  metodo              text NOT NULL,
  declaracion_jurada  boolean NOT NULL DEFAULT false,
  ip                  text,
  user_agent          text,
  hash_firma          text NOT NULL,
  firmado_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_firmas_tenant_id ON firmas(tenant_id);

CREATE TABLE solicitudes_firma (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  tipo         text NOT NULL,
  entidad      text NOT NULL,
  entidad_id   uuid NOT NULL,
  motivo       text NOT NULL,
  creada_por   "ActorType" NOT NULL DEFAULT 'MARK_AI',
  estado       text NOT NULL DEFAULT 'PENDIENTE',
  resuelta_por uuid,
  resuelta_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_solicitudes_firma_tenant_id ON solicitudes_firma(tenant_id);

-- ── 4.6 AUDITORIA, CHECKLIST, INCIDENTES ──────────────────

CREATE TABLE auditorias (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id),
  codigo           text NOT NULL,
  tipo             "TipoAuditoria" NOT NULL,
  objetivo         text NOT NULL,
  responsable      text NOT NULL,
  fecha            timestamptz NOT NULL,
  estado           "EstadoAuditoria" NOT NULL DEFAULT 'PROGRAMADA',
  cumplimiento_pct smallint,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_auditorias_tenant_id ON auditorias(tenant_id);

CREATE TABLE revisiones_tecnicas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  auditoria_id uuid NOT NULL REFERENCES auditorias(id),
  descripcion  text NOT NULL,
  resultado    text NOT NULL,
  fecha        timestamptz NOT NULL
);
CREATE INDEX idx_revisiones_tecnicas_tenant_id ON revisiones_tecnicas(tenant_id);

CREATE TABLE checklist_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil         "PerfilChecklist" NOT NULL,
  orden          integer NOT NULL,
  pregunta       text NOT NULL,
  base_normativa text NOT NULL
);

CREATE TABLE checklist_respuestas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  auditoria_id  uuid REFERENCES auditorias(id),
  item_id       uuid NOT NULL REFERENCES checklist_items(id),
  respuesta     "RespuestaChecklist" NOT NULL,
  evidencia_id  uuid,
  respondido_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checklist_respuestas_tenant_auditoria_item_key UNIQUE (tenant_id, auditoria_id, item_id)
);

CREATE TABLE hallazgos (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               uuid NOT NULL REFERENCES tenants(id),
  codigo                  text NOT NULL,
  tipo                    "TipoHallazgo" NOT NULL,
  severidad               "SeveridadHallazgo" NOT NULL,
  descripcion             text NOT NULL,
  norma_id                uuid REFERENCES normas(id),
  documento_afectado      text,
  fase_origen             smallint,
  auditoria_id            uuid REFERENCES auditorias(id),
  estado                  "EstadoHallazgo" NOT NULL DEFAULT 'ABIERTO',
  detectado_at            timestamptz NOT NULL DEFAULT now(),
  cerrado_por             uuid,
  cerrado_at              timestamptz,
  hash_evidencia_cierre   text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_hallazgos_tenant_id ON hallazgos(tenant_id);
CREATE INDEX idx_hallazgos_estado ON hallazgos(estado);

CREATE TABLE incidentes (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              uuid NOT NULL REFERENCES tenants(id),
  codigo                 text NOT NULL,
  tipo                   "TipoIncidente" NOT NULL,
  tratamiento_id         uuid REFERENCES tratamientos(id),
  activo_id              uuid REFERENCES activos(id),
  descripcion            text NOT NULL,
  fecha_deteccion        timestamptz NOT NULL,
  fecha_max_reporte      timestamptz NOT NULL,
  notificado_spdp        boolean NOT NULL DEFAULT false,
  fecha_notificacion     timestamptz,
  titulares_comunicados  boolean NOT NULL DEFAULT false,
  estado                 "EstadoIncidente" NOT NULL DEFAULT 'DETECTADO',
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_incidentes_tenant_id ON incidentes(tenant_id);
CREATE INDEX idx_incidentes_notificado_spdp ON incidentes(notificado_spdp);

CREATE TABLE solicitudes_arco (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id),
  tipo            text NOT NULL,
  titular_ref     text NOT NULL,
  tratamiento_id  uuid REFERENCES tratamientos(id),
  recibida_at     timestamptz NOT NULL,
  plazo_limite    timestamptz NOT NULL,
  respondida_at   timestamptz,
  dias_respuesta  integer,
  estado          text NOT NULL DEFAULT 'RECIBIDA',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_solicitudes_arco_tenant_id ON solicitudes_arco(tenant_id);

CREATE TABLE kpi_snapshots (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  fecha     timestamptz NOT NULL,
  clave     text NOT NULL,
  valor     decimal(10,2) NOT NULL,
  meta      decimal(10,2)
);
CREATE INDEX idx_kpi_snapshots_tenant_fecha ON kpi_snapshots(tenant_id, fecha);

CREATE TABLE madurez_snapshots (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id),
  fecha      timestamptz NOT NULL,
  fase       smallint NOT NULL,
  porcentaje smallint NOT NULL,
  nivel      "NivelMadurez" NOT NULL,
  global     decimal(3,2)
);
CREATE INDEX idx_madurez_snapshots_tenant_fecha ON madurez_snapshots(tenant_id, fecha);

-- ── 4.7 MEJORA CONTINUA ───────────────────────────────────

CREATE TABLE recomendaciones (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES tenants(id),
  codigo             text NOT NULL,
  prioridad          text,
  dominio            text,
  titulo             text NOT NULL,
  descripcion        text NOT NULL,
  responsable        text NOT NULL,
  plazo              timestamptz NOT NULL,
  estado             "EstadoRecomendacion" NOT NULL DEFAULT 'EMITIDA',
  origen_hallazgo_id uuid REFERENCES hallazgos(id),
  verificado_por     uuid,
  verificado_at      timestamptz,
  hash_evidencia     text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_recomendaciones_tenant_id ON recomendaciones(tenant_id);

CREATE TABLE acciones_correctivas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id),
  recomendacion_id uuid NOT NULL REFERENCES recomendaciones(id),
  descripcion      text NOT NULL,
  responsable      text NOT NULL,
  plazo            timestamptz NOT NULL,
  estado           text NOT NULL DEFAULT 'PENDIENTE',
  evidencia_id     uuid,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_acciones_correctivas_tenant_id ON acciones_correctivas(tenant_id);

CREATE TABLE lecciones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  tipo        text NOT NULL,
  titulo      text NOT NULL,
  descripcion text NOT NULL,
  areas       text[] DEFAULT '{}',
  estado      text NOT NULL DEFAULT 'DOCUMENTADA',
  fecha       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lecciones_tenant_id ON lecciones(tenant_id);

CREATE TABLE oportunidades_mejora (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id),
  tipo             text NOT NULL,
  impacto          text NOT NULL,
  fase_origen      text NOT NULL,
  diagnostico      text NOT NULL,
  accion_propuesta text NOT NULL,
  aplicada         boolean NOT NULL DEFAULT false,
  aplicada_at      timestamptz
);
CREATE INDEX idx_oportunidades_mejora_tenant_id ON oportunidades_mejora(tenant_id);

-- ── 4.8 CAPACITACIONES ────────────────────────────────────

CREATE TABLE cursos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo         text NOT NULL,
  titulo         text NOT NULL,
  descripcion    text NOT NULL,
  nivel          text NOT NULL,
  categoria      text NOT NULL,
  base_normativa text NOT NULL,
  duracion_min   integer NOT NULL,
  num_preguntas  integer NOT NULL DEFAULT 10,
  activo         boolean NOT NULL DEFAULT true,
  CONSTRAINT cursos_codigo_key UNIQUE (codigo)
);

CREATE TABLE curso_preguntas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id    uuid NOT NULL REFERENCES cursos(id),
  orden       integer NOT NULL,
  enunciado   text NOT NULL,
  opciones    jsonb NOT NULL,
  correcta    smallint NOT NULL,
  explicacion text
);

CREATE TABLE inscripciones (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  curso_id       uuid NOT NULL REFERENCES cursos(id),
  persona_nombre text NOT NULL,
  persona_email  text NOT NULL,
  estado         text NOT NULL DEFAULT 'INSCRITO',
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inscripciones_tenant_id ON inscripciones(tenant_id);

CREATE TABLE evaluaciones (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  curso_id       uuid NOT NULL REFERENCES cursos(id),
  persona_nombre text NOT NULL,
  puntaje        smallint NOT NULL,
  aprobado       boolean NOT NULL,
  fecha          timestamptz NOT NULL DEFAULT now(),
  intento        integer NOT NULL DEFAULT 1
);
CREATE INDEX idx_evaluaciones_tenant_id ON evaluaciones(tenant_id);

CREATE TABLE certificados (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id),
  evaluacion_id   uuid NOT NULL REFERENCES evaluaciones(id),
  codigo          text NOT NULL,
  hash_sha256     text NOT NULL,
  pdf_storage_key text,
  emitido_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT certificados_evaluacion_id_key UNIQUE (evaluacion_id),
  CONSTRAINT certificados_codigo_key UNIQUE (codigo)
);

-- ── 4.9 PORTAL DEL CLIENTE / PIMS ────────────────────────

CREATE TABLE pims_modulos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero         smallint NOT NULL,
  titulo         text NOT NULL,
  descripcion    text NOT NULL,
  base_normativa text NOT NULL,
  CONSTRAINT pims_modulos_numero_key UNIQUE (numero)
);

CREATE TABLE pims_preguntas (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id uuid NOT NULL REFERENCES pims_modulos(id),
  orden     integer NOT NULL,
  enunciado text NOT NULL,
  nota      text
);

CREATE TABLE pims_respuestas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  pregunta_id   uuid NOT NULL REFERENCES pims_preguntas(id),
  respuesta     "RespuestaPIMS" NOT NULL,
  respondido_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pims_respuestas_tenant_pregunta_key UNIQUE (tenant_id, pregunta_id)
);
CREATE INDEX idx_pims_respuestas_tenant_id ON pims_respuestas(tenant_id);

CREATE TABLE solicitudes_registro (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             uuid REFERENCES tenants(id),
  datos                 jsonb NOT NULL,
  pd_score              integer,
  nivel_riesgo          "NivelRiesgo",
  caso                  "CasoCotizacion",
  honorario_mensual     decimal(10,2),
  implementacion_fee    decimal(10,2),
  breakdown             jsonb,
  declaracion_veracidad boolean NOT NULL DEFAULT false,
  nota_adicional        text,
  estado                text NOT NULL DEFAULT 'NUEVA',
  cliente_id            uuid REFERENCES clientes(id),
  created_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_solicitudes_registro_tenant_id ON solicitudes_registro(tenant_id);

-- ── 4.10 AGENTE Y AUDIT LOG ──────────────────────────────

CREATE TABLE audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  actor_type  "ActorType" NOT NULL,
  actor_id    uuid NOT NULL REFERENCES usuarios(id),
  accion      text NOT NULL,
  entidad     text NOT NULL,
  entidad_id  uuid NOT NULL,
  antes       jsonb,
  despues     jsonb,
  ip          text,
  user_agent  text,
  hash_sha256 text NOT NULL,
  prev_hash   text,
  chain_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
  -- APPEND ONLY: no updated_at (INV-4)
);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE TABLE agente_conversaciones (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id),
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  titulo     text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_agente_conversaciones_tenant_id ON agente_conversaciones(tenant_id);

CREATE TABLE agente_mensajes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id uuid NOT NULL REFERENCES agente_conversaciones(id),
  rol             text NOT NULL,
  contenido       text NOT NULL,
  tool_name       text,
  tool_input      jsonb,
  tool_output     jsonb,
  citas           jsonb,
  tokens_in       integer,
  tokens_out      integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE agente_actividad (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  fase        smallint NOT NULL,
  descripcion text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_agente_actividad_tenant_id ON agente_actividad(tenant_id);

CREATE TABLE corpus_chunks (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  norma_id             uuid REFERENCES normas(id),
  control_normativo_id uuid REFERENCES controles_normativos(id),
  contenido            text NOT NULL,
  metadata             jsonb,
  embedding            vector(1024),
  hash_sha256          text NOT NULL
);

-- ════════════════════════════════════════════════════════════
-- 5. GRANT lexdata_app ON ALL EXISTING TABLES
-- ════════════════════════════════════════════════════════════

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lexdata_app;

-- ════════════════════════════════════════════════════════════
-- 6. REVOKE privileges from anon and authenticated (INV-13)
-- ════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM authenticated;
  END IF;
END
$$;

-- ════════════════════════════════════════════════════════════
-- 7. ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

-- ── 7.1 Tenant-isolated tables ─────────────────────────────
-- JWT claim extraction helper:
--   (current_setting('request.jwt.claims', true)::jsonb)->>'tenant_id')::uuid

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'tenants',
      'usuarios', 'clientes', 'tratamientos', 'activos', 'riesgos',
      'controles', 'medidas', 'hallazgos', 'evidencias', 'documentos',
      'firmas', 'solicitudes_firma', 'incidentes', 'auditorias',
      'revisiones_tecnicas', 'checklist_respuestas', 'recomendaciones',
      'acciones_correctivas', 'planes_accion', 'brechas',
      'diagnostico_respuestas', 'gobierno_items', 'roles_sgpdp',
      'recursos_evaluacion', 'validacion_principios', 'principios_estado',
      'categorias_datos_tenant', 'evaluaciones_eipd', 'procesos',
      'solicitudes_arco', 'kpi_snapshots', 'madurez_snapshots',
      'lecciones', 'oportunidades_mejora', 'inscripciones',
      'evaluaciones', 'certificados', 'pims_respuestas',
      'solicitudes_registro', 'audit_logs',
      'agente_conversaciones', 'agente_actividad',
      'norma_favoritas', 'norma_vistas',
      'tratamiento_activos'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END
$$;

-- tenants: isolate by own id
CREATE POLICY tenant_isolation ON tenants
  FOR ALL TO lexdata_app
  USING (id = ((current_setting('request.jwt.claims', true)::jsonb)->>'tenant_id')::uuid);

-- All tenant_id-bearing tables
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'usuarios', 'clientes', 'tratamientos', 'activos', 'riesgos',
      'controles', 'medidas', 'hallazgos', 'evidencias', 'documentos',
      'firmas', 'solicitudes_firma', 'incidentes', 'auditorias',
      'revisiones_tecnicas', 'checklist_respuestas', 'recomendaciones',
      'acciones_correctivas', 'planes_accion', 'brechas',
      'diagnostico_respuestas', 'gobierno_items', 'roles_sgpdp',
      'recursos_evaluacion', 'validacion_principios', 'principios_estado',
      'categorias_datos_tenant', 'evaluaciones_eipd', 'procesos',
      'solicitudes_arco', 'kpi_snapshots', 'madurez_snapshots',
      'lecciones', 'oportunidades_mejora', 'inscripciones',
      'evaluaciones', 'certificados', 'pims_respuestas',
      'solicitudes_registro', 'audit_logs',
      'agente_conversaciones', 'agente_actividad',
      'norma_favoritas', 'norma_vistas'
    ])
  LOOP
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I FOR ALL TO lexdata_app USING (tenant_id = ((current_setting(''request.jwt.claims'', true)::jsonb)->>''tenant_id'')::uuid)',
      tbl
    );
  END LOOP;
END
$$;

-- tratamiento_activos: tenant isolation via join (no tenant_id column)
-- Use unrestricted policy since it's a junction table accessed through parent FKs
ALTER TABLE tratamiento_activos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tratamiento_activos_access ON tratamiento_activos
  FOR ALL TO lexdata_app
  USING (
    EXISTS (
      SELECT 1 FROM tratamientos t
      WHERE t.id = tratamiento_id
        AND t.tenant_id = ((current_setting('request.jwt.claims', true)::jsonb)->>'tenant_id')::uuid
    )
  );

-- proceso_normas: junction table, tenant isolation via proceso
ALTER TABLE proceso_normas ENABLE ROW LEVEL SECURITY;
CREATE POLICY proceso_normas_access ON proceso_normas
  FOR ALL TO lexdata_app
  USING (
    EXISTS (
      SELECT 1 FROM procesos p
      WHERE p.id = proceso_id
        AND p.tenant_id = ((current_setting('request.jwt.claims', true)::jsonb)->>'tenant_id')::uuid
    )
  );

-- agente_mensajes: tenant isolation via conversacion
ALTER TABLE agente_mensajes ENABLE ROW LEVEL SECURITY;
CREATE POLICY agente_mensajes_access ON agente_mensajes
  FOR ALL TO lexdata_app
  USING (
    EXISTS (
      SELECT 1 FROM agente_conversaciones c
      WHERE c.id = conversacion_id
        AND c.tenant_id = ((current_setting('request.jwt.claims', true)::jsonb)->>'tenant_id')::uuid
    )
  );

-- ── 7.2 Global catalog tables ──────────────────────────────
-- SELECT for lexdata_app, write only for LEGAL_ADMIN

ALTER TABLE normas ENABLE ROW LEVEL SECURITY;
CREATE POLICY normas_read ON normas FOR SELECT TO lexdata_app USING (true);
CREATE POLICY normas_write ON normas FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY normas_update ON normas FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY normas_delete ON normas FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE controles_normativos ENABLE ROW LEVEL SECURITY;
CREATE POLICY controles_normativos_read ON controles_normativos FOR SELECT TO lexdata_app USING (true);
CREATE POLICY controles_normativos_write ON controles_normativos FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY controles_normativos_update ON controles_normativos FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY controles_normativos_delete ON controles_normativos FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE principios_rectores ENABLE ROW LEVEL SECURITY;
CREATE POLICY principios_rectores_read ON principios_rectores FOR SELECT TO lexdata_app USING (true);
CREATE POLICY principios_rectores_write ON principios_rectores FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY principios_rectores_update ON principios_rectores FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY principios_rectores_delete ON principios_rectores FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE principio_preguntas_auditoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY principio_preguntas_read ON principio_preguntas_auditoria FOR SELECT TO lexdata_app USING (true);
CREATE POLICY principio_preguntas_write ON principio_preguntas_auditoria FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY principio_preguntas_update ON principio_preguntas_auditoria FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY principio_preguntas_delete ON principio_preguntas_auditoria FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE categorias_datos ENABLE ROW LEVEL SECURITY;
CREATE POLICY categorias_datos_read ON categorias_datos FOR SELECT TO lexdata_app USING (true);
CREATE POLICY categorias_datos_write ON categorias_datos FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY categorias_datos_update ON categorias_datos FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY categorias_datos_delete ON categorias_datos FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE amenazas ENABLE ROW LEVEL SECURITY;
CREATE POLICY amenazas_read ON amenazas FOR SELECT TO lexdata_app USING (true);
CREATE POLICY amenazas_write ON amenazas FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY amenazas_update ON amenazas FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY amenazas_delete ON amenazas FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE vulnerabilidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY vulnerabilidades_read ON vulnerabilidades FOR SELECT TO lexdata_app USING (true);
CREATE POLICY vulnerabilidades_write ON vulnerabilidades FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY vulnerabilidades_update ON vulnerabilidades FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY vulnerabilidades_delete ON vulnerabilidades FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE diagnostico_dimensiones ENABLE ROW LEVEL SECURITY;
CREATE POLICY diagnostico_dimensiones_read ON diagnostico_dimensiones FOR SELECT TO lexdata_app USING (true);
CREATE POLICY diagnostico_dimensiones_write ON diagnostico_dimensiones FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY diagnostico_dimensiones_update ON diagnostico_dimensiones FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY diagnostico_dimensiones_delete ON diagnostico_dimensiones FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE diagnostico_preguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY diagnostico_preguntas_read ON diagnostico_preguntas FOR SELECT TO lexdata_app USING (true);
CREATE POLICY diagnostico_preguntas_write ON diagnostico_preguntas FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY diagnostico_preguntas_update ON diagnostico_preguntas FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY diagnostico_preguntas_delete ON diagnostico_preguntas FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY checklist_items_read ON checklist_items FOR SELECT TO lexdata_app USING (true);
CREATE POLICY checklist_items_write ON checklist_items FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY checklist_items_update ON checklist_items FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY checklist_items_delete ON checklist_items FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY cursos_read ON cursos FOR SELECT TO lexdata_app USING (true);
CREATE POLICY cursos_write ON cursos FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY cursos_update ON cursos FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY cursos_delete ON cursos FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE curso_preguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY curso_preguntas_read ON curso_preguntas FOR SELECT TO lexdata_app USING (true);
CREATE POLICY curso_preguntas_write ON curso_preguntas FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY curso_preguntas_update ON curso_preguntas FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY curso_preguntas_delete ON curso_preguntas FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE pims_modulos ENABLE ROW LEVEL SECURITY;
CREATE POLICY pims_modulos_read ON pims_modulos FOR SELECT TO lexdata_app USING (true);
CREATE POLICY pims_modulos_write ON pims_modulos FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY pims_modulos_update ON pims_modulos FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY pims_modulos_delete ON pims_modulos FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE pims_preguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY pims_preguntas_read ON pims_preguntas FOR SELECT TO lexdata_app USING (true);
CREATE POLICY pims_preguntas_write ON pims_preguntas FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY pims_preguntas_update ON pims_preguntas FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY pims_preguntas_delete ON pims_preguntas FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

ALTER TABLE corpus_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY corpus_chunks_read ON corpus_chunks FOR SELECT TO lexdata_app USING (true);
CREATE POLICY corpus_chunks_write ON corpus_chunks FOR INSERT TO lexdata_app
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY corpus_chunks_update ON corpus_chunks FOR UPDATE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');
CREATE POLICY corpus_chunks_delete ON corpus_chunks FOR DELETE TO lexdata_app
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'rol' = 'LEGAL_ADMIN');

-- ── 7.3 Append-only tables (INV-3, INV-4) ─────────────────
-- Block UPDATE and DELETE on evidencias and audit_logs

CREATE POLICY evidencias_no_update ON evidencias FOR UPDATE TO lexdata_app USING (false);
CREATE POLICY evidencias_no_delete ON evidencias FOR DELETE TO lexdata_app USING (false);

CREATE POLICY audit_logs_no_update ON audit_logs FOR UPDATE TO lexdata_app USING (false);
CREATE POLICY audit_logs_no_delete ON audit_logs FOR DELETE TO lexdata_app USING (false);

-- ════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ════════════════════════════════════════════════════════════
