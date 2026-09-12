CLAUDE.md — LEXDATA IA (SGPDP · LOPDP Ecuador)
> Copia este archivo como `CLAUDE.md` en la raíz del monorepo.
> Es la memoria permanente del proyecto: Claude Code lo lee en cada sesión.
Qué es este producto
LEXDATA IA es la plataforma de cumplimiento de la Ley Orgánica de Protección de
Datos Personales (LOPDP) del Ecuador. Implementa un SGPDP (Sistema de Gestión de
Protección de Datos Personales) estructurado sobre el ciclo PHVA en 7 fases, operado
por un DPO humano certificado ante la SPDP con asistencia de un agente de IA
(MARK AI), y consumido por empresas clientes (responsables del tratamiento) a
través de un portal propio.
Dueño del producto: COGNITEX (Quito, Ecuador) en consorcio con estudio jurídico.
DPO de referencia del producto: Dra. Andreina Almeida — DPO Certificada SPDP.
Autoridad reguladora: SPDP (Superintendencia de Protección de Datos Personales).
En resoluciones recientes del prototipo aparece también SGPDP como emisor.
Proposición de valor (no la pierdas de vista al programar)
Trazabilidad F1→F7: todo hallazgo tiene "partida de nacimiento" en la norma
(Fase 1) y evidencia inalterable con hash (Fase 6).
Defendibilidad: cada control, evidencia y decisión se puede exhibir ante la SPDP
con fecha, autor, norma aplicable y hash SHA-256.
IA supervisada: MARK AI ejecuta el trabajo operativo; el DPO humano decide.
La independencia y la reserva humana son requisitos legales, no features.
Stack (canónico — no lo cambies sin actualizar este archivo)
Monorepo pnpm + Turborepo.
```
apps/
  web/         React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui + Recharts
               TanStack Query (server state) + Zustand (UI state) + react-hook-form + zod
  api/         NestJS 10 + TypeScript + Prisma + PostgreSQL 16 (pgvector) + BullMQ (Redis)
  mobile/      Flutter 3.x + Riverpod + go_router + dio + freezed + drift + fl_chart
  worker/      Jobs: ingesta de corpus, embeddings, PDFs, alertas 72h, recordatorios
packages/
  contracts/   Esquemas zod + tipos TS compartidos web↔api (fuente de verdad)
  legal-corpus/ Corpus normativo versionado (YAML/JSON + hash SHA-256 por norma)
  ui/          Design system compartido (tokens + componentes base)
```
Infra: Postgres 16 + pgvector, Redis, almacenamiento S3-compatible con object-lock
(MinIO en dev), Anthropic API para MARK AI, Playwright/Chromium para PDF.
Convenciones
Idioma: toda la UI, los textos legales, los enums de dominio y los nombres de
entidades de negocio van en español. El código (funciones, variables técnicas,
commits) en inglés. Los nombres de dominio se mantienen en español cuando son
términos legales: `tratamiento`, `hallazgo`, `encargado`, `titular`, `RAT`, `EIPD`.
Rutas web: `/dashboard`, `/fase-1` … `/fase-7`, `/capacitaciones`,
`/portal-cliente`, `/registro`.
Códigos de regla de negocio: `RN-xxx`. Aparecen en la UI y deben aparecer como
comentario en el código que los implementa (`// RN-201: zona roja → EIPD obligatoria`).
Nada de `any`. `strict: true`. Zod valida todo lo que entra por HTTP.
Sin datos reales: seeds ficticios; prohibido subir dumps de clientes al repo.
Invariantes del dominio (romperlas es un bug grave)
ID    Invariante
INV-1    Toda fila de negocio tiene `tenant_id` y está protegida por RLS en Postgres.
INV-2    El corpus normativo (`normas`, `controles_normativos`) es read-only para todo rol excepto `LEGAL_ADMIN`; cada norma tiene `hash_sha256` y `version`.
INV-3    Las evidencias no se editan ni se borran: `evidencias` es append-only, con `hash_sha256`, `prev_hash` y `retencion_hasta = created_at + 5 años`.
INV-4    La bitácora (`audit_log`) es append-only con cadena de hash; `actor_type ∈ {HUMANO, MARK_AI, SISTEMA}`.
INV-5    MARK AI no puede ejecutar: aprobar documento, cerrar hallazgo, cerrar recomendación, validar tratamiento, firmar. Solo crea `solicitudes_firma` / propuestas.
INV-6    Un hallazgo o recomendación se cierra solo con verificación de eficacia + evidencia con hash registrada por un usuario humano con rol DPO.
INV-7    Un tratamiento marcado `CON_OBSERVACIONES` bloquea el avance de fase de ese tratamiento (RN-401).
INV-8    Riesgo `ALTO` o `CRÍTICO` ⇒ EIPD obligatoria y alerta al DPO (RN-201).
INV-9    Incidente de seguridad ⇒ reloj de 72 h desde `fecha_deteccion` para notificar a la SPDP (Art. 41 LOPDP); el estado del reloj se calcula en servidor, nunca en cliente.
INV-10    Certificado de capacitación solo si `puntaje >= 70`.
Roles y permisos
Rol    Puede
`SUPERADMIN`    Gestión de tenants, planes, usuarios globales.
`LEGAL_ADMIN`    Versionar el corpus normativo y la matriz de controles.
`DPO_HUMANO`    Todo el SGPDP del tenant: validar, aprobar, cerrar, firmar, calificar eficacia.
`DPO_ANALISTA`    Registrar, redactar, cargar evidencias. No cierra ni aprueba.
`CLIENTE_ADMIN`    Portal del cliente: diagnóstico PIMS, sus documentos, sus capacitaciones, chat.
`CLIENTE_COLABORADOR`    Capacitaciones y consulta de sus propios documentos.
`AUDITOR_EXTERNO`    Lectura + bóveda de evidencias del ciclo auditado. Sin escritura.
`MARK_AI`    Identidad de servicio con el subconjunto de herramientas de INV-5.
Paleta y estilo (extraídos del prototipo)
```
--navy-900   #1a2332   sidebar / topbar (fondo institucional)
--navy-950   #0f1e3d   gradiente profundo del topbar
--blue-900   #1e3a8a   azul institucional primario
--blue-800   #1e40af
--blue-600   #2563eb   acción primaria
--blue-500   #3b82f6   acentos, series de gráficos
--blue-300   #93c5fd   sobre fondo oscuro
--blue-50    #eff6ff / #f0f7ff   fondos de tarjeta informativa
--slate-200  #e2e8f0   bordes (el color más usado del sistema)
--slate-400  #94a3b8   texto terciario
--slate-500  #64748b   texto secundario
--slate-600  #475569   etiquetas uppercase
--slate-700  #334155   texto fuerte
--bg         #f5f7fa   fondo de app
--card       #ffffff
--green-600  #059669   estados "Vigente", "Cumple", "Implementado"
--red-500    #ef4444   crítico / no cumple
--amber      atención requerida / pendiente
```
Tipografía: `ui-sans-serif / system-ui` (Tailwind por defecto). Etiquetas de sección en
`uppercase text-xs font-semibold tracking-wide text-slate-600`. Tarjetas con
`rounded-xl border border-slate-200 bg-white`. Sin sombras pesadas: el look es
institucional, denso en información, no "SaaS colorido".
Cómo trabajar en este repo
`pnpm dev` levanta web + api; `pnpm db:reset` recrea y siembra.
Antes de terminar una tarea: `pnpm typecheck && pnpm lint && pnpm test`.
Commits: `feat(web): fase-2 mapa de calor`, `fix(api): reloj 72h en UTC`.
Cuando implementes una pantalla, consulta `docs/02-ESPECIFICACION-FUNCIONAL.md`
y respeta los textos legales literales: son citas normativas, no copy de marketing.
Nunca inventes artículos de la LOPDP. Si un texto normativo no está en
`packages/legal-corpus`, deja `TODO: verificar con LEGAL_ADMIN` y no lo escribas.
