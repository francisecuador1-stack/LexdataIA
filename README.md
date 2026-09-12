# LEXDATA IA — SGPDP · LOPDP Ecuador

Plataforma de cumplimiento de la **Ley Orgánica de Protección de Datos Personales (LOPDP)** del Ecuador. Implementa un Sistema de Gestión de Protección de Datos Personales (SGPDP) estructurado sobre el ciclo **PHVA** (Planificar–Hacer–Verificar–Actuar) en **7 fases**, operado por un DPO humano certificado ante la SPDP con asistencia de un agente de inteligencia artificial (**MARK AI**).

**Desarrollado por:** COGNITEX (Quito, Ecuador) en consorcio con estudio jurídico.

**DPO de referencia:** Dra. Andreina Almeida — DPO Certificada SPDP.

---

## Arquitectura

```
                         ┌────────────────────────────────┐
                         │        Usuarios finales        │
                         │  DPO · Cliente · Auditor Ext.  │
                         └──────┬──────────────┬──────────┘
                                │              │
                    ┌───────────▼───┐    ┌─────▼────────────┐
                    │   apps/web    │    │   apps/mobile    │
                    │ React + Vite  │    │ Flutter 3.x      │
                    │ TailwindCSS   │    │ Riverpod          │
                    │ shadcn/ui     │    │ go_router + dio   │
                    │ Deploy:Vercel │    │ Deploy: Stores    │
                    └───────┬───────┘    └──────┬───────────┘
                            │                   │
                            ▼                   ▼
                    ┌───────────────────────────────────┐
                    │           apps/api                │
                    │   NestJS 10 + Prisma + BullMQ     │
                    │   JWT + RLS + TenantGuard          │
                    │   Deploy: contenedor               │
                    └──┬──────┬──────┬──────┬───────────┘
                       │      │      │      │
              ┌────────▼┐  ┌──▼───┐ ┌▼────┐ ┌▼──────────────┐
              │Supabase │  │Redis │ │S3   │ │Anthropic API  │
              │Postgres │  │Bull  │ │WORM │ │MARK AI        │
              │17+pgvec │  │MQ    │ │     │ │(claude-opus-4)│
              └─────────┘  └──┬───┘ └─────┘ └───────────────┘
                              │
                       ┌──────▼──────┐
                       │ apps/worker │
                       │ Jobs: PDF,  │
                       │ embeddings, │
                       │ alertas 72h │
                       └─────────────┘
```

---

## Estructura del proyecto

```
lexdata-ia/
├── CLAUDE.md                  # Memoria permanente del proyecto
├── apps/
│   ├── web/                   # React 18 + Vite + TypeScript + Tailwind + shadcn/ui
│   ├── api/                   # NestJS 10 + Prisma + Postgres + BullMQ
│   ├── worker/                # Jobs (ingesta corpus, embeddings, PDF, alertas 72h)
│   └── mobile/                # Flutter 3.x (DPO en movilidad + colaboradores)
├── packages/
│   ├── contracts/             # Esquemas zod + tipos TS compartidos web↔api
│   ├── legal-corpus/          # Corpus normativo versionado (YAML/JSON + SHA-256)
│   └── ui/                    # Design system compartido (tokens + componentes)
├── supabase/
│   └── migrations/            # DDL versionado (fuente de verdad del esquema)
├── infra/                     # docker-compose, IaC
├── docs/                      # Documentación técnica y funcional
└── e2e/                       # Tests end-to-end
```

---

## Inicio rapido

### Prerrequisitos

- **Node.js** 22+
- **pnpm** 12+
- **Docker** y Docker Compose
- **Flutter** 3.x (solo para la app movil)

### Instalacion

```bash
# 1. Clonar el repositorio
git clone <url-del-repo> lexdata-ia
cd lexdata-ia

# 2. Levantar infraestructura local (PostgreSQL + pgvector, Redis, MinIO, Mailhog)
docker compose -f infra/docker-compose.yml up -d

# 3. Instalar dependencias
pnpm install

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales de Supabase, Anthropic, etc.

# 5. Base de datos
pnpm db:migrate        # Ejecutar migraciones Prisma
pnpm db:seed           # Sembrar datos ficticios

# 6. Desarrollo
pnpm dev
# Web: http://localhost:5173
# API: http://localhost:3001/health
```

### App movil (Flutter)

```bash
cd apps/mobile
flutter pub get
flutter run
```

---

## Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `pnpm dev` | Inicia web + api en modo desarrollo |
| `pnpm build` | Compila todos los paquetes |
| `pnpm typecheck` | Verificacion TypeScript |
| `pnpm lint` | Lint en todos los paquetes |
| `pnpm test` | Ejecuta todos los tests unitarios |
| `pnpm db:migrate` | Ejecuta migraciones Prisma |
| `pnpm db:seed` | Siembra datos ficticios |
| `pnpm db:reset` | Resetea y re-siembra la base de datos |
| `pnpm db:generate` | Regenera el cliente Prisma |

---

## Testing

```bash
# Tests unitarios (todos los paquetes)
pnpm test

# Tests end-to-end (Playwright)
pnpm test:e2e

# Typecheck + lint + test (validacion completa antes de commit)
pnpm typecheck && pnpm lint && pnpm test

# Flutter
cd apps/mobile
flutter analyze && flutter test
```

---

## Despliegue

### Staging

- Cada PR se despliega automaticamente en staging con datos ficticios.
- La web se despliega en Vercel (preview).
- API y worker se despliegan en contenedores (Railway / Fly).
- Base de datos: rama de Supabase (branch).

### Produccion

| Componente | Destino | Notas |
|---|---|---|
| `apps/web` | Vercel | CDN para SPA estatica |
| `apps/api` | Contenedor (Railway / Fly / VPS) | Con health check en `/health` |
| `apps/worker` | Contenedor (mismo host que API) | Procesa colas BullMQ |
| Base de datos | Supabase (Postgres gestionado) | Backups PITR, pgvector |
| Storage | Supabase Storage | Object-lock para evidencias |
| Redis | Upstash o Redis autoalojado | Colas BullMQ |
| Mobile | App Store / Google Play | Builds via CI |

**CI/CD** (GitHub Actions):
```
typecheck → lint → test unit → test e2e → build → migraciones → deploy
```

---

## Conceptos clave del dominio

### Ciclo PHVA en 7 fases

| Ciclo | Fase | Nombre | Funcion |
|-------|------|--------|---------|
| **P** (Planificar) | F1 | Normas | Motor de conocimiento normativo (biblioteca juridica) |
| **P** | F2 | Amenazas y Vulnerabilidades | RAT, riesgos, EIPD, mapa de calor |
| **P** | F3 | Implementacion | Diagnostico organizacional, gobierno, brechas |
| **P** | F4 | Definicion | Marco estrategico, controles de diseno, validacion |
| **H** (Hacer) | F5 | Supervision | Controles implementados, eficacia, hallazgos operativos |
| **V** (Verificar) | F6 | Auditoria | Monitoreo, auditorias, incidentes, KPIs |
| **A** (Actuar) | F7 | Mejora Continua | Recomendaciones, madurez, lecciones aprendidas |

### Roles del sistema

| Rol | Capacidad |
|-----|-----------|
| `SUPERADMIN` | Gestion de tenants, planes, usuarios globales |
| `LEGAL_ADMIN` | Versionar el corpus normativo y la matriz de controles |
| `DPO_HUMANO` | Todo el SGPDP del tenant: validar, aprobar, cerrar, firmar |
| `DPO_ANALISTA` | Registrar, redactar, cargar evidencias. No cierra ni aprueba |
| `CLIENTE_ADMIN` | Portal del cliente: diagnostico PIMS, documentos, capacitaciones |
| `CLIENTE_COLABORADOR` | Capacitaciones y consulta de documentos propios |
| `AUDITOR_EXTERNO` | Lectura + boveda de evidencias del ciclo auditado |
| `MARK_AI` | Agente de IA con restricciones de INV-5 |

### Trazabilidad F1 a F7

Cada hallazgo tiene "partida de nacimiento" en la norma (F1) y evidencia inalterable con hash SHA-256 (F6). La cadena de trazabilidad fluye:

```
F1 (Base legal) → F2 (Riesgo) → F3 (Diagnostico) → F4 (Control de diseno)
    → F5 (Control implementado) → F6 (Hallazgo de auditoria) → F7 (Mejora)
```

### MARK AI

Agente de IA operativo que analiza, documenta y propone. **No puede** aprobar, cerrar, firmar ni validar (INV-5). El DPO humano supervisa y decide. Ver [`docs/MARK-AI.md`](docs/MARK-AI.md) para detalles.

---

## Documentacion

| Documento | Descripcion |
|-----------|-------------|
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | Diagramas C4, modelo de datos, seguridad |
| [`docs/API.md`](docs/API.md) | Guia de la API REST |
| [`docs/MANUAL-DPO.md`](docs/MANUAL-DPO.md) | Manual del operador DPO |
| [`docs/MANUAL-CLIENTE.md`](docs/MANUAL-CLIENTE.md) | Manual del portal del cliente |
| [`docs/MARK-AI.md`](docs/MARK-AI.md) | Documentacion del agente MARK AI |
| [`docs/METODOLOGIA-PDVAR.md`](docs/METODOLOGIA-PDVAR.md) | Metodologia de scoring Pd-VaR |
| [`docs/CUMPLIMIENTO-PROPIO.md`](docs/CUMPLIMIENTO-PROPIO.md) | SGPDP propio de LEXDATA IA |
| [`CHANGELOG.md`](CHANGELOG.md) | Historial de versiones |

---

## Convenciones

- **Idioma UI:** Espanol (terminos legales ecuatorianos).
- **Idioma codigo:** Ingles (funciones, variables). Terminos de dominio legal en espanol (`tratamiento`, `hallazgo`, `encargado`, `titular`, `RAT`, `EIPD`).
- **Commits:** `feat(web): fase-2 mapa de calor`, `fix(api): reloj 72h en UTC`.
- **TypeScript:** `strict: true`, cero `any`. Zod valida todo input HTTP.
- **Datos:** Sin datos reales en el repositorio. Solo seeds ficticios.

---

## Licencia

Propietario. (c) COGNITEX — Quito, Ecuador. Todos los derechos reservados.
