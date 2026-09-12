# Changelog — LEXDATA IA

Todas las versiones notables del proyecto se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.6.0] — 2026-09-12 — QA, Seguridad y Despliegue (Q-01 a Q-07)

### Agregado
- **Q-01:** Suite de tests unitarios para todos los modulos del API (Jest + Supertest).
- **Q-02:** Tests end-to-end con Playwright para los flujos criticos (login, dashboard, fases, portal cliente).
- **Q-03:** Configuracion de CI/CD en GitHub Actions (typecheck, lint, test, build, deploy).
- **Q-04:** Hardening de seguridad: Helmet, CSP estricta, rate limiting global y por endpoint, validacion de inputs con zod en todas las rutas.
- **Q-05:** Configuracion de Sentry para observabilidad en web, API y Flutter.
- **Q-06:** Dockerfiles de produccion para API y worker con multi-stage builds.
- **Q-07:** Documentacion de entrega: README, ARQUITECTURA, API, manuales DPO/cliente, MARK-AI, METODOLOGIA-PDVAR, CUMPLIMIENTO-PROPIO.

---

## [0.5.0] — 2026-09-10 — App Movil Flutter (F-01 a F-10)

### Agregado
- **F-01:** Proyecto Flutter con arquitectura Riverpod + go_router + dio.
- **F-02:** Pantalla de login con autenticacion JWT y soporte MFA/TOTP.
- **F-03:** Dashboard movil con KPIs, radar de madurez y actividad reciente.
- **F-04:** Listado y detalle de hallazgos con filtros por tipo y estado.
- **F-05:** Boveda de evidencias movil: captura de foto, firma digital y subida con hash SHA-256.
- **F-06:** Modulo de incidentes con reloj de 72 horas y notificaciones push.
- **F-07:** Chat con MARK AI integrado en la app movil.
- **F-08:** Notificaciones push via Firebase Cloud Messaging para alertas criticas.
- **F-09:** Modo offline con sincronizacion diferida (Drift + cola local).
- **F-10:** Graficos con fl_chart para KPIs, radar de madurez y tendencias.

---

## [0.4.0] — 2026-09-06 — Agente MARK AI (M-01 a M-08)

### Agregado
- **M-01:** Infraestructura del agente: cliente Anthropic, system prompt con guardrails, gestion de sesiones.
- **M-02:** RAG con pgvector: ingesta del corpus normativo, chunking por articulo, busqueda hibrida (vector + tsvector en espanol) con reranking.
- **M-03:** 13 herramientas del agente (`buscar_norma`, `estado_rat`, `resumen_riesgos`, `listar_hallazgos`, `estado_incidentes`, `dpas_pendientes`, `estado_arco`, `proxima_auditoria`, `documentos_pendientes`, `madurez_actual`, `redactar_documento`, `proponer_hallazgo`, `solicitar_firma_dpo`).
- **M-04:** Guardrails en servidor: no existen tools para aprobar, cerrar, validar ni firmar (INV-5). Toda cita normativa requiere `norma_id` + hash del RAG.
- **M-05:** Registro en `audit_log` de toda accion del agente con `actor_type = MARK_AI`.
- **M-06:** Chat controller con streaming, rate limiting y validacion de tenant.
- **M-07:** Cola de solicitudes de firma (`solicitudes_firma`) para revision del DPO.
- **M-08:** Preguntas rapidas predefinidas y ticker de actividad en el topbar.

---

## [0.3.0] — 2026-09-03 — Frontend Web (W-01 a W-13)

### Agregado
- **W-01:** Cliente API (axios), stores Zustand, componentes UI base con shadcn/ui, hooks de TanStack Query.
- **W-02:** Shell de la aplicacion: topbar con ticker MARK AI, sidebar colapsable con selector de tenant, cabecera de modulo.
- **W-03:** Dashboard PHVA con KPIs, radar de madurez, progreso por fase, bitacora de actividad reciente.
- **W-04:** Fase 1 — Motor de Conocimiento Normativo: biblioteca juridica dual (nacional/internacional), matriz normativa RN-004, principios rectores.
- **W-05:** Fase 2 — Amenazas y Vulnerabilidades: cadena de valor, RAT supervisado, activos, categorias, riesgos, EIPD/LIA, matriz consolidada, mapa de calor, brecha de controles.
- **W-06:** Fase 3 — Implementacion Inicial: evaluacion organizacional (wizard 5 dimensiones), gobierno, roles, recursos, boveda SHA-256, gap analysis, recomendaciones, informe ejecutivo.
- **W-07:** Fase 4 — Definicion: controles de diseno, medidas tecnicas/organizativas/juridicas, evaluacion RN-401, hallazgos de diseno, planes de accion, reporte de alineacion.
- **W-08:** Fase 5 — Supervision: controles implementados, boveda operativa, evaluacion de eficacia, hallazgos operativos.
- **W-09:** Fase 6 — Auditoria: centro de monitoreo, auditorias, revisiones, checklist inteligente, indicadores, gestion de incidentes (72h), boveda de evidencias.
- **W-10:** Fase 7 — Mejora Continua: seguimiento de recomendaciones, madurez institucional, lecciones aprendidas, oportunidades detectadas automaticamente.
- **W-11:** Capacitaciones: e-learning (8 modulos LOPDP), central de evaluaciones, informes DPO, certificados virtuales (>=70%).
- **W-12:** Portal del Cliente: diagnostico PIMS (11 modulos, 33 preguntas), mi empresa, mis documentos, asistente.
- **W-13:** Formulario SPDP: wizard de 7 secciones con motor Pd-VaR, cotizacion automatica, caso A/B.

---

## [0.2.0] — 2026-08-28 — Backend Services (B-01 a B-14)

### Agregado
- **B-01:** Proyecto NestJS con Prisma, modulo comun (guards, interceptors, filtros de error), PrismaService con `SET LOCAL app.tenant_id`.
- **B-02:** Modulo de autenticacion: login con argon2id, JWT (15 min) + refresh rotativo en cookie httpOnly, MFA/TOTP obligatorio para DPO/LEGAL_ADMIN/SUPERADMIN.
- **B-03:** Modulo de tenants: CRUD de tenants, usuarios, invitaciones, gestion de roles.
- **B-04:** Modulo de clientes: empresas responsables del tratamiento, motor de riesgo del perfil, formulario SPDP.
- **B-05:** Modulo de corpus normativo: normas, controles normativos, principios rectores (RN-004). Escritura restringida a `LEGAL_ADMIN`.
- **B-06:** Modulo Fase 2: procesos, tratamientos (RAT), activos, categorias, amenazas, riesgos, EIPD/LIA, mapa de calor.
- **B-07:** Modulo Fase 3: diagnostico organizacional (wizard 5 dimensiones), gobierno, roles, recursos, brechas (gap analysis).
- **B-08:** Modulo Fase 4: controles de diseno, medidas tecnicas/organizativas/juridicas, validacion de principios (RN-401), planes de accion.
- **B-09:** Modulo Fase 5: controles implementados, evaluacion de eficacia (3 ejes), hallazgos operativos.
- **B-10:** Modulo Fase 6: auditorias, revisiones, checklist inteligente, hallazgos con trazabilidad F1-F6, indicadores KPI, gestion de incidentes con reloj de 72h.
- **B-11:** Modulo Fase 7: recomendaciones, acciones correctivas, verificacion de eficacia, madurez institucional (algoritmo PHVA ponderado), lecciones aprendidas.
- **B-12:** Modulo de evidencias: boveda SHA-256, cadena de integridad (`prev_hash`), retencion 5 anos, storage S3 con object-lock.
- **B-13:** Modulo de capacitaciones: cursos, evaluaciones, certificados (solo si puntaje >= 70%).
- **B-14:** Modulo de audit_log: append-only con cadena de hash, `actor_type` (HUMANO, MARK_AI, SISTEMA), job `verify-chain`.

---

## [0.1.0] — 2026-08-20 — Fundacion (I-01 a I-05)

### Agregado
- **I-01:** CLAUDE.md con todas las convenciones, invariantes, roles y paleta del proyecto.
- **I-02:** Especificacion funcional completa (02-ESPECIFICACION-FUNCIONAL.md) con inventario exhaustivo de las 13 pantallas del prototipo.
- **I-03:** Modelo de datos relacional con 30+ entidades, RLS por `tenant_id`, indices para consultas de fase.
- **I-04:** Documento de arquitectura (04-ARQUITECTURA.md): monorepo, capas del backend, seguridad, integridad, reporting engine, MARK AI, entornos.
- **I-05:** Estructura del monorepo pnpm + Turborepo, configuracion de TypeScript, ESLint, Prettier.
