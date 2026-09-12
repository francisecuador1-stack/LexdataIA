# Documentacion de la API — LEXDATA IA

Guia de referencia de la API REST del Sistema de Gestion de Proteccion de Datos Personales.

---

## 1. URLs base por entorno

| Entorno | URL |
|---------|-----|
| Desarrollo local | `http://localhost:3001` |
| Staging | `https://api-staging.lexdata.ec` |
| Produccion | `https://api.lexdata.ec` |

Todas las rutas estan bajo el prefijo `/api/v1`.

---

## 2. Autenticacion

### 2.1 Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "dpo@empresa.ec",
  "password": "contraseña_segura_12+"
}
```

**Respuesta exitosa (200):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "expires_in": 900,
  "requires_mfa": true,
  "mfa_token": "temp_mfa_abc123"
}
```

Si `requires_mfa` es `true`, se debe completar la verificacion MFA antes de obtener el token definitivo.

### 2.2 Verificacion MFA (TOTP)

```http
POST /api/v1/auth/mfa/verify
Content-Type: application/json

{
  "mfa_token": "temp_mfa_abc123",
  "totp_code": "123456"
}
```

**Respuesta (200):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "dpo@empresa.ec",
    "nombre": "Dra. Andreina Almeida",
    "rol": "DPO_HUMANO",
    "tenant_id": "uuid"
  }
}
```

El `refresh_token` se establece automaticamente como cookie `httpOnly`, `Secure`, `SameSite=Strict`.

**MFA obligatorio para:** `DPO_HUMANO`, `LEGAL_ADMIN`, `SUPERADMIN`.

### 2.3 Refresh del token

```http
POST /api/v1/auth/refresh
Cookie: refresh_token=<token>
```

El servidor emite un nuevo `access_token` y rota el `refresh_token` (rotacion unica: el token anterior se invalida).

### 2.4 Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

Revoca el `jti` del access token en Redis y elimina la cookie del refresh token.

---

## 3. Headers comunes

| Header | Valor | Notas |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Obligatorio en todas las rutas protegidas |
| `Content-Type` | `application/json` | Para POST/PATCH/PUT |
| `X-Request-Id` | UUID generado por el cliente | Opcional. Si no se envia, el servidor genera uno. Se propaga en logs |

---

## 4. Formato de errores

Todas las respuestas de error siguen el mismo formato:

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "No tiene permisos para cerrar hallazgos. Se requiere rol DPO_HUMANO.",
  "code": "INV-5",
  "timestamp": "2026-09-12T14:30:00.000Z",
  "path": "/api/v1/fase6/hallazgos/uuid/cerrar",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Campo | Descripcion |
|-------|-------------|
| `statusCode` | Codigo HTTP |
| `error` | Nombre del error HTTP |
| `message` | Descripcion legible del error |
| `code` | Codigo de regla de negocio o invariante violada (si aplica) |
| `timestamp` | Marca temporal ISO 8601 |
| `path` | Ruta solicitada |
| `request_id` | Identificador unico de la solicitud |

### Codigos HTTP utilizados

| Codigo | Uso |
|--------|-----|
| 200 | Operacion exitosa |
| 201 | Recurso creado |
| 400 | Validacion fallida (zod) |
| 401 | Token ausente, expirado o revocado |
| 403 | Rol insuficiente o invariante violada |
| 404 | Recurso no encontrado (dentro del tenant del usuario) |
| 409 | Conflicto (ej. tratamiento ya validado) |
| 422 | Regla de negocio impide la operacion |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor |

---

## 5. Endpoints por modulo

### 5.1 Tenants y usuarios

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `GET` | `/tenants` | Listar tenants | `SUPERADMIN` |
| `POST` | `/tenants` | Crear tenant | `SUPERADMIN` |
| `GET` | `/tenants/:id/usuarios` | Listar usuarios del tenant | `SUPERADMIN`, `DPO_HUMANO` |
| `POST` | `/tenants/:id/invitaciones` | Invitar usuario | `SUPERADMIN`, `DPO_HUMANO` |

### 5.2 Corpus normativo (F1)

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `GET` | `/corpus/normas` | Listar normas (nacional/internacional) | Todos los autenticados |
| `GET` | `/corpus/normas/:id` | Detalle de norma con hash y controles | Todos |
| `POST` | `/corpus/normas` | Crear norma | `LEGAL_ADMIN` |
| `PATCH` | `/corpus/normas/:id` | Actualizar norma (genera nueva version y hash) | `LEGAL_ADMIN` |
| `GET` | `/corpus/controles` | Matriz normativa (RN-004) | Todos |
| `GET` | `/corpus/principios` | 13 principios rectores Art. 10 LOPDP | Todos |

**Ejemplo — Detalle de norma:**

```http
GET /api/v1/corpus/normas/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "fuente": "LOPDP",
  "identificador": "Art. 41",
  "titulo": "Notificacion de brechas de seguridad",
  "categoria": "Seguridad",
  "fase_phva": "HACER",
  "estado": "VIGENTE",
  "hash_sha256": "sha256:a3b2c1d4e5f6...",
  "version": 1,
  "texto_normativo": "...",
  "resumen_ejecutivo": "...",
  "organismo_emisor": "Asamblea Nacional del Ecuador",
  "fecha_emision": "2021-05-26",
  "controles_asociados": [
    {
      "id": "uuid",
      "control": "Protocolo de notificacion 72h a SPDP",
      "evidencia_requerida": "Protocolo documentado y capacitacion",
      "fase_phva": "HACER"
    }
  ]
}
```

### 5.3 Fase 2 — Amenazas y vulnerabilidades

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `GET` | `/fase2/tratamientos` | Listar RAT | `DPO_HUMANO`, `DPO_ANALISTA` |
| `POST` | `/fase2/tratamientos` | Registrar tratamiento | `DPO_HUMANO`, `DPO_ANALISTA` |
| `POST` | `/fase2/tratamientos/:id/validar` | Validar tratamiento (DPO) | `DPO_HUMANO` |
| `POST` | `/fase2/tratamientos/:id/observar` | Marcar con observaciones (bloquea avance, RN-401) | `DPO_HUMANO` |
| `GET` | `/fase2/riesgos` | Matriz de riesgos consolidada | `DPO_HUMANO`, `DPO_ANALISTA` |
| `GET` | `/fase2/riesgos/mapa-calor` | Mapa de calor 5x5 | `DPO_HUMANO`, `DPO_ANALISTA` |
| `GET` | `/fase2/eipd` | Evaluaciones de impacto | `DPO_HUMANO`, `DPO_ANALISTA` |
| `GET` | `/fase2/activos` | Inventario de activos | `DPO_HUMANO`, `DPO_ANALISTA` |

**Ejemplo — Marcar tratamiento con observaciones:**

```http
POST /api/v1/fase2/tratamientos/uuid/observar
Authorization: Bearer <token>
Content-Type: application/json

{
  "motivo": "Aviso de privacidad de la plataforma SaaS no actualizado con decisiones automatizadas."
}
```

```json
{
  "id": "uuid",
  "nombre": "Plataforma SaaS usuarios",
  "estado": "CON_OBSERVACIONES",
  "observacion_dpo": "Aviso de privacidad de la plataforma SaaS no actualizado...",
  "bloqueado": true,
  "updated_at": "2026-09-12T15:00:00.000Z"
}
```

### 5.4 Fase 5 — Supervision

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `GET` | `/fase5/controles` | Controles implementados | `DPO_HUMANO`, `DPO_ANALISTA` |
| `POST` | `/fase5/controles/:id/eficacia` | Evaluar eficacia (3 ejes) | `DPO_HUMANO` |
| `GET` | `/fase5/hallazgos` | Hallazgos operativos | `DPO_HUMANO`, `DPO_ANALISTA` |
| `POST` | `/fase5/hallazgos` | Registrar hallazgo | `DPO_HUMANO`, `DPO_ANALISTA` |

### 5.5 Fase 6 — Auditoria

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `GET` | `/fase6/auditorias` | Listar auditorias | `DPO_HUMANO`, `AUDITOR_EXTERNO` |
| `POST` | `/fase6/auditorias` | Crear auditoria | `DPO_HUMANO` |
| `GET` | `/fase6/hallazgos` | Hallazgos con trazabilidad F1-F6 | `DPO_HUMANO`, `AUDITOR_EXTERNO` |
| `POST` | `/fase6/hallazgos` | Registrar hallazgo (vinculado a norma, RN-601) | `DPO_HUMANO`, `DPO_ANALISTA` |
| `POST` | `/fase6/hallazgos/:id/cerrar` | Cerrar hallazgo (requiere verificacion + evidencia) | `DPO_HUMANO` |
| `GET` | `/fase6/incidentes` | Listar incidentes | `DPO_HUMANO`, `DPO_ANALISTA` |
| `POST` | `/fase6/incidentes` | Registrar incidente (inicia reloj 72h) | `DPO_HUMANO`, `DPO_ANALISTA` |
| `POST` | `/fase6/incidentes/:id/notificar-spdp` | Registrar notificacion a la SPDP | `DPO_HUMANO` |
| `GET` | `/fase6/checklist` | Checklist inteligente por perfil | `DPO_HUMANO` |
| `GET` | `/fase6/indicadores` | KPIs de cumplimiento | `DPO_HUMANO`, `AUDITOR_EXTERNO` |

**Ejemplo — Registrar incidente (inicia reloj 72h):**

```http
POST /api/v1/fase6/incidentes
Authorization: Bearer <token>
Content-Type: application/json

{
  "tipo": "CONFIDENCIALIDAD",
  "descripcion": "Acceso no autorizado a registros de clientes CRM",
  "activo_id": "uuid",
  "tratamiento_id": "uuid",
  "fecha_deteccion": "2026-09-10T08:30:00.000Z"
}
```

```json
{
  "id": "uuid",
  "codigo": "INC-2026-002",
  "tipo": "CONFIDENCIALIDAD",
  "estado": "ACTIVO",
  "fecha_deteccion": "2026-09-10T08:30:00.000Z",
  "fecha_max_reporte_spdp": "2026-09-13T08:30:00.000Z",
  "horas_restantes": 72,
  "notificado_spdp": false,
  "created_at": "2026-09-12T15:00:00.000Z"
}
```

> **INV-9:** El campo `fecha_max_reporte_spdp` se calcula en el servidor (72h desde `fecha_deteccion`), nunca en el cliente. El sistema emite alertas preventivas cuando quedan menos de 24 horas.

### 5.6 Fase 7 — Mejora continua

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `GET` | `/fase7/recomendaciones` | Listar recomendaciones | `DPO_HUMANO`, `DPO_ANALISTA` |
| `POST` | `/fase7/recomendaciones/:id/verificar` | Verificar eficacia con evidencia (RN-702) | `DPO_HUMANO` |
| `GET` | `/fase7/madurez` | Nivel de madurez institucional (RN-701) | `DPO_HUMANO` |
| `GET` | `/fase7/lecciones` | Lecciones aprendidas | `DPO_HUMANO`, `DPO_ANALISTA` |

### 5.7 Evidencias

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `POST` | `/evidencias` | Subir evidencia (hash SHA-256 en servidor) | `DPO_HUMANO`, `DPO_ANALISTA` |
| `GET` | `/evidencias` | Listar evidencias (filtro por control, fase) | `DPO_HUMANO`, `DPO_ANALISTA`, `AUDITOR_EXTERNO` |
| `GET` | `/evidencias/:id/descargar` | URL prefirmada de descarga | `DPO_HUMANO`, `AUDITOR_EXTERNO` |

> **INV-3:** Las evidencias son append-only. No existen endpoints `PATCH` ni `DELETE`. La retencion minima es de 5 anos.

### 5.8 Capacitaciones

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `GET` | `/capacitaciones/cursos` | Catalogo de 8 modulos | Todos |
| `GET` | `/capacitaciones/cursos/:id` | Detalle del modulo con preguntas | Todos |
| `POST` | `/capacitaciones/evaluaciones` | Enviar evaluacion | `CLIENTE_ADMIN`, `CLIENTE_COLABORADOR` |
| `GET` | `/capacitaciones/certificados/:id` | Descargar certificado (solo si puntaje >= 70%) | Todos |

### 5.9 Portal del cliente

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `GET` | `/portal/diagnostico` | Estado del diagnostico PIMS | `CLIENTE_ADMIN` |
| `POST` | `/portal/diagnostico/respuestas` | Enviar respuestas de un modulo | `CLIENTE_ADMIN` |
| `GET` | `/portal/documentos` | Documentos del cliente | `CLIENTE_ADMIN`, `CLIENTE_COLABORADOR` |
| `POST` | `/portal/formulario-spdp` | Enviar formulario SPDP (calcula Pd-VaR) | `CLIENTE_ADMIN` |
| `GET` | `/portal/formulario-spdp/:id/resultado` | Resultado Pd-VaR con cotizacion | `CLIENTE_ADMIN` |

### 5.10 MARK AI (agente)

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `POST` | `/agente/chat` | Enviar mensaje al agente (streaming SSE) | `DPO_HUMANO`, `DPO_ANALISTA` |
| `GET` | `/agente/historial` | Historial de conversacion | `DPO_HUMANO`, `DPO_ANALISTA` |
| `GET` | `/agente/solicitudes-firma` | Cola de solicitudes de firma pendientes | `DPO_HUMANO` |
| `POST` | `/agente/solicitudes-firma/:id/aprobar` | Aprobar solicitud de firma | `DPO_HUMANO` |
| `POST` | `/agente/solicitudes-firma/:id/rechazar` | Rechazar solicitud de firma | `DPO_HUMANO` |

### 5.11 Audit log

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `GET` | `/audit/log` | Consultar bitacora (filtros por actor, fecha, entidad) | `DPO_HUMANO`, `SUPERADMIN` |

> **INV-4:** El audit_log es append-only. No existen endpoints de modificacion ni borrado.

### 5.12 Reportes

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| `POST` | `/reportes/generar` | Solicitar generacion de PDF (cola BullMQ) | `DPO_HUMANO` |
| `GET` | `/reportes/:id/estado` | Estado de generacion | `DPO_HUMANO` |
| `GET` | `/reportes/:id/descargar` | URL prefirmada del PDF | `DPO_HUMANO` |
| `GET` | `/verificar/:codigo` | Verificacion publica de hash de documento | Publico (sin auth) |

---

## 6. Paginacion

Los endpoints de listado soportan paginacion basada en cursor:

```http
GET /api/v1/fase6/hallazgos?limit=20&cursor=eyJpZCI6InV1aWQifQ==
```

**Respuesta:**
```json
{
  "data": [...],
  "meta": {
    "total": 45,
    "limit": 20,
    "next_cursor": "eyJpZCI6InV1aWQyIn0=",
    "has_more": true
  }
}
```

---

## 7. Rate limiting

| Endpoint | Limite | Ventana |
|----------|--------|---------|
| `POST /auth/login` | 5 intentos | 15 minutos |
| `POST /agente/chat` | 30 mensajes | 1 minuto |
| `POST /reportes/generar` | 10 solicitudes | 1 hora |
| Global (autenticado) | 300 requests | 1 minuto |
| Global (no autenticado) | 30 requests | 1 minuto |

Cuando se excede el limite, el servidor responde:

```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit excedido. Intente nuevamente en 45 segundos.",
  "retry_after": 45
}
```

El header `Retry-After` tambien se incluye en la respuesta HTTP.

---

## 8. Filtros comunes

Todos los endpoints de listado soportan filtros por query string:

| Parametro | Descripcion | Ejemplo |
|-----------|-------------|---------|
| `estado` | Filtrar por estado | `?estado=ABIERTO` |
| `tipo` | Filtrar por tipo | `?tipo=NCM` |
| `fase` | Filtrar por fase PHVA | `?fase=VERIFICAR` |
| `desde` | Fecha inicio (ISO 8601) | `?desde=2026-01-01` |
| `hasta` | Fecha fin | `?hasta=2026-12-31` |
| `buscar` | Busqueda de texto libre | `?buscar=consentimiento` |
| `ordenar` | Campo de ordenamiento | `?ordenar=created_at` |
| `direccion` | Direccion de orden | `?direccion=desc` |
