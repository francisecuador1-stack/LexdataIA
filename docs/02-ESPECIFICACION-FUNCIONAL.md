# 02 · Especificación funcional — LEXDATA IA

Inventario exhaustivo del prototipo. Cada sección es la fuente de verdad para los
prompts. Los textos entre comillas son literales del prototipo y deben conservarse
(son citas normativas o advertencias de gobernanza, no copy).

## Arquitectura de componentes del prototipo

(extraída del bundle, se mantiene en la web app):

```
App.tsx
├─ Sidebar.tsx
├─ AgentChat.tsx          (MARK AI · drawer derecho)
├─ Dashboard.tsx          (Dashboard PHVA)
├─ Phase1Normas.tsx  … Phase7Mejora.tsx
├─ Capacitaciones.tsx
├─ ClientPortal.tsx       (Diagnóstico PIMS, 11 módulos)
├─ ClientDataForm.tsx     (Formulario SPDP, 8 pasos, motor Pd-VaR)
└─ context/AppContext.tsx (estado compartido por tenant)
```

---

## 1. Shell de la aplicación

### 1.1 Topbar (fondo `--navy-950` con gradiente)

| Zona | Contenido |
|------|-----------|
| Izquierda | Logo circular + `LEXDATA IA` + subtítulo `Sistema SGPDP · LOPDP Ecuador` |
| Centro-izq | Chip MARK AI con badge verde `ACTIVO` y texto `Toca para chatear · Agente DPO Operativo`. Abre el drawer del agente. |
| Centro | Ticker de actividad del agente: `FASE n · <actividad en curso>`, rotando cada ~6 s. Ejemplos literales: `Procesando hallazgos de auditoría para ciclo PHVA de mejora continua`, `Analizando bases legales de tratamientos en el RAT actualizado`, `Revisando cláusulas DPA con encargados de tratamiento externos`, `Monitoreando registro de incidentes · Protocolo 72h SPDP activo`, `Verificando plazos ARCO-PS · 15 días hábiles (Acceso, Rectificación, Eliminación)`, `Revisando EIPD — verificando criterios de alto riesgo LOPDP Art. 39`. |
| Derecha | Rol DPO Humano + `Control y Supervisión Estratégica`; campana de notificaciones con badge numérico; menú de usuario. |

### 1.2 Sidebar colapsable (fondo `--navy-900`, ancho ~248 px)

Cabecera: logo + título; botón de colapso (chevron) en el borde.

Bloque EMPRESA ACTIVA: `<select>` con las 5 empresas del seed. Cambiar de empresa
recalcula todo el estado de la app (es el selector de tenant/cliente activo).

Secciones y items (con subtítulo cada uno):

| Sección | Item | Subtítulo |
|---------|------|-----------|
| ANÁLISIS | Dashboard PHVA | Visión general del sistema |
| PLANIFICAR | Fase 1 · Normas | Biblioteca jurídica |
| PLANIFICAR | Fase 2 · Amenazas y Vulnerabilidades | Inventario, riesgos y mapa de calor |
| PLANIFICAR | Fase 3 · Implementación | Diagnóstico organizacional |
| PLANIFICAR | Fase 4 · Definición | Marco estratégico |
| HACER | Fase 5 · Supervisión | Controles y hallazgos |
| VERIFICAR | Fase 6 · Auditoría | KPIs y bitácora |
| ACTUAR | Fase 7 · Mejora Continua | Recomendaciones y madurez |
| CAPACITACIONES | Capacitaciones | E-Learning · Central · Informes |
| CLIENTE | Portal del Cliente | Vista del cliente |
| CLIENTE | Formulario SPDP | Registro de empresa |

Pie fijo: avatar `DA` + `Dra. Andreina Almeida` + `DPO Certificada · SPDP`.

Nota de implementación: los encabezados de sección corresponden a las letras del ciclo
PHVA y se usan también como badge `P/H/V/A` en las pestañas del dashboard.

### 1.3 Cabecera de módulo (patrón repetido en las 9 pantallas)

Fila de badges: `<CICLO> · FASE n` (píldora azul) + badges de alerta contextual
(`RN-004`, `2 EIPD obligatorias`, `1 tratamiento bloqueado`, `1 hallazgo abierto`,
`2 controles sin evidencia`, `1 incidente activo`, `Madurez 2.7/5 — Definido`).

`<h1>` del módulo.

Línea de subtítulo con el "mapa" de pestañas separado por `·`.

Barra de pestañas horizontal con scroll, cada una con icono y contador opcional.

Botón flotante inferior derecho `Observaciones DPO` en las fases 2, 4 y 5
(abre panel de notas del DPO por entidad).

### 1.4 MARK AI — drawer derecho (`AgentChat.tsx`)

Cabecera: avatar, `MARK AI`, badge `EN LÍNEA`, subtítulo `Agente DPO Operativo · LEXDATA IA`, botón cerrar.

Saludo literal: "Hola, soy MARK AI — Agente DPO Operativo de LEXDATA. Estoy ejecutando revisiones normativas en tiempo real sobre todas las fases del sistema. El DPO humano supervisa estratégicamente; yo me encargo de toda la operativa: análisis, observaciones, documentación y coordinación con los agentes de los clientes. ¿En qué puedo ayudarte?"

Toast de alerta dentro del panel: `MARK AI · Firma DPO requerida` + detalle
(`DPA con proveedor cloud pendiente de firma. El encargado…`).

Chips de Preguntas rápidas: `¿Hay brechas críticas?`, `Estado del RAT`,
`Documentos pendientes`, `Estado ARCO-PS`, `DPAs sin firmar`, `¿Próxima auditoría?`.

Input `Escribe a MARK AI…` + botón enviar. Mensajes con hora.

Respuesta de referencia (`Estado del RAT`), con el patrón exigido —cifras del tenant + recomendación + pregunta de cierre—:
"El RAT tiene 23 actividades de tratamiento documentadas. Estado actual: 18 actividades con base legal documentada · 5 actividades pendientes de clasificar base legal · 3 requieren actualización de plazos de conservación. Recomiendo priorizar las 5 actividades sin base legal documentada. ¿Inicio la revisión?"

---

## 2. Dashboard PHVA (`/dashboard`)

Cabecera: `Dashboard de Cumplimiento PHVA` · `Sistema SGPDP · LOPDP Ecuador · Actualización jul 2026`, chip de estado global (`Atención requerida`) y tarjeta de la empresa activa (razón social + sector + ciudad).

Pestañas: `Visión General`, `F1 · Normas`, `F2 · Riesgos`, `F3 · Implementación`, `F4 · Definición`, `F5 · Supervisión`, `F6 · Auditoría`, `F7 · Mejora` (cada una con badge P/H/V/A).

### 2.1 Visión General

5 KPI cards: `ESTADO SGPDP` (Atención requerida / Definido · 2.7/5), `MADUREZ GLOBAL` (2.7 / 5.0 · Definido), `CUMPLIMIENTO DOC.` (62% documentos aprobados), `HALLAZGOS ABIERTOS` (3 · 0 críticos), `RIESGOS CRÍTICOS` (1 · 5 total).

Radar `MADUREZ POR FASE PHVA` con ejes F1…F7, escala 0–5.

Progreso por módulo: barra por fase con valor 1–5 y etiqueta de nivel
(`Inicial`, `Repetible`, `Gestionado`, `Definido`, `Controlado`, `Optimizado`).

3 tarjetas de contadores: `CONTROLES IMPLEMENTADOS 3/6` (F5), `AUDITORÍAS COMPLETADAS 1` (cumplimiento promedio 68%), `RECOMENDACIONES CERRADAS 0/3` (F7).

ACTIVIDAD RECIENTE — BITÁCORA DEL SISTEMA: timeline con tipo de evento, detalle y fecha (`Auditoría completada`, `Eficacia calificada`, `Hallazgo registrado`, `Control declarado`, `Evidencia cargada`).

### 2.2 Pestaña F1 · Normas

KPIs `NORMAS NACIONALES 28`, `NORMAS INTERNACIONALES 8`, `ARTÍCULOS MAPEADOS 36`, `CONTROLES NORMATIVOS 18`. Barras `DISTRIBUCIÓN POR FUENTE NORMATIVA` (LOPDP, Constitución, RGLOPDP, Resoluciones SPDP, ISO 27001, ISO 27701, ISO 42001, NIST, Resoluciones SGPDP). `COBERTURA POR CICLO PHVA`: Planificar 22 arts. (61%), Hacer 11 (31%), Verificar 3 (8%), Actuar 0 (0%). Lista `RESOLUCIONES VIGENTES SPDP` (2025-0028-R obligaciones del DPO, feb 2025; 2024-0015-R metodología EIPD-EC, jul 2024; 2023-0004-R criterios de notificación de brechas, mar 2023).

### 2.3 Pestaña F6 · Auditoría (patrón de las pestañas de fase)

KPIs (`NIVEL DE MADUREZ 2.7/5`, `CUMPLIMIENTO GRAL. 62%`, `AUDITORÍAS COMPLET. 1/1`, `HALLAZGOS ABIERTOS 3`), Radar PHVA por ciclo (Planificar/Hacer/Verificar/Actuar), KPIS DE CUMPLIMIENTO como barras valor/meta (Cumplimiento Documental 62/100; Controles Implementados 3/6; Hallazgos Abiertos 2/0; Riesgos Mitigados 1/5; Madurez Global 2.8/4; Principios Verificados 3/7) y TENDENCIAS — EVOLUCIÓN MENSUAL FEB–JUL 2026 (línea 0–80).

> Regla: las 7 pestañas de fase repiten la estructura *KPIs → gráfico principal → detalle*. Los datos se derivan siempre del estado del tenant, nunca se escriben a mano.

---

## 3. Fase 1 · Motor de Conocimiento Normativo (`RN-004`)

Cabecera: `PLANIFICAR · FASE 1` + badge `RN-004`; título `Motor de Conocimiento Normativo`; subtítulo `Biblioteca jurídica dual · 36 normas · Nacional (Constitución, LOPDP, RGLOPDP, SPDP, SGPDP) + Internacional (ISO 27001, ISO 27701, ISO 42001, NIST)`.

Pestañas: `Biblioteca Jurídica` (badge `28N · 8I`), `Matriz Normativa` (badge `API · RN-004`), `Principios Rectores` (badge `13`).

### 3.1 Biblioteca Jurídica

Sub-toggle `Nacional` / `Internacional`, con leyenda de fuentes.

Buscador `Búsqueda semántica…`, contador `28 / 28 normas · 0 favoritas`, botón `Historial (n)`, favoritos por norma, contador de vistas.

Lista de tarjetas: badge de fuente (LOPDP / RGLOPDP / SPDP / SGPDP / CRE / ISO / NIST), identificador (`Art. 7`, `Res. 2025-0028-R`, `ISO 27001:2022 §6.1`), estado `Vigente`, título y categoría.

Panel derecho vacío: `Seleccione una norma` + `Explore la normativa ecuatoriana: Constitución, LOPDP, Reglamento, Resoluciones SPDP y SGPDP.` + mini-KPIs (normas, favoritas, acciones).

**Catálogo nacional (28)** — LOPDP: Art. 7 Consentimiento del titular (Bases de Legitimación) · Art. 9 Obligación legal o reglamentaria · Art. 10 Principios aplicables al tratamiento (Principios Rectores) · Art. 13 Deber de información (Derechos del Titular) · Art. 17 Protección reforzada — Menores de edad (Categorías Especiales) · Art. 29 Derecho frente a decisiones automatizadas · Art. 37 Registro de actividades de tratamiento (Obligaciones del Responsable) · Art. 38 Relación responsable-encargado (Encargados) · Art. 39 EIPD · Art. 41 Notificación de brechas de seguridad (Seguridad) · Art. 42 Funciones del DPO · Art. 54 Transferencias internacionales. RGLOPDP: Art. 6 Desarrollo del principio de juridicidad · Art. 15 Designación obligatoria del DPO. SPDP: Res. 2025-0028-R Obligaciones del DPO ante la SPDP · Res. 2024-0015-R Metodología oficial de EIPD. SGPDP: Res. 0005-2026-SGPDP Categorización ampliada — datos biométricos y comportamiento digital. CRE: Art. 11 · Art. 16 · Art. 18 · Art. 23 · Art. 44 · Art. 66.19 · Art. 66.20 · Art. 66.21 · Art. 75 · Art. 92 (Hábeas Data) · Art. 229.

**Catálogo internacional (8)** — ISO 27001:2022 §6.1 y §8.2; ISO 27701:2019 §5.2 y §6.1; ISO 42001:2023 §6.1 y §8.4; NIST PR.DS-1 (Data-at-Rest) y PR.DS-2 (Data-in-Transit).

**Panel de detalle de norma** (al seleccionar): badges (fuente, artículo, fase PHVA, `Vigente`, `Nacional`/`Internacional`), título, categoría, Resumen ejecutivo, Texto normativo, Metadatos del documento (`ORGANISMO EMISOR`, `FECHA DE EMISIÓN`, `VERSIÓN`, `TIPO DE NORMA`), bloque Hash criptográfico — Integridad normativa con `sha256:…` y la leyenda "Este hash garantiza que el contenido normativo es inalterable. Cualquier modificación invalidaría el hash (RN-004).", Módulos relacionados (RN-004) (p. ej. `Fase 2 · Inventario`, `Fase 4 · Validación de Principios`, `Fase 5 · Controles`) con la leyenda "Esta norma alimenta automáticamente los módulos indicados como fuente de conocimiento.", y Controles normativos asociados (fase PHVA, título, descripción, `Evidencia requerida`).

### 3.2 Matriz Normativa (API interna)

Banner literal: "RN-004 · Matriz Normativa — API Interna del Sistema. Esta matriz es la fuente de conocimiento única del SGPDP. Cuando el DPO trabaje en la Fase 6 (Auditoría), el sistema consultará automáticamente esta matriz para sugerir el artículo de la ley aplicable a cada hallazgo. Los controles aquí definidos son inmutables por el operador."

Buscador + filtros `Todas / Planificar / Hacer / Verificar / Actuar`. Tabla de 18 controles: `Fuente | Control normativo | Evidencia requerida | Fase PHVA | Hash`. Pie: `18 de 18 controles · Matriz es de solo lectura para operadores` + sello `API Interna · RN-004`.

Contenido de la matriz (fuente → control → evidencia → fase):

| Fuente | Control normativo | Evidencia requerida | Fase |
|--------|-------------------|---------------------|------|
| LOPDP 7 | Formulario de consentimiento informado | Registro de consentimientos firmados o electrónicos | Planificar |
| LOPDP 7 | Mecanismo de revocación de consentimiento | Pantalla o formulario de revocación activo | Planificar |
| LOPDP 9 | Inventario de obligaciones legales aplicables | Documento con base legal y norma habilitante | Planificar |
| LOPDP 10 | Auditoría de principios por tratamiento (13 principios) | Acta de auditoría con checklist | Verificar |
| LOPDP 10 | Política de protección de datos publicada | URL pública o acuse de recibo interno | Planificar |
| LOPDP 13 | Aviso de privacidad y política publicados | Aviso vigente en web o documento entregado | Hacer |
| LOPDP 39 | Evaluación de impacto documentada | Informe EIPD con firma del DPO | Planificar |
| LOPDP 39 | Registro de tratamientos con EIPD obligatoria | Lista actualizada en RAT | Planificar |
| LOPDP 41 | Protocolo de notificación 72h a SPDP | Protocolo documentado y capacitación | Hacer |
| LOPDP 41 | Plan de respuesta a incidentes | Plan aprobado y simulacro anual | Hacer |
| LOPDP 29 | Mecanismo de revisión humana de decisiones automatizadas | Canal habilitado + tiempo de respuesta | Hacer |
| LOPDP 38 | Contrato de encargado formalizado | Contrato firmado con cláusulas LOPDP | Hacer |
| LOPDP 54 | Garantías de transferencia internacional | SCCs o nivel de adecuación | Planificar |
| LOPDP 37 | RAT actualizado | RAT vigente con fecha de última revisión | Hacer |
| LOPDP 42 | DPO designado y notificado a la SPDP | Comunicación a la SPDP + nombramiento | Planificar |
| NIST PR.DS-1 | Cifrado de datos en reposo (AES-256) | Configuración verificada por auditoría técnica | Hacer |
| ISO 27701 §5.2 | Política de privacidad aprobada por dirección | Acta firmada por Gerente General | Planificar |
| ISO 27701 §6.1 | Análisis de riesgos de privacidad anual | Informe con fecha y firma del DPO | Planificar |

### 3.3 Principios Rectores (13)

`13 Principios Rectores` · `Art. 10 LOPDP + RGLOPDP — Obligatorios para todo tratamiento`.

Lista con nombre, base normativa y estado `Verificado | Pendiente | No Verificado`:

| Principio | Base | Estado seed |
|-----------|------|-------------|
| Juridicidad | Art. 10 LOPDP | Verificado |
| Transparencia | Art. 10, 13 LOPDP | Verificado |
| Finalidad | Art. 10 LOPDP | Pendiente |
| Minimización | Art. 10 LOPDP | No Verificado |
| Confidencialidad | Art. 10 LOPDP | Verificado |
| Seguridad | Art. 10, 30 LOPDP | Pendiente |
| Proporcionalidad | Art. 10 LOPDP | No Verificado |
| Lealtad | Art. 10 LOPDP | Pendiente |
| Exactitud y Calidad | Art. 10 LOPDP / Art. 9 RGLOPDP | Pendiente |
| Limitación del Almacenamiento | Art. 10 LOPDP / Art. 11 RGLOPDP | No Verificado |
| Responsabilidad Proactiva | Art. 10 LOPDP / Art. 12 RGLOPDP | Pendiente |
| No Discriminación | Art. 66 CRE / Art. 10 RGLOPDP | No Verificado |
| Libre Circulación Controlada | Art. 54 LOPDP / Art. 13 RGLOPDP | No Verificado |

Detalle de principio: base, nombre, estado, definición, línea `Verificado el <fecha> · Hash: sha256:…` y Preguntas de auditoría (n) numeradas. Ej. Juridicidad: 1) ¿Cada actividad de tratamiento tiene asignada una base legal documentada? 2) ¿Se verifica la vigencia de la base legal de forma periódica? 3) ¿Se dispone de evidencia de la base legal para cada tratamiento?

---

## 4. Fase 2 · Amenazas y Vulnerabilidades — Consola DPO

Cabecera: `HACER · FASE 2 · AMENAZAS Y VULNERABILIDADES` + badge `2 EIPD obligatorias`; subtítulo `Procesos · RAT · Activos · Categorías · Riesgos · EIPD/LIA · Matriz · Mapa de Calor · Brechas · Reportes`.

10 pestañas:

### 4.1 Procesos y Cadena de Valor

`Cadena de Valor LOPDP` · `Haga clic en un nodo para ver detalles`. Nodos con estado
(`Implementado` / `En Progreso` / `Pendiente`): Planificación LOPDP (Implementado),
Diagnóstico y contexto (Implementado), Análisis de riesgos (En Progreso), Tratamiento y
Seguridad (En Progreso), Derechos y Atención (En Progreso). Leyenda de los 3 estados.

Panel: "Haga clic en cualquier macroproceso, proceso o subproceso para ver políticas, reglamentos y controles asociados."

### 4.2 RAT Supervisado (vistas `RAT Supervisado` / `Por Área`)

`Registro de Actividades de Tratamiento` · `3 actividades · DPO valida cada entrada`.

Lista de tratamientos con nombre, finalidad y estado (`Pendiente` / `Validado` / `Con Observaciones`). Contadores `0 ✓ Validados`, `0 ⚠ Obs.`.

Banner: "RN-201 / RN-401: El DPO puede marcar un tratamiento como 'Con Observaciones' bloqueando su avance si no tiene base legal lícita. Tratamientos Crítico/Alto activan alerta EIPD obligatoria."

Detalle: `CÓDIGO RAT`, `BASE DE LEGITIMACIÓN`, `RETENCIÓN`, `DATOS SENSIBLES`, `CATEGORÍAS` + bloque Resolución del DPO con botones `Validado` / `Con Observaciones`.

### 4.3 Activos

Tarjetas por activo: nombre, tipo (`Servicio en nube`, `Base de datos`, `Aplicación web`), criticidad (`Alta`/`Media`), `Responsable`, `Ubicación`, `Sistemas`, flag `Datos personales`. Seed: CRM Salesforce (Carlos Mendoza Vega, EE.UU. AWS us-east-1, Salesforce + API REST, Alta) · Base de datos de clientes PostgreSQL (Dept. Tecnología, AWS us-east-1, PostgreSQL 14 + AWS RDS, Alta) · Plataforma SaaS propia (Dept. Desarrollo, AWS us-east-1, React/Node.js/EC2, Alta) · Sistema de Nómina Bancolombia (RRHH, Colombia, Alta→Media).

### 4.4 Categorías de Datos

Dos banners normativos literales:

"Resolución 0005-2026 SGPDP — La Superintendencia de Protección de Datos Personales categorizó en 2026 los datos de comportamiento digital y biométricos como categorías de protección reforzada, ampliando el Art. 25 del Reglamento de la LOPDP."

"Art. 25 LOPDP — Clasificación de categorías: El sistema detecta automáticamente si el cliente trata datos sensibles o de menores y eleva el nivel de impacto en el análisis de riesgos."

7 categorías con base normativa, nivel y flag `ACTIVO` cuando el tenant las trata:

Generales de Identificación (Art. 4 LOPDP · Estándar) · Contacto y Localización (Art. 25 RGLOPDP · Estándar) · Financieros y Crediticios (Art. 25 RGLOPDP · Reforzado) · Comportamiento Digital (Res. 0005-2026 SGPDP · Reforzado) · Sensibles (Art. 25 LOPDP · Máximo) · Biométricos y Genéticos (Art. 25 LOPDP / Res. 0005-2026 · Máximo) · NNA (Art. 17 LOPDP · `Máximo + Representante`).

### 4.5 Riesgos

Gauge `Indicador de Riesgo Proyectado` = `63%` · `Probabilidad de materialización` · etiqueta `RIESGO MEDIO`.

`PROBABILIDAD POR RIESGO IDENTIFICADO`: barras por riesgo con nivel y % (Crítico 85%, Alto 65%, Medio 35%).

`Evaluación DPO — Riesgo Residual Declarado`: `5` riesgos identificados, `4` riesgo residual no mitigado, `3.8` impacto promedio + nota "El DPO debe evaluar si el riesgo residual declarado es realista frente a los controles existentes. Hay 4 riesgos Alto/Crítico sin mitigar."

Toggle `Perfil de Amenazas` / `Vulnerabilidades Identificadas`. Catálogo de amenazas por familia con probabilidad `P: n/5` y lista de vulnerabilidades:

- **Cibercrimen** — Acceso no autorizado externo (P 4/5): SQL Injection, Phishing dirigido, Ransomware, Brute force. Exfiltración de datos (P 3/5): Insider threat malicioso, API sin autenticación, Credenciales comprometidas.
- **Error interno** — Error humano en manejo de datos (P 4/5): email al destinatario incorrecto, publicación accidental, eliminación incorrecta. Configuración incorrecta de sistemas (P 3/5): bucket S3 público, base de datos sin contraseña, logs con datos sensibles.
- **Legal/Regulatorio** — Incumplimiento normativo (P 3/5): tratamiento sin consentimiento, falta de aviso de privacidad, transferencia internacional sin garantías.
- **Proveedor** — Brecha en proveedor o encargado (P 3/5): hack a proveedor cloud, incidente en SaaS tercero, fuga en empresa de nómina.

### 4.6 Evaluaciones (EIPD / LIA)

Sub-pestañas `EIPD — Evaluación de Impacto` (badge 3, salida PDF), `LIA — Test de Ponderación` (salida Excel), `RAT Supervisado`.

`Matriz EIPD — Decisión automática por criterios LOPDP Art. 39`: "El sistema determina si la EIPD es obligatoria basándose en el perfil del cliente y cada tratamiento (puntaje MTGE)."

Tabla: `Tratamiento | Gran escala | Sensibles | Dec. auto. | Perfilamiento | Menores | Decisión EIPD | Estado` con valor `Obligatorio` + `Pendiente`.

### 4.7 Matriz Consolidada (`RN-201`)

`Matriz de Riesgos Consolidada` · `5 riesgos · Haga clic en una fila para abrir el expediente digital`.

Columnas: `Tratamiento | Activo | Amenaza | Impacto | Prob. | Score | Nivel | Estado | Revisión DPO`.

Seed (impacto × probabilidad = score):

| Tratamiento | Activo | Amenaza | I | P | Score | Nivel | Estado |
|-------------|--------|---------|---|---|-------|-------|--------|
| Gestión de clientes CRM | Sistema de Nómina Bancolombia | Decisiones automatizadas de perfilamiento sin revisión humana (Motor de scoring sin opción de apelación) | 5 | 3 | 15 | Crítico | Identificado |
| Plataforma SaaS usuarios | Plataforma SaaS propia | Acceso no autorizado a datos de usuarios SaaS (Autenticación sin MFA en producción) | 4 | 3 | 12 | Alto | En tratamiento |
| Plataforma SaaS usuarios | BD clientes PostgreSQL | Transferencia internacional sin garantías (Datos a AWS sin SCCs) | 3 | 4 | 12 | Alto | En tratamiento |
| Gestión de clientes CRM | CRM Salesforce | Fuga de datos de clientes desde CRM (Permisos de exportación sin restricción) | 4 | 2 | 8 | Alto | Identificado |
| Nómina de empleados | BD clientes PostgreSQL | Exposición de datos de nómina por error de configuración (Backups sin cifrado en S3) | 3 | 2 | 6 | Medio | Mitigado |

Pie: `0 de 5 riesgos revisados por el DPO`.

### 4.8 Mapa de Calor

`Mapa de Calor — Impacto × Probabilidad` · matriz 5×5 (eje Y impacto 1–5, eje X probabilidad) con conteo por celda y leyenda `Bajo / Medio / Alto / Crítico`. Nota: "RN-201: Zona roja (Alto/Crítico) — notificación automática al DPO y EIPD obligatoria". Panel `Riesgos identificados (5)` · `3 requieren EIPD · 1 críticos` con tarjetas `nivel | badge EIPD | I × P = score`.

### 4.9 Brecha de Controles

`Cumplimiento Ponderado de Controles` (gauge %) + etiqueta `ADECUADO`; contadores `Controles necesarios / implementados / faltantes`; barra `Progreso general`; tabla `Categoría | Necesarios | Implementados | % | Barra` para `Técnicos`, `Organizativos`, `Jurídicos`, `Documentales`; mensaje de cierre según resultado.

### 4.10 Centro de Reportes

`Reporte Ejecutivo de Riesgos` · "Resumen automático para la Alta Dirección — incluye exposición de riesgos, tratamientos críticos y estado de recomendaciones del DPO." + botón `Generar reporte`. 6 contadores (riesgos totales, críticos, altos, EIPD obligatorias, mitigados, activos mapeados) y ranking `Tratamientos con mayor exposición` con `score/25`.

---

## 5. Fase 3 · Implementación Inicial

Cabecera `PLANIFICAR · FASE 3` · `Implementación Inicial` · `Diagnóstico organizacional · Gobierno · Roles · Recursos · Evidencias · Brechas · Recomendaciones · Informe de Implementación`.

8 pestañas.

### 5.1 Evaluación Organizacional (wizard de 5 dimensiones)

`Asistente de Diagnóstico` con % global y progreso `n/m preguntas` por dimensión:
`Compromiso de la Alta Dirección` (4), `Estructura Organizacional` (4), `Cultura de Protección de Datos` (3), `Recursos Disponibles` (3), `Gobierno del SGPDP` (3) = 17 preguntas.

Cada pregunta: enunciado + base normativa + 3 botones `Cumple / Parcial / No Cumple`.

Botón `Nueva pregunta (DPO)` (el DPO amplía el cuestionario). Navegación `Anterior / Dimensión n de 5 / Siguiente`.

Preguntas literales de la dimensión 1: 1) ¿La alta dirección ha aprobado formalmente la Política de Protección de Datos? (Art. 10 LOPDP / ISO 27701 §5.2) 2) ¿Existe un patrocinador ejecutivo designado para el SGPDP con capacidad de decisión? (ISO 27701 §5.1) 3) ¿La dirección asigna recursos suficientes (presupuesto y personal) al programa de privacidad? (Art. 30 LOPDP) 4) ¿Se incluye el estado del SGPDP en las revisiones de alta dirección al menos trimestralmente? (ISO 27701 §9.3).

### 5.2 Gobierno del SGPDP

Banner de independencia: "Independencia del DPO: El Oficial registra únicamente el estado de verificación y las evidencias revisadas. No modifica la estructura organizacional ni designa miembros. Su función es supervisar, no administrar."

4 elementos verificables: Comité de Protección de Datos (Art. 42 LOPDP) · Patrocinio formal de la gerencia (ISO 27701 §5.1) · Canales de reporte activos (Art. 41 LOPDP) · Mecanismos de seguimiento del SGPDP (ISO 27701 §9.1).

### 5.3 Roles y Responsabilidades

Nota: "El DPO verifica que los roles exigidos por la LOPDP hayan sido formalmente definidos y documentados. Los roles marcados con ⚠ requieren Acta de Designación formal para ser clasificados como 'Definido'." + alerta "El rol de DPO no cuenta con Acta de Designación formal registrada. Obligatorio conforme Art. 42 LOPDP y Res. SPDP 2025-0028-R."

5 roles con estado `Definido / Parcialmente definido / No definido`: Responsable del Tratamiento (Art. 4) · Encargado del Tratamiento (Art. 38) · DPO (Art. 42, `Acta requerida`) · Custodios de Información (Art. 30) · Comité de Protección de Datos (Art. 42, `Acta requerida`).

Los roles con acta muestran campo `HASH DEL ACTA DE DESIGNACIÓN` + botón `Generar`.

### 5.4 Recursos

Banner: "Restricción técnica — Conflicto de interés: El DPO registra su evaluación independiente de la suficiencia de los recursos, pero no interviene en su asignación o administración. Esta evaluación es únicamente de carácter observacional."

5 bloques con checklist de ítems y estado `Suficiente / Insuficiente / No evaluado`: Recursos Humanos (DPO a tiempo completo, equipo de compliance, personal de TI especializado) · Tecnológicos (GRC/DLP, SIEM, gestor de consentimientos) · Presupuesto (presupuesto anual aprobado, plan de inversión en seguridad) · Planes de Capacitación (plan anual, e-learning LOPDP, taller DPO-empresa) · Infraestructura (cifrado en reposo y tránsito, control de acceso biométrico, backups seguros).

### 5.5 Evidencias — Bóveda de Integridad SHA-256

"Cada archivo genera un hash criptográfico al cargarse". Formulario: `NOMBRE DEL DOCUMENTO`, `TIPO DE DOCUMENTO` (Organigrama, Acta de Comité, Nombramiento, Política, Plan de trabajo, Presupuesto, Contrato, Otro), `DIMENSIÓN RELACIONADA` (las 5 dimensiones), carga de archivo, botón `Registrar con SHA-256`.

Lista de evidencias: nombre, `tipo · dimensión · tamaño`, fecha, `sha256:…`, y pie `Cargado por <usuario> — Registro inmutable`.

### 5.6 Brechas — Gap Analysis

`Gap Analysis — 10 brechas detectadas` · `0 del wizard · 10 del sistema`. Cada brecha: código `GAP-SIS-0xx`, severidad (`Alta`/`Media`), descripción y dominio (`Gobierno y Liderazgo`, `Marco Jurídico`, `Personas y Cultura`, `Procesos y Procedimientos`, `Tecnología y Seguridad`, `Gestión de Riesgos`). Panel de detalle a la derecha.

### 5.7 Recomendaciones

Banner de bloqueo: "Regla de Bloqueo: El DPO no puede cerrar una recomendación. El cierre solo ocurre cuando el DPO registra la verificación de eficacia con hash de evidencia en un ciclo posterior. Las recomendaciones son de solo lectura para la organización."

Tarjetas: prioridad (`Crítica`/`Alta`), dominio, estado (`Pendiente`/`En Proceso`/`Verificado`), título, descripción con plazo, botón `Verificar eficacia con evidencia`; las verificadas muestran `Verificado el <fecha> por <DPO>` + hash.

### 5.8 Informe Ejecutivo

`Informe de Implementación — Informe Ejecutivo` + botón `Generar informe`.

`Gráfico de Madurez — Implementación`: radar por los 6 dominios con leyenda "Azul = nivel actual · Gris punteado = nivel objetivo". KPIs `3.0/5 Nivel actual`, `60% Implementación`, `1.8 Brecha promedio`. Bloques `Fortalezas detectadas` y `Debilidades críticas` (dominio — nivel n/5) y lista de recomendaciones críticas.

---

## 6. Fase 4 · Definición (marco estratégico)

Cabecera `PLANIFICAR · FASE 4` + badge `1 tratamiento bloqueado`; subtítulo `Controles · Medidas técnicas/organizativas/jurídicas · Evidencias · Evaluación · Hallazgos · Planes · Reporte`. 9 pestañas.

### 6.1 Controles (diseño)

`4 controles propuestos` + botón `Nuevo`. Tarjeta: tipo (`Técnica`/`Organizativa`/`Legal`), estado (`Propuesta`/`Aprobada`/`En implementación`), título, `Plazo: <fecha>`, prioridad (`Alto`). Seed: MFA universal (31 Jul 2026) · Capacitación LOPDP a equipo de ventas (15 Ago) · Formalización de SCCs con proveedores cloud (30 Jul, Aprobada) · Restricción de exportación en CRM (20 Ago).

### 6.2 Medidas Técnicas — `Arquitectura de Seguridad`

Filtros `Todas / Criptografía / Seudonimización / Control de Acceso / Monitoreo / Seguridad Aplicaciones`. Ítems con base normativa: Cifrado AES-256 en reposo (Art. 30 / NIST PR.DS-1) · TLS 1.3 en tránsito (Art. 30 / NIST PR.DS-2) · Seudonimización de datos de prueba (Art. 30 / ISO 27701 §7.4) · MFA (Art. 30) · Gestión de privilegios – Least Privilege (Art. 30 / NIST AC-6) · Logs de auditoría inmutables (Art. 37 / NIST AU-2) · Gestión de vulnerabilidades SAST/DAST (Art. 30 / ISO 27001 §8.8).

### 6.3 Medidas Organizativas

Banner: "Gobernanza y conflicto de interés: El DPO verifica que las funciones asignadas eviten conflictos de interés. Ningún área tratante puede auto-supervisar el cumplimiento de sus propios tratamientos (Art. 42 LOPDP)."

Ítems con categoría, estado (`Definida`/`En proceso`/`Pendiente`) y `Responsable`: Organigrama de áreas tratantes (RRHH + Legal) · Plan de capacitación anual en LOPDP (RRHH + DPO) · Manual de funciones del DPO (DPO + Legal) · Procedimiento de atención de derechos ARCO — 30 días (Legal + TI) · Protocolo de gestión de brechas 72h (TI + Legal + DPO).

### 6.4 Medidas Jurídicas

`DPAs, confidencialidad, LIA y políticas`. Ítems con tipo (`DPA`/`Confidencialidad`/`LIA`) y estado (`Pendiente`/`Plantilla lista`/`En revisión`): DPA AWS · DPA Salesforce · Cláusula de confidencialidad — Empleados · Test LIA — Perfilamiento de usuarios · Plantilla SCCs.

### 6.5 Evaluación (`RN-401`)

Banner: "Validación DPO antes de implementación: El DPO evalúa si cada control propuesto es proporcional al riesgo identificado, suficiente para cumplir con la norma y justificable antes de que se asigne presupuesto para su despliegue operativo."

Bloque `Validación de principios por tratamiento (RN-401)` con una fila por actividad del RAT y veredicto `Válido` / `Inconsistencia` / `Bloqueado` + motivo. Seed: a1 Ejecución de contrato (Art. 8) → Válido; a2 Obligación legal (Art. 9) → Inconsistencia (sin medidas de seguridad técnicas documentadas para nómina); a3 Consentimiento (Art. 7) → Bloqueado (aviso de privacidad de la plataforma SaaS no actualizado con decisiones automatizadas).

Bloque `Suficiencia y proporcionalidad por control`: por control, botones `Suficiente / Proporcional / Insuficiente`.

### 6.6 Hallazgos de diseño

`3 hallazgos de diseño` · `0 resueltos · 3 no resueltos` + `Nuevo`. Códigos `HD-00x`, severidad `Crítica/Mayor/Menor`, estado `No Resuelto`, descripción y documento afectado (`Aviso de Privacidad Web v1.3`, `Política Interna de Seguridad v1.0`, `Borrador DPA — AWS`).

### 6.7 Planes de Acción

Banner: "Compromisos gerenciales: Planes de acción aprobados por la alta dirección para subsanar brechas detectadas en esta fase. El DPO supervisa el avance sin administrar los planes."

4 contadores por estado (`Comprometido`, `En ejecución`, `Completado`, `Vencido`). Cada plan: título, estado, botón `Ver`, `BRECHA REF.` (código HD), `RESPONSABLE`, `PLAZO`, hash cuando está completado, y selector de estado.

### 6.8 Evidencias y Reporte Alineación

Misma bóveda SHA-256 de la Fase 3 (ámbito Fase 4) y un reporte de alineación normativa exportable a PDF.

---

## 7. Fase 5 · Implementación y Supervisión

Cabecera `HACER · FASE 5` + badges `1 hallazgo abierto`, `2 controles sin evidencia`; subtítulo `Controles Implementados · Medidas técnicas / org. / jurídicas · Evidencias · Evaluación · Hallazgos · Recomendaciones · Planes · Reportes`. 10 pestañas.

### 7.1 Controles Implementados

Filtros `Todos / Técnico / Organizativo / Legal` + contador `6 / 6 controles`. Tarjetas con tipo, estado (`Implementado` / `En Progreso` / `Pendiente`), título y base normativa:

Cifrado de datos en reposo AES-256 (Art. 30 / NIST PR.DS-1, Implementado) · MFA (Art. 30, En Progreso) · Registro de auditoría – logs (Art. 37, Implementado) · Contrato de encargado con proveedores (Art. 38, En Progreso) · Capacitación en protección de datos (Art. 30, Implementado) · Protocolo de gestión de brechas (Art. 41, Pendiente).

### 7.2 Evidencias (Bóveda operativa)

`Bóveda de Integridad SHA-256` · "Conservación mínima 5 años · Evidencia inalterable".

Formulario: formato/tipo (`Documento`, `Captura de pantalla`, `Log exportado`, `Acta`, `Certificado`, `Video`, `Informe técnico`, `Registro`) + control asociado + `Cargar + SHA-256`. Filtro por control (`Todos los controles (5)` …).

Items: nombre, `tipo · control`, fecha, `sha256:…`, pie `<área> · Conservación 5 años · Registro inmutable`.

### 7.3 Evaluación de eficacia

Banner: "Calibración de Eficacia: Para cada control el DPO debe evaluar tres ejes: Estado de implementación, Eficacia observada y Confianza en la evidencia presentada."

Contadores `Evaluados / Pendientes / Total controles` y lista de los 6 controles a calificar. Escala de eficacia `Alta / Media / Baja`; confianza en evidencia `Alta / Media / Baja`.

### 7.4 Hallazgos operativos

`3 hallazgos operativos` + `Nuevo`. Códigos `H-00x`, tipo `NCM` (No Conformidad Mayor) / `NCm` / `OBS` / `OM` / `BP`, estado `Abierto / En Proceso / Cerrado`. Ayuda: "Use 'Nuevo' para registrar observaciones, no conformidades, oportunidades y buenas prácticas".

### 7.5 Resto

`Medidas Técnicas / Org. / Jurídicas` (estado de ejecución real), `Recomendaciones`, `Planes de Acción` y `Reportes` (exportación PDF del ciclo Hacer).

---

## 8. Fase 6 · Monitoreo y Revisión (Auditoría)

Cabecera `VERIFICAR · FASE 6` + badges `1 hallazgo abierto`, `1 incidente activo`; subtítulo `Monitoreo · Auditorías · Revisiones · Checklist · Hallazgos · Indicadores · Incidentes · Evidencias · Reportes`. 9 pestañas.

### 8.1 Centro de Monitoreo

`Estado del SGPDP — Vista Consolidada` · "Cada hallazgo tiene una 'partida de nacimiento' en la Fase 1 y evidencia inalterable en la Fase 6."

4 KPIs (`% Implementación 50%`, `NC Mayores abiertas 2`, `Incidentes activos 1`, `Controles sin evidencia 2`) y 8 tarjetas de acceso con badge de estado: Auditorías (`1 en ejecución`), Revisiones Técnicas (`2 No Conformes`), Checklist Inteligente, Hallazgos (`1 abiertos`), Indicadores KPI, Gestión de Incidentes (`1 activo`), Bóveda de Evidencias (`2 sin evidencia`), Reportes.

`Hallazgos recientes — Trazabilidad completa F1→F6`: tipo (`NC Mayor`/`NC Menor`/`Observación`), descripción truncada, artículo LOPDP y estado (`En Proceso`/`Abierto`/`Pendiente Evidencia`/`Cerrado`) + `Ver todos los hallazgos`.

### 8.2 Auditorías

`3 auditorías — Arts. 47.14, 54.3` + `Nueva`. Cada una: código (`AUD-2026-01`, `AUD-2026-02`, `AUD-2026-EXT`), tipo `Interna`/`Externa`, estado `Cerrada`/`En ejecución`/`Programada`, objetivo, responsable y fecha.

### 8.3 Revisiones

Bitácora de verificaciones puntuales del DPO (`2 No Conformes` en el seed).

### 8.4 Checklist Inteligente — `Motor Diferenciador`

`Checklist parametrizado` con perfiles: `LOPDP`, `ISO 27701`, `Videovigilancia`, `Salud / Datos Sensibles`, `Inteligencia Artificial`.

Contadores `Cumple / No Cumple / Parcial / No Aplica`. 8 preguntas del perfil LOPDP con artículo y respuesta:

| Pregunta | Artículo | Respuesta |
|----------|----------|-----------|
| ¿RAT actualizado con todos los campos del Art. 13? | Art. 13 | Cumple |
| ¿Todos los tratamientos con base de legitimación documentada? | Art. 7-12 | Parcial |
| ¿Contratos con encargados incluyen cláusulas DPA del Art. 38? | Art. 38 | No Cumple |
| ¿Aviso de privacidad publicado con todos los elementos del Art. 13? | Art. 13 | Cumple |
| ¿Protocolo de brechas con notificación a SPDP ≤ 72h? | Art. 41 | No Cumple |
| ¿Derechos ARCO con proceso documentado y plazos? | Art. 19-27 | Cumple |
| ¿Cifrado en tránsito y reposo para datos sensibles? | Art. 30 / ISO 27001 | Cumple |
| ¿El DPO tiene acceso independiente a la Dirección y reporta directamente? | Art. 47 | Cumple |

### 8.5 Indicadores

Alerta `⚡ ALERTA PREVENTIVA — n incidente(s) activo(s) requieren atención inmediata` + banner Art. 41 ("Las brechas de seguridad deben notificarse a la SPDP en un plazo máximo de 72 horas desde que el responsable tenga conocimiento…") + chip `INC-2026-001 — plazo: 06 Jun 2026 ✓ Notif.`

9 KPIs: Nivel de cumplimiento legal 50% · Eficacia de controles (Alta) 17% · Hallazgos abiertos 1 · NC Mayores activas 2 · Incidentes activos 1 · Incidentes sin notificar SPDP 0 · Solicitudes ARCO 7 · T. resp. ARCO promedio 4.2 días · Capacitaciones ejecutadas 2/4.

Bloques: `Indicador de Incidentes — Plazos de notificación SPDP (Art. 41 LOPDP)` (código, tipo, tratamiento, `Fecha máx. reporte SPDP: <fecha> — 00:00 h (72h desde detección)`, sello `✓ Notificado`); barras `Rendimiento del SGPDP (%)`; radar `Madurez del SGPDP` (Gobernanza, Técnica, Legal, ARCO, Incidentes, Evidencias); `Evolución por control` con badge `Ef.Alta`/`Ef.Media`.

### 8.6 Incidentes

`Brechas de Seguridad — 72h LOPDP` · `n incidente(s) activo(s)` · `Art. 41 LOPDP — Máx. 72h para notificar SPDP`. Tarjeta: código `INC-2026-001`, tipo (`Confidencialidad`/`Integridad`/`Disponibilidad`), estado `Notificado SPDP`, activo/tratamiento afectado, `Detección: <fecha>`, sello `SPDP notificado ✓`.

### 8.7 Reportes — `Reporting Engine — Fase 6`

"Exportación de documentos con validez institucional para presentar ante la Superintendencia de Protección de Datos Personales (SPDP)." 5 informes con botón `Generar PDF`:

Estado General del SGPDP · Informe de Auditoría · Reporte de Hallazgos e Incidentes · Dashboard de Indicadores · Reporte PHVA y de Riesgos.

---

## 9. Fase 7 · Mejora Continua — Cierre del Ciclo PHVA

Cabecera `ACTUAR · FASE 7` + badges `Madurez 2.7/5 — Definido`, `3 recomendaciones activas`; subtítulo `Seguimiento · Recomendaciones · Acciones · Verificación · KPIs · Madurez · Tendencias · Lecciones · Reportes`. 9 pestañas.

### 9.1 Seguimiento — `Expediente de Mejora — F1→F7`

`3 recomendaciones · 0% cerradas`. Items: `REC-2026-00x`, estado (`Emitida`/`En implementación`/`Implementada`/`Cerrada`), título, responsable y plazo. Panel lateral `Trazabilidad total del SGPDP` con la cadena "Fase 1 (Base legal) → Fase 2 (Riesgo) → Fase 6 (Hallazgo) → Fase 7 (Mejora)" y la madurez global. Nota: "El expediente digital demuestra la trazabilidad completa desde la base legal hasta el cierre de la mejora".

### 9.2 Nivel de Madurez

Tarjeta grande: nivel `3`, `NIVEL DE MADUREZ INSTITUCIONAL`, etiqueta `Definido`, descripción `SGPDP estandarizado y documentado`, `2.71 / 5.00 — Algoritmo PHVA`.

Radar por fase (F1…F7, escala 0–100). Escala 1–5: 5 Optimizado (enfoque en la mejora continua e innovación proactiva), 4 Controlado (SGPDP medido mediante KPIs y supervisión activa), 3 Definido (SGPDP estandarizado y documentado), 2 Gestionado (procesos planificados pero no estandarizados), 1 Inicial (procesos ad-hoc y desorganizados).

`Detalle por fase` (`Presione una fase para ver qué falta según el contrato LEXDATA IA`): F1 Controlado 80% · F2 Gestionado 40% · F3 Definido 60% · F4 Definido 60% · F5 Gestionado 40% · F6 Definido 60% · F7 Gestionado 40%.

Algoritmo (literal del prototipo): "Pondera cumplimiento normativo (F1 · 20%), gestión de riesgos (F2 · 20%), controles implementados (F5 · 25%), hallazgos de auditoría (F6 · 20%) y eficacia de remediación (F7 · 15%)."

### 9.3 Lecciones

`Lecciones documentadas (n)` + `Nueva`: tipo (`Hallazgo`/`Buena práctica`), estado (`Documentada`/`Difundida`), título, fecha y áreas.

`Oportunidades de mejora detectadas automáticamente`: "El sistema analizó las 7 fases del SGPDP e identificó n oportunidades. Seleccione las que desea aplicar." + `Enviar seleccionadas (n)`. Cada oportunidad: tipo, impacto (`Alto`/`Bajo`), fase origen, diagnóstico y acción propuesta. Ejemplos: 4 riesgo(s) con nivel Crítico/Alto sin mitigación completa (F2) · 3 hallazgo(s) detectados en auditoría que deben cerrarse (F6) · 3 fase(s) con madurez < 50%: F2, F5, F7 (F7) · 1 fase(s) modelo con madurez ≥ 80%: F1 (F5).

### 9.4 Resto

`Recomendaciones` (3 activas), `Acciones Correctivas`, `Verificación` (de eficacia con hash), `Indicadores KPI`, `Tendencias` y `Reportes`.

---

## 10. Portal del Cliente — Diagnóstico PIMS (`ClientPortal.tsx`)

Cabecera `PORTAL DEL CLIENTE · LOPDP` · `Diagnóstico PIMS · LOPDP Ecuador` · `Evaluación de madurez en 10 pasos — Sistema de Gestión de Protección de Datos Personales`.

Panel izquierdo `DIAGNÓSTICO PIMS` + empresa activa + los 11 módulos (0–10):

| # | Módulo | Base |
|---|--------|------|
| 0 | Fundamentos y Ecosistema | LOPDP Art. 1-5 · ISO/IEC 27701:2019 |
| 1 | Gobernanza y Compromiso Institucional | |
| 2 | Mapeo de Flujos e Inventario de Datos | |
| 3 | Adecuación de Políticas y Documentación | |
| 4 | Regularización Contractual con Terceros | |
| 5 | Operativización de Derechos ARCO-PS | |
| 6 | Seguridad Técnica y Gestión de Riesgos | |
| 7 | Respuesta a Incidentes y Brechas | |
| 8 | Cultura de Privacidad y KPIs | |
| 9 | Conservación, Bloqueo y Eliminación Segura | |
| 10 | Auditoría Interna y Control de Madurez | |

Barra `Progreso 0/11`. Cada módulo: título, descripción, base normativa y 3 preguntas
(`PREGUNTA n DE 3`) con enunciado, nota explicativa y respuestas `Sí, implementado` /
`En proceso` / `No implementado`. Navegación `Anterior / Siguiente`.

Preguntas literales del módulo 0: 1) ¿La empresa ha identificado formalmente que está sujeta a la LOPDP Ecuador? (Toda entidad que trate datos personales de titulares en Ecuador debe cumplir la LOPDP, independientemente de su tamaño o sector.) 2) ¿Se ha realizado algún diagnóstico previo de cumplimiento en protección de datos personales? (Un gap analysis previo frente a LOPDP e ISO/IEC 27701 acelera la implementación y reduce costos de remediación.) 3) ¿Existe una persona o equipo responsable de gestionar el cumplimiento normativo de privacidad? (Puede ser el DPO formalmente designado, el equipo legal o un responsable interno designado provisionalmente.)

Además (según memoria del producto) el portal del cliente incluye las vistas `Mi Empresa`, `Mis Documentos` y `Asistente`: consérvalas como pestañas del portal alimentadas por los datos del tenant.

---

## 11. Formulario SPDP — Registro + motor Pd-VaR (`ClientDataForm.tsx`)

Cabecera `FORMULARIO DE REGISTRO LOPDP` · `Portal de Clientes LEXDATA IA` ·
"Complete el wizard de 7 secciones para obtener su cotización personalizada SGPDP con análisis Pd-VaR."

Pasos: `Identificación`, `S1 · Perfil`, `S2 · Volumen`, `S3 · Datos`, `S4 · Tecnología`,
`S5 · Madurez`, `S6 · Operativa`, `S7 · Gobernanza`. Los pasos siguientes están
bloqueados hasta completar los campos obligatorios del paso actual.

Pie fijo: tarjeta de la Dra. Andreina Almeida — "Revisará su perfil Pd-VaR y coordinará la implementación del SGPDP. Confidencialidad garantizada."

### 11.1 Paso Identificación

Banner: "Esta información identifica al Responsable del Tratamiento ante la Superintendencia de Protección de Datos (SPDP). Debe coincidir con los datos del SRI."

`DATOS DE LA EMPRESA`: RAZÓN SOCIAL*, RUC* (13 dígitos), SITIO WEB, ACTIVIDAD ECONÓMICA PRINCIPAL (CIIU)*

`REPRESENTANTE LEGAL`: NOMBRE COMPLETO*, CÉDULA DE IDENTIDAD* (10 dígitos, validar dígito verificador)

`UBICACIÓN Y CONTACTO`: DIRECCIÓN*, CIUDAD*, PROVINCIA* (las 24 provincias del Ecuador), TELÉFONO*, CORREO INSTITUCIONAL*

### 11.2 Secciones S1–S7 (campos que alimentan el scoring)

- **S1 Perfil**: `sector` (Salud y Medicina, Finanzas/Banca/Seguros, Gobierno/Sector Público, Telecomunicaciones, Educación, Comercio Electrónico, otros), `trabajadores` (`1-9`, `10-49`, `50-199`, `200+`), `sucursales` (`1-3`, `4-10`, `10+`).
- **S2 Volumen**: `volumenRegistros` (`<1000`, `1-10` mil, `10-100` mil, `>100` mil titulares), `categoriasTitulares` (multi: clientes, empleados, proveedores, pacientes, usuarios digitales, menores, postulantes…).
- **S3 Datos**: flags `datosSalud`, `datosBiometricos`, `datosGeneticos`, `datosMenores`, `datosRaciales`, `datosPoliticos`, `datosReligiosos`, `datosSindicales`, `datosSexuales`, `datosPenales`; textarea `Describa los datos sensibles en su operación`.
- **S4 Tecnología**: `usaIA`, `decisionesAutomatizadas`, `realizaPerfilamiento`, `transferenciasInternacionales`, `cloudExtranjero`; textarea `Sistemas tecnológicos que gestionan datos personales`.
- **S5 Madurez**: `tieneRAT`, `tieneEIPD`, `tieneLIA`, `tienePoliticas`, `tieneDPO` (booleanos: la ausencia puntúa).
- **S6 Operativa**: `solicitudesARCO` (`<10`, `10-50`, `51-100`, `>100` al año), `incidentesAnuales` (`0`, `1-2`, `3-5`, `>5`), `canal_arco`, `responsable`, `verificacion`.
- **S7 Gobernanza**: `compromisoDirectivo`, `comitePrivacidad`, `antecedentesReclamos`, `sancionesSPDP`, `declaracionVeracidad`, `notaAdicional`.

### 11.3 Algoritmo Pd-VaR (reconstruido del bundle — implementar tal cual)

Suma de factores (`pts`), cada uno con etiqueta visible en el desglose:

| Condición | Etiqueta del factor | pts |
|-----------|---------------------|-----|
| sector ∈ {Salud y Medicina, Finanzas/Banca/Seguros} | Sector de alto riesgo regulado (salud/finanzas) | 4 |
| sector ∈ {Gobierno/Sector Público, Telecomunicaciones, Educación, Comercio Electrónico} | Sector con regulación sectorial complementaria | 2 |
| trabajadores `200+` | Gran empresa (200+ trabajadores) | 3 |
| trabajadores `50-199` | Mediana empresa (50–199) | 2 |
| trabajadores `10-49` | Pequeña empresa (10–49) | 1 |
| sucursales `10+` | Red amplia de sucursales (10+) | 2 |
| sucursales `4-10` | Múltiples sucursales (4–10) | 1 |
| volumen `>100` mil | Volumen masivo (>100 000 titulares) | 6 |
| volumen `10-100` mil | Volumen alto (10 000–100 000) | 4 |
| volumen `1-10` mil | Volumen moderado (1 000–10 000) | 2 |
| volumen `<1000` | Volumen reducido (<1 000) | 1 |
| categoriasTitulares ≥ 5 | n categorías de titulares distintas | 3 |
| categoriasTitulares ≥ 3 | n categorías de titulares distintas | 2 |
| categoriasTitulares ≥ 1 | 1 categoría de titulares | 1 |
| datosSalud | Datos de salud (Art. 26 LOPDP) | 5 |
| datosMenores | Datos de menores de edad (Art. 25 LOPDP) | 5 |
| datosBiometricos | Datos biométricos / identificador único | 4 |
| datosGeneticos | Datos genéticos | 4 |
| otras categorías especiales (raciales, políticos, religiosos, sindicales, sexuales, penales) | n categoría(s) especial(es) adicional(es) | `min(n × 2, 5)` |
| usaIA | Sistemas de Inteligencia Artificial | 4 |
| decisionesAutomatizadas | Decisiones automatizadas sobre titulares | 3 |
| realizaPerfilamiento | Elaboración de perfiles de personas | 3 |
| transferenciasInternacionales | Transferencias internacionales de datos | 4 |
| cloudExtranjero | Proveedores cloud / SaaS en el extranjero | 2 |
| !tieneRAT | Sin Registro de Actividades de Tratamiento (RAT) | 3 |
| !tieneEIPD | Sin Evaluación de Impacto (EIPD) realizada | 2 |
| !tieneLIA | Sin Evaluación de Interés Legítimo (LIA) | 1 |
| !tienePoliticas | Sin políticas formales de privacidad | 3 |
| !tieneDPO | Sin Delegado de Protección de Datos designado | 3 |
| ARCO `>100` | Carga ARCO+ muy alta (>100/año) | 4 |
| ARCO `51-100` | Carga ARCO+ alta (51–100/año) | 3 |
| ARCO `10-50` | Carga ARCO+ moderada (10–50/año) | 2 |
| ARCO `<10` | Carga ARCO+ reducida (<10/año) | 1 |
| incidentes `>5` | Historial de incidentes crítico (>5/año) | 5 |
| incidentes `3-5` | Historial de incidentes alto (3–5/año) | 3 |
| incidentes `1-2` | Incidentes de seguridad previos (1–2/año) | 2 |
| !compromisoDirectivo | Sin compromiso documentado de la alta dirección | 3 |
| !comitePrivacidad | Sin comité interno de privacidad | 1 |
| antecedentesReclamos | Antecedentes de reclamos de titulares | 4 |
| sancionesSPDP | Sanciones o advertencias previas del SPDP | 6 |

```ts
const total   = factores.reduce((acc, f) => acc + f.pts, 0);
const pdScore = Math.min(100, Math.round(total / 85 * 100));   // 85 = techo de referencia
const nivelRiesgo = pdScore >= 65 ? "Crítico"
                  : pdScore >= 40 ? "Alto"
                  : pdScore >= 20 ? "Medio" : "Bajo";
```

**Caso A / Caso B** — `caso = "A"` (micro-empresa de bajo riesgo → lista de espera)
cuando `trabajadores ∈ {"1-9", ""}` y no hay `datosSalud`, `datosBiometricos`,
`datosMenores`, `usaIA`, `transferenciasInternacionales` (ni demás gatillos de alto
riesgo). En cualquier otro caso `caso = "B"` (servicio completo con cotización).

**Honorarios**

```ts
let base = trabajadores === "200+"   ? 1100
         : trabajadores === "50-199" ?  750
         : trabajadores === "10-49"  ?  550 : 380;          // USD/mes
base *= nivelRiesgo === "Crítico" ? 1.55
      : nivelRiesgo === "Alto"    ? 1.30
      : nivelRiesgo === "Medio"   ? 1.15 : 1.00;
if (datosSalud || datosMenores)                 base += 100;
if (usaIA || decisionesAutomatizadas)           base += 75;
if (transferenciasInternacionales)              base += 50;
if (sancionesSPDP)                              base += 150;
const honorarioMensual  = Math.round(base / 50) * 50;        // redondeo a múltiplos de 50
const implementacionFee = 5400;                              // fee de implementación base
```

Se muestra además el `breakdown` de factores ordenado por `pts` descendente y la tarjeta
`Índice Pd-VaR · Riesgo LOPDP calculado` con `<nivelRiesgo> · <pdScore>/100`.

**Próximos pasos (pantalla final):**

Caso B: "Dra. Andreina Almeida revisará su perfil Pd-VaR en 24 horas hábiles" · "Se iniciará el Diagnóstico LOPDP completo — Fase 1 · Normas aplicables" · "Se generará el RAT, EIPD y documentación base del SGPDP" · "Acceda al Dashboard LOPDP en el menú lateral izquierdo" · "Primer reporte mensual al SPDP en el plazo reglamentario"

Caso A: "Su correo ha sido registrado en la lista de espera prioritaria" · "Recibirá una notificación cuando el servicio de Implementación esté disponible" · "Un asesor de LEXDATA IA se contactará con usted para orientarle"

---

## 12. Capacitaciones

Cabecera `CAPACITACIONES` + badges `10/12 evaluaciones aprobadas`, `8 módulos disponibles`; subtítulo `E-Learning · Evaluación de conocimientos · Certificación virtual · Central de cumplimiento · Informes DPO`.

3 pestañas: `E-Learning`, `Central de Capacitaciones` (badge `10/12 aprobados`), `Informe DPO`.

### 12.1 E-Learning

`Biblioteca de Capacitaciones LOPDP` · "Seleccione un módulo de capacitación para iniciar. Al finalizar, obtendrá un certificado virtual si aprueba con ≥ 70%."

8 módulos (nivel · categoría · base · duración · 10 preguntas · certificado virtual):

| Módulo | Nivel | Categoría | Base | Duración |
|--------|-------|-----------|------|----------|
| Introducción a la LOPDP Ecuador | Básico | Marco Legal | LOPDP 2021 | 18 min |
| Derechos ARCO+ y atención al titular | Básico | Operativo | Arts. 19-22 | 22 min |
| Bases legales del tratamiento de datos | Intermedio | Marco Legal | Arts. 7-14 | 20 min |
| Protección de datos sensibles y menores | Intermedio | Datos Especiales | Arts. 25-26 | 25 min |
| Gestión de incidentes — Protocolo 72h | Avanzado | Seguridad | Art. 41 | 30 min |
| Evaluación de Impacto EIPD — Metodología | Avanzado | Técnico | Art. 39 | 35 min |
| Rol del DPO — Funciones y responsabilidades | Intermedio | Gobernanza | Arts. 49-52 | 28 min |
| Transferencias internacionales de datos | Avanzado | Internacional | Art. 54 | 24 min |

(Las descripciones completas de cada módulo están en el prototipo y deben conservarse literalmente; ver §12.1 del prototipo o el seed.)

### 12.2 Central de Capacitaciones

KPIs: `Evaluaciones completadas 12`, `Tasa de aprobación 83%`, `Puntaje promedio 82%`, `Personas sin capacitar 0`.

`Registro de evaluaciones` con filtro por módulo: avatar con iniciales, nombre, módulo, resultado (`Aprobado`/`No aprobado`), puntaje % y fecha.

`Avance por módulo`: `n/m aprob. · %` por cada uno de los 8 módulos.

### 12.3 Informe DPO

`Informes del Programa de Capacitaciones` · "Documentos con validez institucional para acreditar el programa de sensibilización en protección de datos ante el SPDP y la Alta Dirección."

3 informes con `Generar PDF`: Informe Mensual de Capacitaciones · Informe de Cumplimiento LOPDP · Actas Individuales de Capacitación.

---

## 13. Catálogo de reglas de negocio (RN)

| ID | Regla |
|----|-------|
| RN-004 | El Motor de Conocimiento Normativo es la fuente única de verdad legal. Toda norma tiene hash SHA-256, versión, fase PHVA y controles asociados. Alimenta automáticamente F2 (inventario), F4 (validación de principios) y F5 (controles). La matriz es de solo lectura para operadores. |
| RN-101 | Las evidencias se registran con hash SHA-256 al cargarse, son inmutables y se conservan mínimo 5 años. |
| RN-201 | Riesgo en zona roja (Alto/Crítico, score ≥ 12 en matriz 5×5) ⇒ notificación automática al DPO + EIPD obligatoria. Score = impacto × probabilidad. |
| RN-301 | Diagnóstico organizacional: 17 preguntas en 5 dimensiones; el DPO puede añadir preguntas propias. |
| RN-401 | El DPO valida cada tratamiento del RAT. `Con Observaciones` bloquea el avance del tratamiento. Los controles se califican en suficiencia y proporcionalidad antes de presupuestarse. |
| RN-402 | Roles con `Acta requerida` (DPO, Comité) solo pasan a `Definido` con acta de designación y hash registrado (Art. 42 LOPDP · Res. SPDP 2025-0028-R). |
| RN-501 | Calibración de eficacia en 3 ejes: implementación, eficacia observada y confianza en la evidencia. |
| RN-601 | Cada hallazgo se vincula obligatoriamente a un artículo de la matriz normativa (sugerencia automática desde RN-004) y conserva trazabilidad F1→F6. |
| RN-602 | Incidente de seguridad: reloj de 72 h desde la detección para notificar a la SPDP (Art. 41). El sistema calcula `fecha_max_reporte` y alerta de forma preventiva. |
| RN-603 | Checklist inteligente parametrizado por perfil: LOPDP, ISO 27701, Videovigilancia, Salud/Datos Sensibles, Inteligencia Artificial. |
| RN-701 | Madurez global = F1·20% + F2·20% + F5·25% + F6·20% + F7·15%, normalizada a escala 1–5 (Inicial, Gestionado, Definido, Controlado, Optimizado). |
| RN-702 | Ninguna recomendación se cierra sin verificación de eficacia con evidencia hasheada en un ciclo posterior, registrada por el DPO humano. |
| RN-801 | Certificado de capacitación solo con puntaje ≥ 70%. |
| RN-901 | Pd-VaR: scoring del formulario SPDP (§11.3) que determina nivel de riesgo, caso A/B y cotización. |
| RN-902 | Independencia del DPO: registra estado y evidencias; no designa miembros, no asigna recursos, no administra planes. Toda la UI debe reflejar esta restricción. |
