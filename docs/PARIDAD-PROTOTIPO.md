# Auditoría de Paridad — Prototipo vs. Implementación

**Fecha:** 2026-09-12
**Auditor:** Claude Code (automatizado)
**Fuente de verdad:** `docs/02-ESPECIFICACION-FUNCIONAL.md`
**Alcance:** Web (`apps/web/`), API (`apps/api/`), Mobile (`apps/mobile/`), Contracts (`packages/contracts/`)

## Leyenda de estados

| Estado | Significado |
|--------|-------------|
| OK | Implementado conforme a la especificación |
| PARCIAL | Existe estructura pero faltan elementos significativos |
| FALTA | No implementado o solo placeholder |
| DIFIERE (justificado) | Se implementó diferente con razón técnica válida |

---

## 1. Shell de la Aplicación (§1)

| Componente | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| Topbar | Logo circular + `LEXDATA IA` + subtítulo SGPDP | OK | Implementado en `Topbar.tsx` |
| Topbar | Chip MARK AI con badge verde `ACTIVO` | OK | Badge verde, texto "Toca para chatear" presente |
| Topbar | Ticker de actividad del agente (6 mensajes, rotación ~6s) | OK | Los 6 mensajes literales están implementados, rotación a 6000ms |
| Topbar | Rol DPO Humano + `Control y Supervisión Estratégica` | OK | Presente en zona derecha |
| Topbar | Campana de notificaciones con badge numérico | OK | Badge hardcodeado "3" |
| Topbar | Menú de usuario | PARCIAL | Solo icono `User`, sin dropdown de opciones |
| Sidebar | Fondo `--navy-900`, ancho ~248px | OK | `w-[248px]`, `bg-navy-900` |
| Sidebar | Cabecera logo + botón colapso (chevron) | OK | `ChevronLeft`/`ChevronRight` |
| Sidebar | Bloque EMPRESA ACTIVA con `<select>` | OK | `useActiveClient` con lista de clientes |
| Sidebar | 11 items de navegación con secciones PHVA | OK | Todos los items, subtítulos y secciones presentes |
| Sidebar | Pie fijo: avatar `DA` + `Dra. Andreina Almeida` + `DPO Certificada · SPDP` | OK | Literal idéntico a la especificación |
| Cabecera módulo | Badge `CICLO · FASE n` + badges de alerta contextual | OK | `ModuleHeader` con props `ciclo`, `fase`, `badges` |
| Cabecera módulo | Línea de subtítulo con "mapa" de pestañas | OK | Prop `subtitle` en cada página |
| Cabecera módulo | Barra de pestañas horizontal con icono y contador | PARCIAL | TabBar presente pero sin iconos por pestaña; badges presentes |
| Cabecera módulo | Botón flotante `Observaciones DPO` (F2, F4, F5) | FALTA | No implementado en ninguna fase |
| MARK AI drawer | Cabecera con avatar, `MARK AI`, badge `EN LÍNEA` | OK | Implementado en `AgentChat.tsx` |
| MARK AI drawer | Saludo literal completo | OK | Texto idéntico al de la especificación |
| MARK AI drawer | Toast `Firma DPO requerida` + detalle DPA | OK | Toast con AlertTriangle, texto literal |
| MARK AI drawer | 6 chips de preguntas rápidas | OK | Los 6 chips literales presentes |
| MARK AI drawer | Input `Escribe a MARK AI…` + botón enviar | OK | Input y botón Send presentes |
| MARK AI drawer | Respuesta de referencia (Estado del RAT) | FALTA | No hay lógica de respuesta, solo UI estática |
| MARK AI drawer | Envío real de mensajes al backend | FALTA | Sin integración con Anthropic API; UI solo captura texto |

---

## 2. Dashboard PHVA (`/dashboard`) (§2)

| Pestaña | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| Visión General | Cabecera `Dashboard de Cumplimiento PHVA` + chip `Atención requerida` | OK | Implementado literalmente |
| Visión General | 5 KPI cards (ESTADO SGPDP, MADUREZ GLOBAL, CUMPLIMIENTO DOC., HALLAZGOS, RIESGOS) | OK | Los 5 KPIs con datos del seed (62%, 2.7/5, etc.) |
| Visión General | Radar `MADUREZ POR FASE PHVA` (ejes F1-F7) | FALTA | No hay componente Recharts radar; solo barras de progreso |
| Visión General | Progreso por módulo (barras con valor 1-5 y etiqueta de nivel) | PARCIAL | Barras presentes con % pero sin escala 1-5; las etiquetas de nivel están (Controlado, Gestionado, etc.) |
| Visión General | 3 tarjetas de contadores (CONTROLES 3/6, AUDITORÍAS 1, RECOMENDACIONES 0/3) | FALTA | No implementadas |
| Visión General | ACTIVIDAD RECIENTE — timeline bitácora | FALTA | No implementada |
| F1 · Normas | KPIs (28 nacionales, 8 internacionales, 36 artículos, 18 controles) | FALTA | Placeholder genérico |
| F1 · Normas | Barras distribución por fuente normativa | FALTA | Placeholder |
| F1 · Normas | Cobertura por ciclo PHVA (P 61%, H 31%, V 8%, A 0%) | FALTA | Placeholder |
| F1 · Normas | Lista resoluciones vigentes SPDP | FALTA | Placeholder |
| F2 · Riesgos | KPIs y contenido de fase | FALTA | Placeholder genérico |
| F3 · Implementación | KPIs y contenido de fase | FALTA | Placeholder genérico |
| F4 · Definición | KPIs y contenido de fase | FALTA | Placeholder genérico |
| F5 · Supervisión | KPIs y contenido de fase | FALTA | Placeholder genérico |
| F6 · Auditoría | KPIs, radar PHVA, barras valor/meta, tendencias | FALTA | Placeholder genérico (§2.3 especifica KPIs detallados) |
| F7 · Mejora | KPIs y contenido de fase | FALTA | Placeholder genérico |

---

## 3. Fase 1 · Motor de Conocimiento Normativo (`/fase-1`) (§3)

| Pestaña | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| Biblioteca Jurídica | Badge `28N · 8I` | OK | En la definición de TABS |
| Biblioteca Jurídica | Sub-toggle `Nacional` / `Internacional` | OK | Botones con contadores |
| Biblioteca Jurídica | Buscador `Búsqueda semántica…` | OK | Input con icono Search |
| Biblioteca Jurídica | Contador `28/28 normas · 0 favoritas` | PARCIAL | No hay sistema de favoritos ni historial |
| Biblioteca Jurídica | Botón `Historial (n)` | FALTA | No implementado |
| Biblioteca Jurídica | Favoritos por norma, contador de vistas | FALTA | No implementado |
| Biblioteca Jurídica | Tarjetas con badge fuente, identificador, `Vigente`, título, categoría | OK | Implementadas con datos del API |
| Biblioteca Jurídica | Panel derecho vacío con texto literal | OK | EmptyState con texto literal de la especificación |
| Biblioteca Jurídica | Panel de detalle: badges, título, resumen, texto normativo | OK | Implementado con todos los campos |
| Biblioteca Jurídica | Panel de detalle: metadatos (organismo, fecha, versión, tipo) | OK | Grid de 4 metadatos |
| Biblioteca Jurídica | Panel de detalle: bloque Hash SHA-256 + leyenda RN-004 | OK | `HashChip` + texto literal |
| Biblioteca Jurídica | Panel de detalle: módulos relacionados (RN-004) + leyenda | FALTA | No hay sección de módulos relacionados |
| Biblioteca Jurídica | Panel de detalle: controles normativos asociados | OK | Lista con badge PHVA y evidencia requerida |
| Biblioteca Jurídica | Catálogo completo: 28 nacionales + 8 internacionales | PARCIAL | Depende del seed del API; estructura OK |
| Matriz Normativa | Banner RN-004 literal | PARCIAL | Banner presente pero texto recortado vs. especificación (falta mención a F6, F2, F4, F5) |
| Matriz Normativa | Buscador + filtros PHVA | FALTA | Solo tabla, sin filtros por ciclo PHVA |
| Matriz Normativa | Tabla de 18 controles con columnas especificadas | OK | DataTable con Fuente, Control, Evidencia, Fase, Hash |
| Matriz Normativa | Pie: `18 de 18 controles · solo lectura` + sello `API Interna · RN-004` | OK | Pie implementado literalmente |
| Principios Rectores | Título `13 Principios Rectores · Art. 10 LOPDP + RGLOPDP` | OK | Implementado |
| Principios Rectores | Lista con nombre, base normativa, estado (Verificado/Pendiente/No Verificado) | OK | Con badges de estado y datos del API |
| Principios Rectores | Detalle de principio: preguntas de auditoría, hash, fecha verificación | FALTA | Solo nombre, base y definición; sin preguntas de auditoría |

---

## 4. Fase 2 · Amenazas y Vulnerabilidades (`/fase-2`) (§4)

| Pestaña | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| General | Cabecera con badge `2 EIPD obligatorias` | OK | Implementado |
| General | 10 pestañas definidas | OK | Las 10 pestañas presentes en la barra |
| Procesos | Cadena de Valor LOPDP con nodos interactivos | FALTA | Solo una tabla de tratamientos con banner normativo; no hay diagrama de cadena de valor |
| RAT | Vista `RAT Supervisado` / `Por Área` | PARCIAL | Tabla de RAT presente pero sin sub-toggle; sin contadores `0 Validados / 0 Obs.`; sin banner RN-201/RN-401 |
| RAT | Detalle: CÓDIGO RAT, BASE LEGITIMACIÓN, RETENCIÓN, DATOS SENSIBLES | FALTA | Sin panel de detalle de tratamiento |
| RAT | Bloque Resolución del DPO (Validado/Con Observaciones) | FALTA | Sin botones de resolución DPO |
| Activos | Tarjetas con nombre, tipo, criticidad, responsable, ubicación, sistemas, flag datos personales | PARCIAL | DataTable con columnas basicas; sin formato de tarjetas; sin campos responsable, sistemas, flag |
| Categorías | 2 banners normativos literales (Res. 0005-2026, Art. 25) | FALTA | Placeholder genérico |
| Categorías | 7 categorías con base normativa, nivel y flag ACTIVO | FALTA | Placeholder |
| Riesgos | Gauge `Indicador de Riesgo Proyectado 63%` | FALTA | Placeholder genérico |
| Riesgos | Barras probabilidad por riesgo | FALTA | Placeholder |
| Riesgos | Evaluación DPO — Riesgo Residual | FALTA | Placeholder |
| Riesgos | Toggle `Perfil de Amenazas` / `Vulnerabilidades` con catálogo | FALTA | Placeholder |
| EIPD/LIA | Sub-pestañas EIPD / LIA / RAT Supervisado | FALTA | Placeholder |
| EIPD/LIA | Matriz EIPD — Decisión automática LOPDP Art. 39 | FALTA | Placeholder |
| Matriz | Tabla 5 riesgos consolidados (RN-201) | FALTA | Placeholder |
| Mapa de Calor | Matriz 5x5 impacto x probabilidad con conteo | OK | Implementado con grid de colores y datos del API |
| Mapa de Calor | Panel `Riesgos identificados (5)` con tarjetas | FALTA | Solo la matriz, sin panel lateral de riesgos |
| Mapa de Calor | Nota RN-201 literal | FALTA | Sin texto RN-201 |
| Brechas | Gauge cumplimiento ponderado + tabla por categoría | FALTA | Placeholder |
| Reportes | Reporte ejecutivo con 6 contadores + ranking | FALTA | Placeholder |

---

## 5. Fase 3 · Implementación Inicial (`/fase-3`) (§5)

| Pestaña | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| General | Cabecera sin badges extra (correcto) | OK | |
| General | 8 pestañas | OK | Las 8 pestañas presentes |
| Diagnóstico | Wizard de 5 dimensiones con 17 preguntas | PARCIAL | Muestra dimensiones con barras de progreso pero no tiene el wizard interactivo con preguntas |
| Diagnóstico | Preguntas con botones `Cumple / Parcial / No Cumple` | FALTA | Sin sistema de preguntas interactivo |
| Diagnóstico | Botón `Nueva pregunta (DPO)` | FALTA | No implementado |
| Diagnóstico | Preguntas literales de la dimensión 1 | FALTA | Sin preguntas |
| Gobierno | Banner de independencia literal | FALTA | Banner genérico, no el literal de la especificación |
| Gobierno | 4 elementos verificables con artículos | PARCIAL | DataTable genérica de órganos, sin los 4 elementos específicos de la especificación |
| Roles | Nota literal sobre roles + alerta DPO sin Acta | FALTA | DataTable sin notas normativas ni alerta de acta |
| Roles | 5 roles con estado + campo HASH ACTA + botón Generar | FALTA | Solo tabla de personas con rol, sin hash de acta ni botón generar |
| Recursos | Banner de restricción/conflicto de interés | FALTA | Placeholder genérico |
| Recursos | 5 bloques con checklist | FALTA | Placeholder |
| Evidencias | Bóveda SHA-256 con formulario de carga | FALTA | Placeholder |
| Evidencias | Lista con hash, tipo, dimensión, fecha | FALTA | Placeholder |
| Brechas | Gap Analysis — 10 brechas con código GAP-SIS | FALTA | Placeholder |
| Recomendaciones | Banner de bloqueo literal + tarjetas | FALTA | Placeholder |
| Informe | Informe ejecutivo con radar de 6 dominios | FALTA | Placeholder |

---

## 6. Fase 4 · Definición (`/fase-4`) (§6)

| Pestaña | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| General | Badge `1 tratamiento bloqueado` | OK | Implementado |
| General | 9 pestañas | OK | Las 9 pestañas presentes |
| Controles | Tarjetas con tipo, estado, título, plazo, prioridad | PARCIAL | DataTable con columnas de controles, pero sin formato de tarjeta; sin datos seed específicos (MFA, SCCs, etc.) |
| Controles | Botón `Nuevo` + 4 controles seed | FALTA | Sin botón Nuevo, sin datos seed explícitos |
| Medidas Técnicas | Filtros por subcategoría + 7 ítems con base normativa | PARCIAL | DataTable filtrada por `TECNICA` pero sin filtros de subcategoría; sin los 7 ítems literales |
| Medidas Organizativas | Banner de conflicto de interés + 5 ítems con responsable | PARCIAL | DataTable filtrada por `ORGANIZATIVA` pero sin banner literal ni ítems seed |
| Medidas Jurídicas | DPAs, confidencialidad, LIA, plantillas | FALTA | Placeholder |
| Evaluación (RN-401) | Banner de validación DPO + validación de principios por tratamiento | FALTA | Placeholder |
| Evaluación (RN-401) | Bloque suficiencia/proporcionalidad por control | FALTA | Placeholder |
| Hallazgos de diseño | 3 hallazgos HD-00x con severidad | FALTA | Placeholder |
| Planes de Acción | Banner compromisos gerenciales + 4 contadores | FALTA | Placeholder |
| Evidencias y Reporte | Bóveda SHA-256 + reporte alineación | FALTA | Placeholder |

---

## 7. Fase 5 · Supervisión (`/fase-5`) (§7)

| Pestaña | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| General | Badges `1 hallazgo abierto`, `2 controles sin evidencia` | OK | Implementados |
| General | 10 pestañas | OK | Presentes |
| Controles Implementados | Filtros `Todos / Técnico / Organizativo / Legal` + 6 controles seed | PARCIAL | DataTable sin filtros, lista de controles de la API |
| Controles Implementados | Tarjetas con tipo, estado, título, base normativa | PARCIAL | DataTable funcional pero sin formato de tarjeta |
| Medidas Técnicas | Estado de ejecución real | PARCIAL | Tabla filtrada sin detalles de ejecución |
| Medidas Organizativas | Estado de ejecución real | FALTA | Placeholder |
| Medidas Jurídicas | Estado de ejecución real | FALTA | Placeholder |
| Evidencias | Bóveda operativa SHA-256 con formulario | FALTA | Placeholder |
| Evaluación eficacia | Calibración en 3 ejes (RN-501) | FALTA | Placeholder |
| Hallazgos operativos | 3 hallazgos H-00x con tipo NCM/NCm/OBS | FALTA | Placeholder |
| Recomendaciones | Lista de recomendaciones activas | FALTA | Placeholder |
| Planes de Acción | Planes con estado y hash | FALTA | Placeholder |
| Reportes | Exportación PDF ciclo Hacer | FALTA | Placeholder |

---

## 8. Fase 6 · Auditoría (`/fase-6`) (§8)

| Pestaña | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| General | Badges `1 hallazgo abierto`, `1 incidente activo` | OK | Implementados |
| General | 9 pestañas | OK | Presentes |
| Centro de Monitoreo | 4 KPIs (50% impl., 2 NC Mayores, 1 incidente, 2 sin evidencia) | PARCIAL | KPIs genéricos del API, sin los valores seed específicos |
| Centro de Monitoreo | 8 tarjetas de acceso con badge de estado | FALTA | Solo 6 bloques info; sin tarjetas de acceso interactivas |
| Centro de Monitoreo | Hallazgos recientes con trazabilidad F1-F6 | FALTA | Sin sección de hallazgos recientes |
| Auditorías | 3 auditorías (AUD-2026-01, etc.) + botón Nueva | PARCIAL | DataTable funcional con datos del API; sin botón `Nueva` |
| Revisiones | Bitácora de verificaciones (2 No Conformes) | FALTA | Placeholder |
| Checklist Inteligente | Motor diferenciador con 5 perfiles + 8 preguntas LOPDP | FALTA | Placeholder |
| Hallazgos | Lista con tipo, artículo, estado, trazabilidad | FALTA | Placeholder |
| Indicadores | 9 KPIs + radar madurez + barras rendimiento | FALTA | Placeholder |
| Indicadores | Alerta preventiva incidentes + banner Art. 41 | FALTA | Placeholder |
| Indicadores | Bloque incidentes con plazos 72h | FALTA | Placeholder |
| Incidentes | Brechas de seguridad 72h + tarjetas | PARCIAL | DataTable con código, severidad, detección, estado, notificado; sin reloj 72h visual |
| Incidentes | Tipo (Confidencialidad/Integridad/Disponibilidad) | PARCIAL | Campo `severidad` en vez de tipo CIA |
| Evidencias | Bóveda de evidencias F6 | FALTA | Placeholder |
| Reportes | 5 informes con botón `Generar PDF` | FALTA | Placeholder |

---

## 9. Fase 7 · Mejora Continua (`/fase-7`) (§9)

| Pestaña | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| General | Badges `Madurez 2.7/5 — Definido`, `3 recomendaciones activas` | OK | Implementados |
| General | 9 pestañas | OK | Presentes |
| Seguimiento | Expediente de mejora F1-F7 con trazabilidad | PARCIAL | Bloques PHVA con % pero sin el expediente con cadena F1->F2->F6->F7 |
| Seguimiento | Panel lateral `Trazabilidad total del SGPDP` | FALTA | Sin panel de trazabilidad |
| Seguimiento | Madurez por dimensión con barras | OK | Dimensiones con barras de progreso |
| Nivel de Madurez | Tarjeta grande nivel 3 + etiqueta `Definido` + valor 2.71/5.00 | FALTA | Placeholder |
| Nivel de Madurez | Radar por fase F1-F7 | FALTA | Sin radar Recharts |
| Nivel de Madurez | Escala 1-5 con descripciones + algoritmo RN-701 | FALTA | Placeholder |
| Nivel de Madurez | Detalle por fase (F1 80%, F2 40%, etc.) | FALTA | Placeholder |
| Recomendaciones | 3 recomendaciones con código REC-2026-00x | OK | DataTable con código, título, origen, prioridad, responsable, estado |
| Lecciones | Lista con tipo y estado | OK | Implementado con datos del API |
| Lecciones | Oportunidades de mejora detectadas automáticamente | FALTA | Sin bloque de oportunidades automáticas |
| Acciones Correctivas | Planes de acción correctiva | FALTA | Placeholder |
| Verificación | Verificación de eficacia con hash | FALTA | Placeholder |
| KPIs | Indicadores del ciclo mejora | FALTA | Placeholder |
| Tendencias | Evolución temporal | FALTA | Placeholder |
| Reportes | Informes de mejora exportables | FALTA | Placeholder |

---

## 10. Capacitaciones (`/capacitaciones`) (§12)

| Pestaña | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| General | Badges `10/12 evaluaciones aprobadas`, `8 módulos disponibles` | OK | Implementados |
| General | 3 pestañas: E-Learning, Central, Informe DPO | OK | Presentes |
| E-Learning | Título `Biblioteca de Capacitaciones LOPDP` + texto explicativo | PARCIAL | Banner normativo Art. 47, no el título exacto |
| E-Learning | 8 módulos con nivel, categoría, base, duración | PARCIAL | 8 módulos presentes pero con nombres y duración diferentes a la especificación |
| E-Learning | Cada módulo: 10 preguntas, certificado virtual | FALTA | Sin sistema de evaluación interactivo |
| E-Learning | Certificado solo con >= 70% (RN-801) | FALTA | Sin motor de evaluación ni generación de certificados |
| Central | KPIs: 12 evaluaciones, 83% aprobación, 82% puntaje, 0 sin capacitar | PARCIAL | La Central muestra un repositorio de documentos en vez del registro de evaluaciones con KPIs |
| Central | Registro de evaluaciones con avatar, nombre, módulo, puntaje | FALTA | Sin registro de evaluaciones |
| Central | Avance por módulo `n/m aprob. · %` | FALTA | Solo tarjetas de documentos |
| Informe DPO | 3 informes con `Generar PDF` | PARCIAL | Estadísticas presentes pero sin botones `Generar PDF` |
| Informe DPO | Informes: Mensual, Cumplimiento LOPDP, Actas Individuales | FALTA | Sin los 3 informes específicos |

---

## 11. Portal del Cliente (`/portal-cliente`) (§10)

| Pestaña | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| General | Cabecera `Diagnóstico PIMS · LOPDP Ecuador` | OK | Implementado |
| General | 4 pestañas: Diagnóstico PIMS, Mi Empresa, Mis Documentos, Asistente | OK | Presentes |
| Diagnóstico PIMS | 11 módulos (0-10) con nombre, base normativa | DIFIERE (justificado) | Se implementó con 10 dimensiones PIMS genéricas en vez de los 11 módulos específicos; la estructura de evaluación es diferente |
| Diagnóstico PIMS | Barra `Progreso 0/11` | FALTA | Sin barra de progreso de módulos |
| Diagnóstico PIMS | Cada módulo: 3 preguntas con respuestas `Sí/En proceso/No` | FALTA | Solo barras de madurez por dimensión, sin preguntas |
| Diagnóstico PIMS | Preguntas literales módulo 0 | FALTA | Sin preguntas literales |
| Diagnóstico PIMS | Navegación `Anterior / Siguiente` entre módulos | FALTA | Sin wizard de navegación |
| Mi Empresa | Datos del tenant (razón social, RUC, sector, ciudad) | OK | Grid con 6 campos del resumen |
| Mi Empresa | Nivel de riesgo y madurez SGPDP | OK | Badge de riesgo y valor madurez |
| Mis Documentos | Lista de documentos con trazabilidad y hash | PARCIAL | Lista de documentos con título, tipo, fase, estado; sin hash de integridad visible |
| Asistente | Chat de consulta con MARK AI | PARCIAL | UI presente pero deshabilitada ("Asistente en implementación") |

---

## 12. Formulario SPDP (`/registro`) (§11)

| Paso | Elemento de la especificación | Estado | Nota |
|---|---|---|---|
| General | Cabecera `FORMULARIO DE REGISTRO LOPDP` | OK | Implementado |
| General | Stepper visual de 8 pasos con iconos | DIFIERE (justificado) | 8 pasos presentes pero con nombres diferentes a la especificación (Empresa/Responsable/Tratamientos vs. Identificación/S1-S7) |
| General | Pie fijo: tarjeta Dra. Andreina Almeida | FALTA | Sin pie fijo con tarjeta de la DPO |
| Paso 1 Identificación | Banner literal datos SRI | PARCIAL | Banner diferente (Art. 37 en vez del texto SRI); tiene razón social, RUC pero no CIIU |
| Paso 1 Identificación | Campos: RAZÓN SOCIAL, RUC (13 dígitos), SITIO WEB, CIIU | PARCIAL | Tiene razón social, RUC pero faltan sitio web y CIIU; validación dígito verificador no implementada |
| Paso 1 Identificación | Representante Legal: nombre, cédula con validación | FALTA | El paso 2 tiene "Responsable/DPO" en vez de "Representante Legal"; sin cédula con validación |
| Paso 1 Identificación | Ubicación: 24 provincias del Ecuador | FALTA | Solo campo "Ciudad" libre, sin listado de provincias |
| S1 Perfil | sector, trabajadores, sucursales (opciones exactas) | PARCIAL | Sector y empleados presentes pero con opciones diferentes a la especificación |
| S2 Volumen | volumenRegistros, categoríasTitulares (multi-select) | PARCIAL | Volumen presente; categorías implementadas como tipos de datos |
| S3 Datos | 10 flags de datos sensibles + textarea | FALTA | Placeholder genérico (paso 4-7) |
| S4 Tecnología | usaIA, decisiones automáticas, perfilamiento, transfers, cloud | FALTA | Placeholder |
| S5 Madurez | tieneRAT, tieneEIPD, tieneLIA, tienePoliticas, tieneDPO | FALTA | Placeholder |
| S6 Operativa | solicitudesARCO, incidentesAnuales, canal, responsable | FALTA | Placeholder |
| S7 Gobernanza | compromisoDirectivo, comité, antecedentes, sanciones | FALTA | Placeholder |
| Resultado Pd-VaR | Tarjeta `Índice Pd-VaR` con score, nivel, breakdown | FALTA | Sin pantalla de resultados Pd-VaR en la web |
| Resultado Pd-VaR | Caso A/B con próximos pasos diferenciados | FALTA | Sin lógica de caso A/B en la UI |
| Resultado Pd-VaR | Honorarios y desglose de factores | FALTA | Sin visualización de cotización |

---

## 13. Motor Pd-VaR (§11.3) — `packages/contracts/`

| Elemento | Estado | Nota |
|---|---|---|
| Schema Zod `PdVarInputSchema` con todos los campos | OK | 35 campos exactos de la especificación |
| Factores de scoring (tabla completa) | OK | Todos los factores implementados con etiquetas y puntajes exactos |
| Fórmula `pdScore = min(100, round(total/85*100))` | OK | Implementada literalmente |
| Niveles de riesgo (Crítico >= 65, Alto >= 40, Medio >= 20, Bajo) | OK | Implementados |
| Caso A/B (micro-empresa sin gatillos de alto riesgo) | OK | Lógica implementada |
| Cálculo de honorarios (base por tamaño x factor riesgo + suplementos) | OK | Implementado con redondeo a múltiplos de 50 |
| `implementacionFee = 5400` | OK | Hardcodeado |
| Tests unitarios del motor | FALTA | Sin tests para `pd-var.ts` |

---

## 14. Motores de dominio — `packages/contracts/src/engines/`

| Motor | Estado | Nota |
|---|---|---|
| `pdVar.ts` | OK | Scoring completo |
| `madurez.ts` | PARCIAL | Existe pero hay que verificar el algoritmo RN-701 (F1*20% + F2*20% + F5*25% + F6*20% + F7*15%) |
| `riesgoMatriz.ts` | PARCIAL | Existe; pendiente verificar score = impacto x probabilidad |
| `riesgoPerfil.ts` | PARCIAL | Existe |
| `eipd.ts` | PARCIAL | Existe; pendiente verificar criterios MTGE |
| `brechaControles.ts` | PARCIAL | Existe |
| `plazos.ts` | PARCIAL | Existe; pendiente verificar reloj 72h |
| Tests unitarios de motores | FALTA | Directorio `__tests__` existe pero vacío o sin cobertura completa |

---

## 15. API Backend (`apps/api/`) (§ transversal)

| Módulo API | Paridad con especificación | Estado | Nota |
|---|---|---|---|
| `corpus` | Normas, controles, principios | OK | CRUD y consultas implementados |
| `fase2` | Tratamientos, activos, riesgos, EIPD, mapa calor | PARCIAL | Endpoints existen pero faltan: cadena de valor, categorías de datos, reportes |
| `fase3` | Diagnóstico, gobierno, roles, recursos, brechas | PARCIAL | Endpoints existen pero faltan: wizard de preguntas, evidencias SHA-256, recomendaciones |
| `fase4` | Controles, medidas, evaluación | PARCIAL | Endpoints básicos; faltan: hallazgos diseño, planes acción, evaluación RN-401 |
| `fase5` | Controles implementados, supervisión | PARCIAL | Endpoints básicos; faltan: calibración eficacia, hallazgos operativos |
| `fase6` | Monitoreo, auditorías, incidentes | PARCIAL | Endpoints existen; faltan: checklist inteligente, indicadores completos, revisiones |
| `fase7` | Madurez, recomendaciones, lecciones | PARCIAL | Endpoints existen; faltan: acciones correctivas, verificación eficacia, oportunidades |
| `capacitaciones` | Módulos, evaluaciones, certificados | PARCIAL | Endpoints básicos; falta motor de evaluación y generación de certificados |
| `reportes` | 16 informes PDF | FALTA | Service es un stub (`TODO: enqueue PDF generation`) |
| `evidencias` | Bóveda SHA-256, append-only | PARCIAL | Módulo existe pero falta verificar: hash al cargar, prev_hash, retención 5 años |
| `portal` | Portal del cliente | PARCIAL | Endpoints básicos |
| `agente` | MARK AI | PARCIAL | Módulo existe; falta integración real con Anthropic API |
| `audit` | Audit log con cadena de hash | PARCIAL | Módulo existe; falta verificar actor_type y cadena hash |

---

## 16. App Mobile (`apps/mobile/`) (§ transversal)

| Feature | Estado | Nota |
|---|---|---|
| Auth (login, MFA, biometric, PIN) | PARCIAL | Screens existen pero providers están vacíos |
| Dashboard | PARCIAL | `dashboard_screen.dart` existe |
| Normas | PARCIAL | `normas_screen.dart` existe |
| Riesgos | FALTA | Directorio existe pero sin `presentation` screen |
| Hallazgos | FALTA | Directorio existe pero sin screen |
| Incidentes | PARCIAL | `incidentes_screen.dart` existe |
| Evidencias | PARCIAL | `evidencias_screen.dart` existe |
| Capacitaciones | PARCIAL | `capacitaciones_screen.dart` existe |
| Aprobaciones | PARCIAL | `aprobaciones_screen.dart` existe |
| Agente (MARK AI) | PARCIAL | `agente_screen.dart` existe |
| Portal Cliente | PARCIAL | `portal_cliente_screen.dart` existe |

---

## 17. Generación de PDFs (§ transversal)

| Informe | Módulo | Estado |
|---|---|---|
| Estado General del SGPDP | F6 | FALTA |
| Informe de Auditoría | F6 | FALTA |
| Reporte de Hallazgos e Incidentes | F6 | FALTA |
| Dashboard de Indicadores | F6 | FALTA |
| Reporte PHVA y de Riesgos | F6 | FALTA |
| Informe de Implementación (F3) | F3 | FALTA |
| Reporte Alineación Normativa (F4) | F4 | FALTA |
| Reporte Ejecutivo de Riesgos (F2) | F2 | FALTA |
| Reportes F5 | F5 | FALTA |
| Reportes F7 | F7 | FALTA |
| Informe Mensual de Capacitaciones | Cap. | FALTA |
| Informe Cumplimiento LOPDP | Cap. | FALTA |
| Actas Individuales de Capacitación | Cap. | FALTA |
| EIPD — salida PDF (F2) | F2 | FALTA |
| LIA — salida Excel (F2) | F2 | FALTA |
| Certificados de capacitación | Cap. | FALTA |

**Veredicto:** 0/16 informes implementados. El servicio de reportes es un stub. No hay integración con Playwright/Chromium.

---

## 18. Textos Legales Literales (§ transversal)

| Texto | Ubicación | Estado | Nota |
|---|---|---|---|
| Banner RN-004 Matriz Normativa | F1 Matriz | PARCIAL | Texto recortado, falta mención F6, F2, F4 |
| Banner RN-201/RN-401 RAT | F2 RAT | FALTA | No implementado |
| Banner independencia DPO (F3) | F3 Gobierno | FALTA | Banner genérico |
| Banner restricción conflicto interés (F3 Recursos) | F3 Recursos | FALTA | Placeholder |
| Banner bloqueo recomendaciones (F3) | F3 Recomend. | FALTA | Placeholder |
| Banner validación DPO (F4 Evaluación) | F4 Evaluación | FALTA | Placeholder |
| Banner gobernanza conflicto interés (F4 Org.) | F4 Org. | FALTA | Placeholder |
| Banner compromisos gerenciales (F4 Planes) | F4 Planes | FALTA | Placeholder |
| Banner calibración eficacia (F5 Evaluación) | F5 Evaluación | FALTA | Placeholder |
| Banners categorías de datos (Res. 0005-2026, Art. 25) | F2 Categorías | FALTA | Placeholder |
| Texto hash integridad normativa (RN-004) | F1 Biblioteca | OK | Literal idéntico |
| Saludo MARK AI | AgentChat | OK | Literal idéntico |
| Ticker mensajes | Topbar | OK | Los 6 mensajes literales |

---

## Resumen Ejecutivo

| Sección | OK | PARCIAL | FALTA | Total items |
|---|---|---|---|---|
| Shell (§1) | 14 | 3 | 4 | 21 |
| Dashboard (§2) | 2 | 1 | 13 | 16 |
| Fase 1 (§3) | 10 | 3 | 5 | 18 |
| Fase 2 (§4) | 3 | 2 | 16 | 21 |
| Fase 3 (§5) | 2 | 2 | 12 | 16 |
| Fase 4 (§6) | 2 | 3 | 7 | 12 |
| Fase 5 (§7) | 2 | 3 | 8 | 13 |
| Fase 6 (§8) | 2 | 3 | 9 | 14 |
| Fase 7 (§9) | 3 | 1 | 9 | 13 |
| Capacitaciones (§12) | 2 | 3 | 5 | 10 |
| Portal Cliente (§10) | 3 | 2 | 5 | 10 |
| Formulario SPDP (§11) | 1 | 4 | 9 | 14 |
| Motor Pd-VaR | 7 | 0 | 1 | 8 |
| Motores dominio | 1 | 6 | 1 | 8 |
| API Backend | 1 | 11 | 1 | 13 |
| Mobile | 0 | 8 | 2 | 10 |
| PDFs | 0 | 0 | 16 | 16 |
| Textos legales | 3 | 1 | 9 | 13 |
| **TOTAL** | **58** | **56** | **132** | **246** |

**Tasa de completitud real: ~24% OK, ~23% PARCIAL, ~53% FALTA**

La implementación tiene una estructura sólida (shell, navegación, componentes base, motor Pd-VaR) pero la mayoría de las pestañas internas de cada fase son placeholders. Los mayores huecos son: pestañas de dashboard por fase, contenido detallado de F2-F7, wizard del diagnóstico (F3), wizard del formulario SPDP (pasos 4-7), generación de PDFs y la integración real de MARK AI.
