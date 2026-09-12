# Backlog de Implementación — LEXDATA IA

**Fecha:** 2026-09-12
**Origen:** Auditoría de paridad `docs/PARIDAD-PROTOTIPO.md`
**Fuente de verdad:** `docs/02-ESPECIFICACION-FUNCIONAL.md`

---

## P0 — Bloqueantes para MVP

Elementos sin los cuales el producto no es demostrable ante un cliente o la SPDP.

| # | Módulo | Tarea | Descripción | Estimación |
|---|---|---|---|---|
| 1 | F2 | Completar pestaña Categorías de Datos | Implementar las 7 categorías con base normativa, nivel, flag ACTIVO. Incluir los 2 banners literales (Res. 0005-2026, Art. 25 LOPDP). | 3h |
| 2 | F2 | Completar pestaña Riesgos | Gauge de riesgo proyectado (63%), barras de probabilidad por riesgo, evaluación DPO de riesgo residual, toggle Amenazas/Vulnerabilidades con catálogo completo. | 6h |
| 3 | F2 | Completar pestaña EIPD/LIA | Sub-pestañas EIPD/LIA/RAT, tabla de decisión automática EIPD (puntaje MTGE), integrar motor `eipd.ts`. | 5h |
| 4 | F2 | Completar pestaña Matriz Consolidada (RN-201) | Tabla de 5 riesgos con datos seed, botón expediente digital, pie `0 de 5 riesgos revisados por el DPO`. | 3h |
| 5 | F2 | Completar pestaña Brechas de Controles | Gauge cumplimiento ponderado, contadores necesarios/implementados/faltantes, tabla por categoría (Técnicos, Organizativos, Jurídicos, Documentales). | 4h |
| 6 | F2 | Completar pestaña RAT Supervisado | Banner RN-201/RN-401 literal, contadores Validados/Obs., panel de detalle por tratamiento (código, base, retención, datos sensibles), bloque resolución DPO. | 5h |
| 7 | F3 | Wizard de Diagnóstico con 17 preguntas | Implementar wizard de 5 dimensiones, 17 preguntas con texto literal, botones Cumple/Parcial/No Cumple, botón Nueva pregunta (DPO), navegación entre dimensiones. | 8h |
| 8 | F3 | Pestaña Gobierno con textos literales | Banner de independencia DPO literal, 4 elementos verificables con artículos, estados de verificación. | 3h |
| 9 | F3 | Pestaña Roles y Responsabilidades | 5 roles con estado, nota literal sobre actas, alerta DPO sin acta, campo HASH + botón Generar. | 4h |
| 10 | F3 | Pestaña Evidencias — Bóveda SHA-256 | Formulario de carga (nombre, tipo, dimensión, archivo), botón `Registrar con SHA-256`, lista con hash y sello inmutable. | 5h |
| 11 | F3 | Pestaña Brechas — Gap Analysis | 10 brechas con código GAP-SIS-0xx, severidad, descripción, dominio. Panel de detalle. | 4h |
| 12 | F3 | Pestaña Recomendaciones | Banner de bloqueo literal, tarjetas con prioridad, dominio, estado, botón verificar eficacia. | 4h |
| 13 | F4 | Pestaña Medidas Jurídicas | 5 ítems (DPA AWS, DPA Salesforce, Confidencialidad, LIA, SCCs) con tipo y estado. | 3h |
| 14 | F4 | Pestaña Evaluación (RN-401) | Banner validación DPO, bloque validación principios por tratamiento (Válido/Inconsistencia/Bloqueado), bloque suficiencia/proporcionalidad. | 6h |
| 15 | F4 | Pestaña Hallazgos de Diseño | 3 hallazgos HD-00x con severidad, estado, documento afectado, botón Nuevo. | 3h |
| 16 | F5 | Pestaña Evidencias operativa SHA-256 | Formulario con formato/tipo, control asociado, botón Cargar + SHA-256, filtro por control. | 5h |
| 17 | F5 | Pestaña Evaluación de Eficacia (RN-501) | Banner calibración, contadores evaluados/pendientes, lista de 6 controles con escala eficacia y confianza. | 4h |
| 18 | F5 | Pestaña Hallazgos Operativos | 3 hallazgos H-00x con tipo NCM/NCm/OBS/OM/BP, estado, botón Nuevo. | 3h |
| 19 | F6 | Pestaña Checklist Inteligente (RN-603) | Motor diferenciador: 5 perfiles parametrizables (LOPDP, ISO, Videovig., Salud, IA), 8 preguntas por perfil con artículo y respuesta. | 8h |
| 20 | F6 | Pestaña Indicadores completa | 9 KPIs, alerta preventiva, banner Art. 41, bloque incidentes con plazos 72h, barras rendimiento, radar madurez. | 6h |
| 21 | F6 | Pestaña Hallazgos con trazabilidad | Lista de hallazgos con tipo (NC Mayor/Menor/Observación), artículo LOPDP, estado, trazabilidad F1-F6 (RN-601). | 4h |
| 22 | F6 | Pestaña Centro de Monitoreo completa | 8 tarjetas de acceso con badge, sección hallazgos recientes con trazabilidad, valores seed (50%, 2 NC, 1 incidente). | 5h |
| 23 | Formulario | Completar pasos S3 a S7 del wizard | Implementar los 5 pasos placeholder: S3 Datos (10 flags sensibles), S4 Tecnología (5 flags), S5 Madurez (5 flags), S6 Operativa (4 campos), S7 Gobernanza (6 campos). | 6h |
| 24 | Formulario | Pantalla de resultados Pd-VaR | Integrar motor Pd-VaR del contrato, mostrar tarjeta Índice con score/nivel, breakdown de factores, cotización, caso A/B con próximos pasos diferenciados. | 5h |
| 25 | MARK AI | Integración real con Anthropic API | Conectar AgentChat al backend `agente`, enviar mensajes y recibir respuestas, mostrar respuesta de referencia con cifras del tenant. | 8h |

**Subtotal P0: 25 tareas, ~132h estimadas**

---

## P1 — Requeridos para lanzamiento

Funcionalidad necesaria para que el producto sea completo ante un auditor o la SPDP.

| # | Módulo | Tarea | Descripción | Estimación |
|---|---|---|---|---|
| 26 | Dashboard | Radar PHVA con Recharts | Componente radar con ejes F1-F7 (escala 0-5) usando Recharts, alimentado por madurez del tenant. | 3h |
| 27 | Dashboard | 3 tarjetas de contadores | CONTROLES IMPLEMENTADOS 3/6, AUDITORÍAS COMPLETADAS 1, RECOMENDACIONES CERRADAS 0/3. | 2h |
| 28 | Dashboard | Timeline de actividad reciente | ACTIVIDAD RECIENTE — BITÁCORA DEL SISTEMA: 5+ eventos con tipo, detalle y fecha. | 3h |
| 29 | Dashboard | Sub-pestaña F1 · Normas | KPIs (28/8/36/18), barras distribución por fuente, cobertura PHVA, resoluciones vigentes. | 4h |
| 30 | Dashboard | Sub-pestañas F2-F5, F7 | KPIs y gráfico principal para cada fase (patron KPIs -> gráfico -> detalle). | 10h |
| 31 | Dashboard | Sub-pestaña F6 · Auditoría completa | KPIs (2.7/5, 62%, 1/1, 3), radar PHVA, barras valor/meta (6 KPIs), tendencias Feb-Jul. | 5h |
| 32 | F1 | Favoritos y historial de búsqueda | Sistema de favoritos por norma con persistencia, botón Historial(n), contador de vistas. | 4h |
| 33 | F1 | Módulos relacionados (RN-004) en detalle | Sección "Módulos relacionados" con links a F2, F4, F5 y leyenda literal. | 2h |
| 34 | F1 | Filtros PHVA en Matriz Normativa | Buscador + filtros Todas/Planificar/Hacer/Verificar/Actuar. | 2h |
| 35 | F1 | Banner Matriz completo | Incluir texto completo con mención a F6, F2, F4, F5 como en la especificación. | 1h |
| 36 | F1 | Detalle de principios con preguntas de auditoría | Hash, fecha verificación, preguntas de auditoría numeradas por principio. | 4h |
| 37 | F2 | Cadena de Valor LOPDP interactiva | Diagrama con 5 nodos (Planificación, Diagnóstico, Análisis, Tratamiento, Derechos) con estado, panel lateral. | 6h |
| 38 | F2 | Centro de Reportes F2 | Reporte ejecutivo con 6 contadores, ranking tratamientos por exposición, botón Generar. | 4h |
| 39 | F2 | Panel lateral Mapa de Calor | Panel `Riesgos identificados (5)` con tarjetas nivel/badge EIPD/score, nota RN-201 literal. | 3h |
| 40 | F3 | Pestaña Recursos | Banner restricción/conflicto de interés literal, 5 bloques con checklist y estado. | 4h |
| 41 | F3 | Informe Ejecutivo | Radar 6 dominios (Recharts), KPIs (3.0/5, 60%, 1.8), fortalezas/debilidades, recomendaciones críticas. | 5h |
| 42 | F4 | Controles con formato tarjeta y seed | 4 tarjetas con tipo, estado, título, plazo, prioridad. Botón Nuevo. Seed: MFA, Capacitación, SCCs, Exportación CRM. | 3h |
| 43 | F4 | Medidas Técnicas con filtros y datos literales | Filtros por subcategoría, 7 ítems literales con base normativa (Art. 30, NIST, ISO). | 3h |
| 44 | F4 | Medidas Organizativas con banner literal | Banner conflicto interés Art. 42, 5 ítems con categoría, estado, responsable. | 3h |
| 45 | F4 | Planes de Acción | Banner compromisos gerenciales, 4 contadores por estado, planes con brecha ref., responsable, plazo, hash. | 4h |
| 46 | F5 | Filtros en Controles Implementados | Filtros Todos/Técnico/Organizativo/Legal, 6 controles seed con base normativa. | 2h |
| 47 | F5 | Pestañas restantes (Org., Jurídicas, Recom., Planes, Reportes) | Contenido detallado para las 5 pestañas placeholder restantes. | 8h |
| 48 | F6 | Pestaña Auditorías con botón Nueva | Botón Nueva auditoría, datos seed (AUD-2026-01, AUD-2026-02, AUD-2026-EXT). | 2h |
| 49 | F6 | Pestaña Revisiones | Bitácora de verificaciones puntuales del DPO (2 No Conformes en seed). | 3h |
| 50 | F6 | Pestaña Incidentes mejorada | Tipo CIA (Confidencialidad/Integridad/Disponibilidad), reloj visual 72h, sello SPDP. | 3h |
| 51 | F6 | Pestaña Evidencias F6 | Bóveda de evidencias de auditoría con hash y trazabilidad. | 3h |
| 52 | F7 | Pestaña Nivel de Madurez completa | Tarjeta grande nivel 3, radar F1-F7 (Recharts), escala 1-5 con descripciones, detalle por fase, algoritmo RN-701. | 6h |
| 53 | F7 | Pestaña Seguimiento con trazabilidad F1-F7 | Expediente de mejora con cadena F1->F2->F6->F7, panel lateral trazabilidad total. | 4h |
| 54 | F7 | Pestañas restantes (Acciones, Verificación, KPIs, Tendencias, Reportes) | Contenido para las 5 pestañas placeholder. | 8h |
| 55 | F7 | Oportunidades de mejora automáticas | Bloque "El sistema analizó las 7 fases" con oportunidades detectadas, tipo, impacto, diagnóstico, acción propuesta. | 4h |
| 56 | Capacitaciones | 8 módulos con contenido literal | Reemplazar los 8 módulos actuales con los literales de la especificación (nombres, niveles, categorías, bases, duraciones). | 2h |
| 57 | Capacitaciones | Central con registro de evaluaciones | KPIs (12 eval., 83%, 82%, 0 sin capacitar), tabla con avatar/nombre/módulo/puntaje/fecha, avance por módulo. | 5h |
| 58 | Capacitaciones | Informe DPO con 3 reportes | 3 informes específicos con botón Generar PDF (Mensual, Cumplimiento, Actas). | 3h |
| 59 | Portal Cliente | Diagnóstico PIMS con 11 módulos y preguntas | Reemplazar las 10 dimensiones con los 11 módulos literales (0-10), barra Progreso 0/11, 3 preguntas por módulo con respuestas. | 8h |
| 60 | Formulario | Paso 1 completo según especificación | Reestructurar: RAZÓN SOCIAL, RUC (validación 13 dígitos), SITIO WEB, CIIU, Representante Legal (nombre + cédula con validación dígito verificador), 24 provincias Ecuador. | 4h |
| 61 | Formulario | Pie fijo tarjeta DPO | Tarjeta de la Dra. Andreina Almeida con texto confidencialidad. | 1h |
| 62 | Textos legales | Implementar todos los banners literales faltantes | 10+ banners normativos con textos exactos de la especificación en F2-F7. | 3h |
| 63 | Observaciones DPO | Botón flotante Observaciones DPO | Implementar en F2, F4 y F5: botón flotante inferior derecho que abre panel de notas por entidad. | 4h |

**Subtotal P1: 38 tareas, ~155h estimadas**

---

## P2 — Importantes

Funcionalidad que completa la propuesta de valor pero no bloquea la operación.

| # | Módulo | Tarea | Descripción | Estimación |
|---|---|---|---|---|
| 64 | Reportes | Infraestructura Playwright/Chromium | Worker job para generar PDFs con Playwright headless, cola BullMQ, almacenamiento en Supabase Storage. | 12h |
| 65 | Reportes | 5 informes F6 | Estado SGPDP, Informe Auditoría, Hallazgos e Incidentes, Dashboard Indicadores, Reporte PHVA. Plantillas HTML->PDF. | 10h |
| 66 | Reportes | Informes F2-F5, F7 | Reporte Riesgos (F2), Informe Implementación (F3), Reporte Alineación (F4), Reportes F5, Reportes F7. | 8h |
| 67 | Reportes | 3 informes Capacitaciones | Mensual, Cumplimiento LOPDP, Actas Individuales con datos reales. | 5h |
| 68 | Reportes | EIPD PDF + LIA Excel | Generar informe EIPD como PDF y test LIA como Excel. | 4h |
| 69 | Reportes | Certificados de capacitación | Certificado virtual con nombre, módulo, puntaje, fecha, hash. Solo si >= 70% (RN-801). | 4h |
| 70 | Capacitaciones | Motor de evaluación interactivo | Quiz de 10 preguntas por módulo, puntuación, aprobado/no aprobado, persistencia en BD. | 8h |
| 71 | API | Endpoints de evidencias con hash real | Hash SHA-256 al cargar, prev_hash para cadena, retención 5 años, append-only. Verificar INV-3. | 6h |
| 72 | API | Audit log con cadena de hash | Implementar cadena de hash en audit_log, actor_type HUMANO/MARK_AI/SISTEMA. Verificar INV-4. | 4h |
| 73 | API | Reloj 72h de incidentes | Cálculo `fecha_max_reporte` en servidor, alertas preventivas, verificar INV-9. | 4h |
| 74 | Mobile | Pantalla de riesgos | Implementar `riesgos/presentation/riesgos_screen.dart` con resumen de riesgos del tenant. | 4h |
| 75 | Mobile | Pantalla de hallazgos | Implementar `hallazgos/presentation/hallazgos_screen.dart` con lista de hallazgos. | 4h |
| 76 | Mobile | Providers para todas las features | Implementar los Riverpod providers vacíos en cada feature (agente, aprobaciones, capacitaciones, etc.). | 6h |
| 77 | Contratos | Tests unitarios motor Pd-VaR | Tests exhaustivos: sector alto/bajo, cada flag de datos, caso A vs. B, honorarios, edge cases. | 3h |
| 78 | Contratos | Tests unitarios motores dominio | Tests para madurez (RN-701), riesgoMatriz, eipd, brechaControles, plazos (72h). | 6h |
| 79 | API | Checklist inteligente (RN-603) | Endpoint para generar checklist parametrizado por perfil, con preguntas y respuestas. | 6h |
| 80 | Portal Cliente | Asistente funcional | Habilitar el chat del asistente en portal del cliente, conectar con MARK AI. | 4h |
| 81 | Topbar | Menú de usuario con dropdown | Dropdown con opciones: perfil, configuración, cerrar sesión. | 2h |

**Subtotal P2: 18 tareas, ~100h estimadas**

---

## P3 — Deseables

Mejoran la experiencia pero no son críticos para la operación.

| # | Módulo | Tarea | Descripción | Estimación |
|---|---|---|---|---|
| 82 | Dashboard | Progreso con escala 1-5 en Visión General | Reemplazar % por escala 1-5 con valor numérico como en la especificación. | 1h |
| 83 | F2 | Activos con formato tarjeta | Reemplazar DataTable por tarjetas con todos los campos: responsable, ubicación, sistemas, flag datos personales. | 3h |
| 84 | F5 | Controles con formato tarjeta | Formato de tarjetas en vez de tabla para mejor lectura. | 2h |
| 85 | F6 | Incidentes — tipo CIA | Agregar campo tipo (Confidencialidad/Integridad/Disponibilidad) a la tabla de incidentes. | 1h |
| 86 | TabBar | Iconos por pestaña | Agregar iconos a cada pestaña de la TabBar (actualmente solo texto). | 2h |
| 87 | Sidebar | Responsive mobile | Drawer overlay para pantallas < md. | 3h |
| 88 | F3 | Pestaña Informe — botón Generar PDF | Conectar con servicio de reportes cuando esté disponible. | 1h |
| 89 | F7 | Lecciones — oportunidades seleccionables | Checkboxes y botón "Enviar seleccionadas (n)" para oportunidades de mejora. | 2h |
| 90 | Notificaciones | Sistema de notificaciones real | Reemplazar badge hardcodeado "3" con conteo real de notificaciones del tenant. | 4h |
| 91 | Mobile | Dashboard con gráficos fl_chart | Implementar radar y barras en el dashboard mobile. | 5h |
| 92 | API | Seed de datos completo | Asegurar que los seeds cubran los valores exactos de la especificación (2.7/5, 62%, 3 hallazgos, 1 riesgo crítico, 5 empresas). | 4h |

**Subtotal P3: 11 tareas, ~28h estimadas**

---

## Resumen del Backlog

| Prioridad | Tareas | Estimación |
|---|---|---|
| P0 — Bloqueantes MVP | 25 | ~132h |
| P1 — Requeridos lanzamiento | 38 | ~155h |
| P2 — Importantes | 18 | ~100h |
| P3 — Deseables | 11 | ~28h |
| **TOTAL** | **92** | **~415h** |

### Ruta crítica sugerida

1. **Sprint 1 (P0 core):** Tareas 1-12 (F2 + F3 wizards) — ~60h
2. **Sprint 2 (P0 resto):** Tareas 13-25 (F4-F6 + Formulario + MARK AI) — ~72h
3. **Sprint 3 (P1 dashboard + F1):** Tareas 26-36 (Dashboard completo + F1 mejoras) — ~40h
4. **Sprint 4 (P1 fases):** Tareas 37-55 (F2-F7 contenido completo) — ~70h
5. **Sprint 5 (P1 periféricos):** Tareas 56-63 (Capacitaciones, Portal, Formulario, textos) — ~30h
6. **Sprint 6 (P2 reportes + infra):** Tareas 64-81 — ~100h
7. **Sprint 7 (P3 polish):** Tareas 82-92 — ~28h

### Dependencias clave

- Tareas 64-69 (PDFs) dependen de la infraestructura Playwright/Chromium en el worker.
- Tarea 25 (MARK AI) depende de la configuración de la Anthropic API en producción.
- Tareas 59 (Portal PIMS) y 24 (Pd-VaR UI) son independientes y pueden paralelizarse.
- Tareas 77-78 (tests) pueden ejecutarse en paralelo con cualquier sprint de UI.
