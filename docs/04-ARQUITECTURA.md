# 04 · Arquitectura — LEXDATA IA

## 1. Monorepo

```
lexdata-ia/
├─ CLAUDE.md
├─ docs/            (02, 03, 04 de este paquete)
├─ apps/
│  ├─ web/          React 18 + Vite + TS + Tailwind + shadcn/ui
│  ├─ api/          NestJS 10 + Prisma + Postgres + BullMQ
│  ├─ worker/       Jobs (ingesta corpus, embeddings, PDF, alertas 72h, verify-chain)
│  └─ mobile/       Flutter 3.x (DPO en movilidad + colaboradores del cliente)
├─ packages/
│  ├─ contracts/    zod schemas + tipos + cliente API generado
│  ├─ legal-corpus/ normas en YAML + script de hash e ingesta
│  └─ ui/           tokens + componentes base compartidos web
└─ infra/           docker-compose (postgres+pgvector, redis, minio), migraciones, IaC
```

**Por qué NestJS y no Next.js API routes**: el dominio tiene 30+ entidades, RBAC,
colas, jobs, RLS por transacción y un agente con herramientas. La estructura modular
(módulo por fase) y la inyección de dependencias evitan que el backend se vuelva
una carpeta de funciones sueltas. La web queda como SPA pura: no necesita SSR porque
toda la app está detrás de login.

## 2. Capas del backend

```
apps/api/src/
├─ common/       guards (JwtAuthGuard, RolesGuard, TenantGuard), interceptors,
│                filtros de error, PrismaService con SET LOCAL app.tenant_id
├─ auth/         login, refresh, MFA TOTP, recuperación, sesiones
├─ tenants/      tenants, usuarios, invitaciones
├─ clientes/     empresas responsables del tratamiento + motor de riesgo del perfil
├─ corpus/       normas, controles normativos, principios (RN-004) — write solo LEGAL_ADMIN
├─ fase2/        procesos, tratamientos (RAT), activos, categorías, amenazas,
│                riesgos, EIPD/LIA, mapa de calor, brecha de controles
├─ fase3/        diagnóstico, gobierno, roles, recursos, brechas
├─ fase4/        controles de diseño, medidas, validación de principios, planes
├─ fase5/        controles implementados, eficacia, hallazgos operativos
├─ fase6/        auditorías, revisiones, checklist, hallazgos, incidentes, KPIs
├─ fase7/        recomendaciones, acciones, lecciones, madurez, oportunidades
├─ capacitaciones/ cursos, evaluaciones, certificados
├─ portal/       PIMS + formulario SPDP + motor Pd-VaR
├─ evidencias/   bóveda SHA-256, storage S3, cadena de integridad
├─ documentos/   generación documental, aprobación, firma
├─ reportes/     Reporting Engine (PDF institucionales)
├─ agente/       MARK AI: chat, RAG, tools, guardrails, cola de firma
└─ audit/        audit_log append-only + verify-chain
```

Cada módulo de fase expone, como mínimo: `GET /` (listado con filtros),
`GET /:id`, `POST /`, `PATCH /:id`, y los endpoints de acción de dominio
(`POST /tratamientos/:id/validar`, `POST /hallazgos/:id/cerrar`, …).
Las acciones de dominio **no** son `PATCH` genéricos: cada una valida su invariante.

## 3. Seguridad

| Tema | Decisión |
|---|---|
| Auth | JWT de acceso (15 min) + refresh rotativo en cookie `httpOnly`+`Secure`+`SameSite=Strict`. Revocación por `jti` en Redis. |
| Contraseñas | `argon2id`. Política mínima 12 caracteres. |
| MFA | TOTP **obligatorio** para `DPO_HUMANO`, `LEGAL_ADMIN` y `SUPERADMIN`. Un producto de cumplimiento sin MFA es indefendible. |
| Aislamiento | RLS en Postgres + `TenantGuard`. Los tests deben incluir un caso que intente leer otro tenant y falle. |
| Cifrado | TLS 1.3 en tránsito; cifrado en reposo en disco/volúmenes; columnas de datos de titulares (si alguna vez se guardan) con `pgcrypto`. |
| Storage | S3-compatible con **object-lock / WORM** y versionado; URLs prefirmadas de corta vida; nunca bucket público. |
| Rate limiting | Global + específico en login, chat del agente y generación de PDF. |
| Cabeceras | Helmet, CSP estricta, sin `unsafe-inline`. |
| Secretos | Solo por variables de entorno / gestor de secretos. Prohibido `.env` en git. |
| Logs | Sin datos personales en logs. Redacción de PII en el logger. |
| Retención | `retencion_hasta` en evidencias (5 años) y política de borrado documentada. |
| Residencia | Preferir región que el cliente pueda justificar ante la SPDP; documentar transferencias internacionales del propio producto (sí: LEXDATA IA también es responsable del tratamiento). |

## 4. Integridad y no repudio

1. Toda evidencia se hashea **en el momento de la subida** (streaming SHA-256) y se
   encadena (`prev_hash`). 2. Todo documento aprobado se sella con hash del contenido
   canónico + firma. 3. `audit_log` es append-only y encadenado. 4. Job `verify-chain`
   diario. 5. Los PDF institucionales llevan pie con `hash`, `código de verificación` y
   URL pública de verificación (`/verificar/:codigo`) que devuelve el hash esperado.

## 5. Reporting Engine

React + `@react-pdf/renderer` para plantillas simples, y Playwright/Chromium
(HTML → PDF) para los informes complejos con gráficos. Se ejecuta en el `worker`,
no en el proceso HTTP. Plantillas: Estado General del SGPDP, Informe de Auditoría,
Hallazgos e Incidentes, Dashboard de Indicadores, Reporte PHVA y Riesgos, Informe de
Implementación (F3), Reporte Ejecutivo de Riesgos (F2), Reporte de Alineación (F4),
informes de capacitaciones (3) y certificados individuales.
Todos con encabezado institucional, empresa, período, DPO responsable y hash.

## 6. MARK AI (resumen; detalle en `08-PROMPTS-MARK-AI.md`)

- Modelo: Claude vía Anthropic API (`claude-opus-4` o el vigente configurable por env).
- **RAG**: `corpus_chunks` con `pgvector`; chunk = artículo o sección completa;
  metadata `{fuente, identificador, fase_phva, categoria, hash}`.
  Búsqueda híbrida (vector + `tsvector` en español) con reranking por fuente.
- **Tools** (todas con `tenant_id` inyectado por el servidor, nunca por el modelo):
  `buscar_norma`, `estado_rat`, `resumen_riesgos`, `listar_hallazgos`,
  `estado_incidentes`, `dpas_pendientes`, `estado_arco`, `proxima_auditoria`,
  `documentos_pendientes`, `madurez_actual`, `redactar_documento`,
  `proponer_hallazgo`, `solicitar_firma_dpo`.
- **Guardrails duros** (en el servidor, no en el prompt):
  no existe tool para aprobar, cerrar, validar ni firmar. Toda respuesta que cite
  normativa debe adjuntar `citas[]` con `norma_id` + hash; si el RAG no devuelve
  soporte, el agente responde que no tiene base normativa cargada — **no** completa
  de memoria.
- Toda acción del agente se escribe en `audit_log` con `actor_type = MARK_AI`.

## 7. Entornos y despliegue

| Entorno | Notas |
|---|---|
| `local` | docker-compose: postgres+pgvector, redis, minio, mailhog. `pnpm dev`. |
| `staging` | Datos ficticios. Igual a producción. Todo PR se prueba aquí. |
| `producción` | API y worker en contenedores; Postgres gestionado con backups PITR; storage con object-lock; CDN para la web estática. |

CI (GitHub Actions): `typecheck → lint → test unit → test e2e (Playwright) → build →
migraciones → deploy`. Flutter: `flutter analyze && flutter test` + build de artefactos.

## 8. Observabilidad

Logs estructurados (pino) con `request_id` y `tenant_id`; métricas Prometheus
(latencia, colas, tokens del agente, PDFs generados); Sentry en web, api y Flutter;
alertas operativas: incidente a menos de 24 h de su plazo de 72 h, ruptura de cadena
de hash, fallo de ingesta del corpus, cola de firmas pendiente > 48 h.

## 9. Decisiones abiertas (decidir antes de B-01)

1. **Firma electrónica certificada** (Security Data / ANF / BCE) — ¿en MVP o fase 2?
2. **Residencia de datos** — ¿nube internacional o datacenter en Ecuador por exigencia
   del sector público?
3. **Módulo de facturación** — ¿la cotización Pd-VaR se integra con un CRM o queda
   como lead interno?
4. **Portal del titular** (ejercicio de derechos ARCO-PS por el ciudadano) — no está en
   el prototipo y es un módulo con demanda real; decidir si entra al roadmap.
