# Arquitectura — LEXDATA IA

Documento de arquitectura tecnica del Sistema de Gestion de Proteccion de Datos Personales (SGPDP) para la LOPDP del Ecuador.

---

## 1. Diagrama de Contexto (C4 — Nivel 1)

```mermaid
C4Context
    title Diagrama de Contexto — LEXDATA IA

    Person(dpo, "DPO Humano", "Oficial de Proteccion de Datos certificado ante la SPDP. Opera el SGPDP, aprueba, firma y cierra.")
    Person(cliente, "Cliente (Responsable del Tratamiento)", "Empresa que debe cumplir la LOPDP. Completa diagnosticos, capacitaciones y consulta documentos.")
    Person(auditor, "Auditor Externo", "Acceso de solo lectura a evidencias y hallazgos del ciclo auditado.")
    Person(titular, "Titular de Datos", "Ciudadano cuyos datos personales se tratan. Ejerce derechos ARCO-PS.")

    System(lexdata, "LEXDATA IA", "Plataforma SGPDP que implementa el ciclo PHVA en 7 fases con asistencia de IA.")

    System_Ext(spdp, "SPDP", "Superintendencia de Proteccion de Datos Personales del Ecuador. Recibe notificaciones de brechas (72h), registros de DPO y reportes.")
    System_Ext(anthropic, "Anthropic API", "Proveedor del modelo de IA (Claude) que alimenta a MARK AI.")
    System_Ext(n8n, "n8n", "Orquestador de notificaciones: alertas 72h, recordatorios, avisos. No ejecuta logica de negocio.")

    Rel(dpo, lexdata, "Opera el SGPDP via web y movil")
    Rel(cliente, lexdata, "Portal del cliente: diagnostico PIMS, capacitaciones, documentos")
    Rel(auditor, lexdata, "Consulta evidencias y hallazgos")
    Rel(lexdata, spdp, "Notificaciones de brechas, reportes regulatorios")
    Rel(lexdata, anthropic, "Consultas del agente MARK AI")
    Rel(lexdata, n8n, "Disparadores de notificaciones")
```

---

## 2. Diagrama de Contenedores (C4 — Nivel 2)

```mermaid
C4Container
    title Diagrama de Contenedores — LEXDATA IA

    Person(user, "Usuario", "DPO, Cliente, Auditor")

    Container(web, "Web App", "React 18 + Vite + TypeScript + Tailwind + shadcn/ui", "SPA con dashboard PHVA, 7 fases, capacitaciones, portal cliente. Deploy: Vercel.")
    Container(mobile, "App Movil", "Flutter 3.x + Riverpod + go_router", "DPO en movilidad: hallazgos, evidencias, incidentes, chat MARK AI. Deploy: App Store / Google Play.")
    Container(api, "API", "NestJS 10 + TypeScript + Prisma", "Backend REST. Modulo por fase. JWT + RLS + TenantGuard. Deploy: contenedor.")
    Container(worker, "Worker", "Node.js + BullMQ", "Jobs asincrinos: ingesta de corpus, embeddings, generacion de PDF, alertas 72h, verify-chain. Deploy: contenedor.")

    ContainerDb(db, "Base de Datos", "Supabase PostgreSQL 17 + pgvector", "30+ entidades con RLS por tenant_id. Migraciones en supabase/migrations/.")
    ContainerDb(redis, "Redis", "Upstash / Redis autoalojado", "Colas BullMQ, cache de sesiones, revocacion de JWT por jti.")
    Container(storage, "Storage", "Supabase Storage (S3)", "Buckets: evidencias (object-lock/WORM), documentos, certificados.")

    System_Ext(anthropic, "Anthropic API", "Modelo Claude para MARK AI")
    System_Ext(n8n, "n8n", "Avisos y notificaciones")

    Rel(user, web, "HTTPS")
    Rel(user, mobile, "HTTPS")
    Rel(web, api, "REST / JSON", "JWT Bearer")
    Rel(mobile, api, "REST / JSON", "JWT Bearer")
    Rel(api, db, "Prisma + SET ROLE lexdata_app", "Transaction mode pooler")
    Rel(api, redis, "BullMQ + cache")
    Rel(api, storage, "URLs prefirmadas")
    Rel(api, anthropic, "MARK AI: chat, RAG, tools")
    Rel(worker, db, "Jobs de procesamiento")
    Rel(worker, redis, "Consume colas BullMQ")
    Rel(worker, storage, "Genera PDFs, procesa evidencias")
    Rel(api, n8n, "Webhooks de alertas")
```

---

## 3. Capas del Backend

```
apps/api/src/
├── common/          Guards (JwtAuth, Roles, Tenant), interceptors, filtros,
│                    PrismaService con SET LOCAL app.tenant_id
├── auth/            Login, refresh, MFA TOTP, recuperacion, sesiones
├── tenants/         Tenants, usuarios, invitaciones
├── clientes/        Empresas responsables + motor de riesgo Pd-VaR
├── corpus/          Normas, controles normativos, principios (RN-004)
├── fase2/           Procesos, RAT, activos, categorias, amenazas, riesgos, EIPD/LIA
├── fase3/           Diagnostico, gobierno, roles, recursos, brechas
├── fase4/           Controles de diseno, medidas, validacion de principios, planes
├── fase5/           Controles implementados, eficacia, hallazgos operativos
├── fase6/           Auditorias, revisiones, checklist, hallazgos, incidentes, KPIs
├── fase7/           Recomendaciones, acciones, lecciones, madurez, oportunidades
├── capacitaciones/  Cursos, evaluaciones, certificados
├── portal/          PIMS + formulario SPDP + motor Pd-VaR
├── evidencias/      Boveda SHA-256, storage S3, cadena de integridad
├── documentos/      Generacion documental, aprobacion, firma
├── reportes/        Reporting Engine (PDF institucionales)
├── agente/          MARK AI: chat, RAG, tools, guardrails, cola de firma
└── audit/           audit_log append-only + verify-chain
```

---

## 4. Modelo de datos por dominio

```mermaid
erDiagram
    %% === IDENTIDAD Y TENANCY ===
    tenants ||--o{ usuarios : "tiene"
    tenants ||--o{ clientes : "gestiona"

    %% === CORPUS NORMATIVO (F1) ===
    normas ||--o{ controles_normativos : "define"
    normas ||--o{ corpus_chunks : "se fragmenta en"
    normas {
        uuid id
        string fuente
        string identificador
        string titulo
        string hash_sha256
        int version
        enum fase_phva
    }
    controles_normativos {
        uuid id
        uuid norma_id
        string control
        string evidencia_requerida
        enum fase_phva
        string hash
    }

    %% === INVENTARIO Y RIESGOS (F2) ===
    tratamientos ||--o{ riesgos : "expone"
    tratamientos ||--o{ eipd : "requiere"
    activos ||--o{ riesgos : "asocia"
    amenazas ||--o{ riesgos : "materializa"
    tratamientos {
        uuid id
        uuid tenant_id
        string nombre
        string finalidad
        enum estado
        string base_legal
    }
    riesgos {
        uuid id
        int impacto
        int probabilidad
        int score
        enum nivel
        enum estado
    }

    %% === DIAGNOSTICO (F3) ===
    diagnostico_respuestas {
        uuid id
        uuid tenant_id
        string dimension
        string pregunta
        enum respuesta
    }

    %% === CONTROLES Y MEDIDAS (F4-F5) ===
    controles ||--o{ evidencias : "requiere"
    controles {
        uuid id
        uuid tenant_id
        enum tipo
        enum estado
        string titulo
        uuid norma_id
    }

    %% === AUDITORIA (F6) ===
    auditorias ||--o{ hallazgos : "produce"
    hallazgos ||--o{ evidencias : "se evidencia con"
    incidentes {
        uuid id
        uuid tenant_id
        timestamp fecha_deteccion
        timestamp fecha_max_reporte
        enum estado
    }

    %% === MEJORA CONTINUA (F7) ===
    recomendaciones ||--o{ acciones_correctivas : "genera"
    recomendaciones {
        uuid id
        uuid hallazgo_id
        enum estado
        uuid verificado_por
    }

    %% === TRANSVERSALES ===
    evidencias {
        uuid id
        uuid tenant_id
        string hash_sha256
        string prev_hash
        timestamp retencion_hasta
    }
    audit_log {
        uuid id
        uuid tenant_id
        enum actor_type
        string hash
        string prev_hash
    }
```

### Entidades por fase

| Fase | Entidades principales |
|------|----------------------|
| F1 — Normas | `normas`, `controles_normativos`, `principios`, `corpus_chunks` |
| F2 — Amenazas | `procesos`, `tratamientos`, `activos`, `categorias_datos`, `amenazas`, `vulnerabilidades`, `riesgos`, `eipd` |
| F3 — Implementacion | `diagnostico_respuestas`, `gobierno_elementos`, `roles_sgpdp`, `recursos`, `brechas` |
| F4 — Definicion | `controles_diseno`, `medidas_tecnicas`, `medidas_organizativas`, `medidas_juridicas`, `planes_accion`, `hallazgos_diseno` |
| F5 — Supervision | `controles_implementados`, `evaluaciones_eficacia`, `hallazgos_operativos` |
| F6 — Auditoria | `auditorias`, `revisiones`, `checklist_respuestas`, `hallazgos`, `incidentes`, `indicadores` |
| F7 — Mejora | `recomendaciones`, `acciones_correctivas`, `lecciones`, `oportunidades`, `madurez` |
| Transversales | `tenants`, `usuarios`, `clientes`, `evidencias`, `documentos`, `audit_log`, `capacitaciones`, `evaluaciones`, `certificados` |

---

## 5. Flujo de trazabilidad F1 a F7

```mermaid
flowchart LR
    subgraph F1["F1 — Normas"]
        N[Norma LOPDP<br>con hash SHA-256]
        CN[Control normativo<br>RN-004]
    end

    subgraph F2["F2 — Amenazas"]
        T[Tratamiento en RAT]
        R[Riesgo evaluado<br>Impacto x Probabilidad]
        E[EIPD obligatoria<br>si RN-201]
    end

    subgraph F3["F3 — Implementacion"]
        D[Diagnostico<br>organizacional]
        B[Brecha detectada<br>Gap Analysis]
    end

    subgraph F4["F4 — Definicion"]
        CD[Control de diseno]
        V[Validacion DPO<br>RN-401]
    end

    subgraph F5["F5 — Supervision"]
        CI[Control implementado]
        EF[Evaluacion de<br>eficacia 3 ejes]
    end

    subgraph F6["F6 — Auditoria"]
        H[Hallazgo vinculado<br>a norma RN-601]
        EV[Evidencia con<br>hash SHA-256]
    end

    subgraph F7["F7 — Mejora"]
        REC[Recomendacion]
        VER[Verificacion de<br>eficacia + hash]
        M[Nivel de madurez<br>algoritmo PHVA]
    end

    N --> CN
    CN --> T
    T --> R
    R -->|Alto/Critico| E
    R --> CD
    D --> B
    B --> CD
    CD --> V
    V --> CI
    CI --> EF
    EF --> H
    H --> EV
    H --> REC
    REC --> VER
    VER --> M
    M -->|Nuevo ciclo| N
```

**Principio fundamental:** cada hallazgo tiene "partida de nacimiento" en la norma (F1) y evidencia inalterable con hash (F6). La trazabilidad es completa, auditable y defendible ante la SPDP.

---

## 6. Arquitectura de seguridad

### 6.1 Autenticacion y autorizacion

```mermaid
sequenceDiagram
    participant C as Cliente (Web/Movil)
    participant A as API (NestJS)
    participant DB as PostgreSQL
    participant R as Redis

    C->>A: POST /auth/login {email, password}
    A->>DB: Buscar usuario, verificar argon2id
    A->>A: Verificar MFA/TOTP (obligatorio para DPO, LEGAL_ADMIN, SUPERADMIN)
    A->>R: Registrar jti del token
    A-->>C: {access_token (15min)} + Set-Cookie: refresh_token (httpOnly, Secure, SameSite=Strict)

    Note over C,A: Cada request subsiguiente

    C->>A: GET /api/recurso (Authorization: Bearer <token>)
    A->>A: JwtAuthGuard: verificar firma y expiracion
    A->>R: Verificar que jti no esta revocado
    A->>A: RolesGuard: verificar rol del usuario
    A->>A: TenantGuard: extraer tenant_id del JWT
    A->>DB: SET LOCAL app.tenant_id = '<uuid>'
    A->>DB: SET ROLE lexdata_app
    Note over A,DB: RLS en PostgreSQL filtra por tenant_id automaticamente
    DB-->>A: Datos del tenant solicitado
    A-->>C: Respuesta JSON
```

### 6.2 Row-Level Security (RLS)

```
Principio: Todo acceso a datos de negocio pasa por el rol lexdata_app
con NOBYPASSRLS. El tenant_id se inyecta via SET LOCAL.

                    ┌─────────────────────────┐
                    │      API (NestJS)        │
                    │                          │
                    │  TenantGuard extrae      │
                    │  tenant_id del JWT       │
                    │         │                │
                    │  PrismaService ejecuta:  │
                    │  SET LOCAL app.tenant_id │
                    │  SET ROLE lexdata_app    │
                    └────────┬────────────────┘
                             │
                    ┌────────▼────────────────┐
                    │    PostgreSQL + RLS      │
                    │                          │
                    │  Politica por tabla:     │
                    │  WHERE tenant_id =       │
                    │  current_setting(        │
                    │    'app.tenant_id')      │
                    │                          │
                    │  Roles:                  │
                    │  - anon: sin acceso      │
                    │  - authenticated: sin    │
                    │    acceso a tablas de    │
                    │    negocio               │
                    │  - lexdata_app: acceso   │
                    │    filtrado por RLS      │
                    │  - postgres: solo en     │
                    │    SystemDbService       │
                    └─────────────────────────┘
```

### 6.3 Cadena de integridad

```mermaid
flowchart TD
    subgraph Evidencias
        E1["Evidencia 1<br>hash: sha256:abc...<br>prev_hash: null"]
        E2["Evidencia 2<br>hash: sha256:def...<br>prev_hash: sha256:abc..."]
        E3["Evidencia 3<br>hash: sha256:ghi...<br>prev_hash: sha256:def..."]
        E1 --> E2 --> E3
    end

    subgraph AuditLog
        A1["Log 1<br>actor: HUMANO<br>hash: sha256:111..."]
        A2["Log 2<br>actor: MARK_AI<br>hash: sha256:222...<br>prev_hash: sha256:111..."]
        A3["Log 3<br>actor: SISTEMA<br>hash: sha256:333...<br>prev_hash: sha256:222..."]
        A1 --> A2 --> A3
    end

    VC["Job verify-chain (diario)<br>Valida integridad de toda la cadena"]
    VC -.->|"Verifica"| Evidencias
    VC -.->|"Verifica"| AuditLog
```

### 6.4 Resumen de decisiones de seguridad

| Aspecto | Decision |
|---------|----------|
| Contrasenas | `argon2id`, minimo 12 caracteres |
| MFA | TOTP obligatorio para `DPO_HUMANO`, `LEGAL_ADMIN`, `SUPERADMIN` |
| JWT | Access token 15 min, refresh rotativo en cookie `httpOnly+Secure+SameSite=Strict` |
| Revocacion | Por `jti` en Redis |
| Cifrado en transito | TLS 1.3 |
| Cifrado en reposo | Disco/volumenes cifrados; columnas PII con `pgcrypto` |
| Storage | Object-lock/WORM, versionado, URLs prefirmadas de corta vida |
| Rate limiting | Global + especifico en login, chat del agente, generacion de PDF |
| Cabeceras | Helmet, CSP estricta, sin `unsafe-inline` |
| Logs | Sin datos personales. Redaccion de PII en el logger |
| Retencion | `retencion_hasta` en evidencias (5 anos) |
| Secretos | Solo por variables de entorno. Prohibido `.env` en git |

---

## 7. Entornos y despliegue

| Entorno | Web | API + Worker | Base de datos | Notas |
|---------|-----|-------------|---------------|-------|
| `local` | `localhost:5173` | `localhost:3001` | docker-compose (postgres+pgvector, redis, minio, mailhog) | `pnpm dev` |
| `staging` | Vercel preview | Contenedor staging | Supabase branch | Datos ficticios, identico a produccion |
| `produccion` | Vercel | Contenedores (Railway/Fly/VPS) | Supabase gestionado (backups PITR) | Storage con object-lock, CDN |

### Pipeline de CI/CD

```mermaid
flowchart LR
    A[Push / PR] --> B[typecheck]
    B --> C[lint]
    C --> D[test unit]
    D --> E[test e2e<br>Playwright]
    E --> F[build]
    F --> G[migraciones]
    G --> H[deploy]

    I[Flutter] --> J[flutter analyze]
    J --> K[flutter test]
    K --> L[build artefactos]
```

---

## 8. Observabilidad

- **Logs:** Pino (estructurados) con `request_id` y `tenant_id`. Sin PII.
- **Metricas:** Prometheus (latencia, tamano de colas, tokens del agente, PDFs generados).
- **Errores:** Sentry en web, API y Flutter.
- **Alertas operativas:**
  - Incidente a menos de 24 h de su plazo de 72 h.
  - Ruptura de cadena de hash.
  - Fallo de ingesta del corpus.
  - Cola de firmas pendiente > 48 h.

---

## 9. Reporting Engine

El motor de reportes genera PDFs institucionales con validez para presentar ante la SPDP.

- **Motor:** React + `@react-pdf/renderer` (simples) + Playwright/Chromium HTML-to-PDF (complejos con graficos).
- **Ejecucion:** En el `worker`, no en el proceso HTTP.
- **Plantillas:** Estado General SGPDP, Informe de Auditoria, Hallazgos e Incidentes, Dashboard de Indicadores, Reporte PHVA y Riesgos, Informe de Implementacion (F3), Reporte Ejecutivo de Riesgos (F2), Reporte de Alineacion (F4), informes de capacitaciones (3), certificados individuales.
- **Todos los PDF incluyen:** encabezado institucional, empresa, periodo, DPO responsable, hash SHA-256 y codigo de verificacion.
