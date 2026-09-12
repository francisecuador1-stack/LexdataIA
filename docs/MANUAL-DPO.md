# Manual del Operador DPO — LEXDATA IA

## Sistema de Gestion de Proteccion de Datos Personales (SGPDP)
### LOPDP Ecuador — Ciclo PHVA en 7 Fases

**Dirigido a:** Delegados de Proteccion de Datos (DPO) certificados ante la SPDP.

**Version:** 0.6.0 | **Fecha:** Septiembre 2026

---

## Indice

1. [Acceso al sistema](#1-acceso-al-sistema)
2. [Dashboard PHVA](#2-dashboard-phva)
3. [Fase 1 — Motor de Conocimiento Normativo](#3-fase-1--motor-de-conocimiento-normativo)
4. [Fase 2 — Amenazas y Vulnerabilidades](#4-fase-2--amenazas-y-vulnerabilidades)
5. [Fase 3 — Implementacion Inicial](#5-fase-3--implementacion-inicial)
6. [Fase 4 — Definicion (Marco Estrategico)](#6-fase-4--definicion)
7. [Fase 5 — Implementacion y Supervision](#7-fase-5--implementacion-y-supervision)
8. [Fase 6 — Monitoreo y Revision (Auditoria)](#8-fase-6--auditoria)
9. [Fase 7 — Mejora Continua](#9-fase-7--mejora-continua)
10. [Capacitaciones](#10-capacitaciones)
11. [Aprobaciones y firmas](#11-aprobaciones-y-firmas)
12. [Gestion de incidentes y protocolo 72h](#12-gestion-de-incidentes-y-protocolo-72h)
13. [Supervision de MARK AI](#13-supervision-de-mark-ai)

---

## 1. Acceso al sistema

### Inicio de sesion

1. Ingrese su correo institucional y contrasena (minimo 12 caracteres).
2. **Autenticacion de dos factores (MFA):** como DPO, la verificacion TOTP es obligatoria. Ingrese el codigo de 6 digitos de su aplicacion de autenticacion (Google Authenticator, Authy, etc.).
3. Una vez autenticado, el sistema lo dirige al Dashboard PHVA.

### Selector de empresa

En la sidebar izquierda encontrara el bloque **EMPRESA ACTIVA**. Este selector determina sobre que empresa (tenant/cliente) trabaja. Al cambiar de empresa, todos los datos, KPIs y fases se actualizan automaticamente.

### Navegacion

La sidebar presenta las secciones del ciclo PHVA:

- **ANALISIS:** Dashboard PHVA
- **PLANIFICAR (P):** Fase 1 (Normas), Fase 2 (Amenazas), Fase 3 (Implementacion), Fase 4 (Definicion)
- **HACER (H):** Fase 5 (Supervision)
- **VERIFICAR (V):** Fase 6 (Auditoria)
- **ACTUAR (A):** Fase 7 (Mejora Continua)
- **CAPACITACIONES**
- **CLIENTE:** Portal del Cliente, Formulario SPDP

---

## 2. Dashboard PHVA

Ruta: `/dashboard`

El dashboard es su panel de control central. Presenta una vision consolidada del estado del SGPDP de la empresa activa.

### 2.1 KPIs principales

| KPI | Que mide | Cuando preocuparse |
|-----|----------|-------------------|
| **Estado SGPDP** | Estado general del sistema y nivel de madurez | Si muestra "Atencion requerida" |
| **Madurez Global** | Puntaje 1-5 (Inicial a Optimizado) | Si es menor a 3.0 (Definido) |
| **Cumplimiento Documental** | Porcentaje de documentos aprobados | Si es menor al 60% |
| **Hallazgos Abiertos** | Numero de hallazgos sin resolver | Si hay criticos sin atender |
| **Riesgos Criticos** | Cantidad de riesgos en zona roja | Cualquier valor > 0 requiere EIPD (RN-201) |

### 2.2 Radar de madurez

El grafico radar muestra la madurez por cada fase (F1 a F7) en una escala de 0 a 5. Las areas con menor puntaje indican donde enfocar esfuerzos de mejora.

**Algoritmo de madurez (RN-701):**
- F1 (Cumplimiento normativo): 20%
- F2 (Gestion de riesgos): 20%
- F5 (Controles implementados): 25%
- F6 (Hallazgos de auditoria): 20%
- F7 (Eficacia de remediacion): 15%

### 2.3 Seccion de urgencia

Preste atencion inmediata a:
- **Incidentes activos** con reloj de 72h corriendo (Art. 41 LOPDP)
- **Hallazgos criticos** sin plan de remediacion
- **Riesgos en zona roja** sin EIPD iniciada
- **Solicitudes de firma** pendientes del agente MARK AI

### 2.4 Bitacora de actividad reciente

Muestra los ultimos eventos del sistema: auditorias completadas, eficacia calificada, hallazgos registrados, controles declarados, evidencias cargadas. Cada entrada tiene fecha, tipo de evento y detalle.

---

## 3. Fase 1 — Motor de Conocimiento Normativo

Ruta: `/fase-1` | Ciclo: **PLANIFICAR** | Regla: **RN-004**

### Que hace esta fase

Es la **fuente unica de verdad legal** del SGPDP. Contiene toda la normativa aplicable (nacional e internacional) con sus controles asociados. Alimenta automaticamente las Fases 2, 4 y 5.

### Pestanas

#### Biblioteca Juridica

- **28 normas nacionales** (LOPDP, RGLOPDP, Constitución, resoluciones SPDP y SGPDP)
- **8 normas internacionales** (ISO 27001, ISO 27701, ISO 42001, NIST)
- Cada norma tiene: fuente, identificador, estado (Vigente), texto normativo, resumen ejecutivo, metadatos del organismo emisor y **hash SHA-256** que garantiza la integridad del contenido.
- Al seleccionar una norma, el panel derecho muestra los **modulos relacionados** y los **controles normativos asociados** con la evidencia que cada uno requiere.

#### Matriz Normativa (API interna)

**Esta matriz es de solo lectura para operadores.** Contiene los 18 controles normativos que el sistema usa internamente para vincular hallazgos con la norma (RN-601).

Ejemplo: el control "Protocolo de notificacion 72h a SPDP" (LOPDP Art. 41) requiere como evidencia "Protocolo documentado y capacitacion".

#### Principios Rectores (13)

Los 13 principios del Art. 10 LOPDP que todo tratamiento debe cumplir. Cada principio tiene estado (Verificado, Pendiente, No Verificado) y preguntas de auditoria asociadas.

### Lo que usted hace aqui

- **Consultar** la base normativa para fundamentar decisiones.
- **Verificar** el estado de los principios rectores.
- **NO modificar** la matriz normativa (solo `LEGAL_ADMIN` puede hacerlo).

---

## 4. Fase 2 — Amenazas y Vulnerabilidades

Ruta: `/fase-2` | Ciclo: **HACER** | Reglas: **RN-201, RN-401**

### Que hace esta fase

Inventaria todos los tratamientos de datos personales (RAT), identifica riesgos, evalua impacto y determina si se requiere EIPD.

### Pestanas criticas

#### RAT Supervisado

El Registro de Actividades de Tratamiento lista todas las actividades de tratamiento del cliente. Usted como DPO:

1. **Revisa** cada tratamiento (nombre, finalidad, base legal, datos sensibles, retencion).
2. **Valida** o **marca con observaciones** cada tratamiento.
3. Si marca "Con Observaciones", el tratamiento **queda bloqueado** y no puede avanzar de fase (RN-401, INV-7).

> **Regla RN-201/RN-401:** Tratamientos con riesgo Alto o Critico activan alerta de EIPD obligatoria. Un tratamiento "Con Observaciones" bloquea su avance hasta que se resuelvan las observaciones.

#### Matriz de Riesgos Consolidada

Tabla con todos los riesgos evaluados: tratamiento, activo, amenaza, impacto (1-5), probabilidad (1-5), score (I x P) y nivel resultante. Los riesgos en **zona roja** (score >= 12, nivel Alto/Critico) requieren atencion inmediata.

#### Mapa de Calor

Visualizacion 5x5 de impacto vs. probabilidad. La zona roja activa notificacion automatica al DPO y EIPD obligatoria (RN-201).

#### EIPD / LIA

El sistema determina automaticamente si la EIPD es obligatoria basandose en criterios del Art. 39 LOPDP (gran escala, datos sensibles, decisiones automatizadas, perfilamiento, menores). Usted debe completar el informe EIPD y firmarlo.

### Evidencia requerida por controles de esta fase

| Control | Evidencia |
|---------|-----------|
| RAT actualizado (LOPDP 37) | RAT vigente con fecha de ultima revision |
| Registro de tratamientos con EIPD obligatoria (LOPDP 39) | Lista actualizada en RAT |
| Evaluacion de impacto documentada (LOPDP 39) | Informe EIPD con firma del DPO |
| Garantias de transferencia internacional (LOPDP 54) | SCCs o nivel de adecuacion |

---

## 5. Fase 3 — Implementacion Inicial

Ruta: `/fase-3` | Ciclo: **PLANIFICAR** | Regla: **RN-301**

### Que hace esta fase

Realiza el diagnostico organizacional del cliente para determinar su nivel de preparacion frente al SGPDP.

### Evaluacion Organizacional

Wizard de 17 preguntas en 5 dimensiones:

1. **Compromiso de la Alta Direccion** (4 preguntas)
2. **Estructura Organizacional** (4 preguntas)
3. **Cultura de Proteccion de Datos** (3 preguntas)
4. **Recursos Disponibles** (3 preguntas)
5. **Gobierno del SGPDP** (3 preguntas)

Para cada pregunta, usted evalua: **Cumple**, **Parcial** o **No Cumple**. Puede agregar preguntas adicionales propias (RN-301).

### Gobierno del SGPDP

Verifica que existan los 4 elementos de gobierno: Comite de Proteccion de Datos, Patrocinio de la gerencia, Canales de reporte activos y Mecanismos de seguimiento.

> **Principio de independencia (RN-902):** Usted como DPO registra unicamente el estado de verificacion y las evidencias revisadas. No modifica la estructura organizacional ni designa miembros. Su funcion es supervisar, no administrar.

### Roles y Responsabilidades

Verifica que los 5 roles exigidos por la LOPDP esten formalmente definidos. Los roles de DPO y Comite requieren **Acta de Designacion formal** con hash registrado para clasificarse como "Definido" (RN-402).

### Boveda de Evidencias SHA-256

Cargue evidencias documentales (organigramas, actas de comite, nombramientos, politicas). Cada archivo genera un hash criptografico al cargarse. Las evidencias son inmutables y se conservan por 5 anos minimo (INV-3, RN-101).

### Gap Analysis

El sistema detecta automaticamente brechas entre el estado actual y el requerido. Las brechas se clasifican por severidad y dominio.

---

## 6. Fase 4 — Definicion

Ruta: `/fase-4` | Ciclo: **PLANIFICAR** | Regla: **RN-401**

### Que hace esta fase

Define el marco estrategico: controles de diseno, medidas tecnicas/organizativas/juridicas y planes de accion.

### Evaluacion de controles (RN-401)

Para cada control propuesto, usted evalua:
- **Proporcionalidad** al riesgo identificado
- **Suficiencia** para cumplir con la norma
- **Justificabilidad** antes de asignar presupuesto

### Validacion de principios por tratamiento

Cada actividad del RAT se evalua contra los principios aplicables. Los veredictos posibles son:
- **Valido:** cumple todos los principios
- **Inconsistencia:** cumple parcialmente (requiere correccion)
- **Bloqueado:** no puede avanzar hasta resolver la observacion (RN-401, INV-7)

### Hallazgos de diseno

Registre hallazgos detectados durante la revision de diseno (ej. "Aviso de privacidad no incluye decisiones automatizadas"). Cada hallazgo se codifica (HD-00x) y se vincula al documento afectado.

### Medidas juridicas

Revise el estado de DPAs con proveedores, clausulas de confidencialidad, tests LIA y plantillas de SCCs. Verifique que los contratos incluyan las clausulas del Art. 38 LOPDP.

---

## 7. Fase 5 — Implementacion y Supervision

Ruta: `/fase-5` | Ciclo: **HACER** | Regla: **RN-501**

### Que hace esta fase

Verifica que los controles disenados en F4 se hayan implementado efectivamente y evalua su eficacia.

### Evaluacion de eficacia (RN-501)

Para cada control implementado, usted califica tres ejes:

1. **Estado de implementacion:** grado de despliegue del control.
2. **Eficacia observada:** Alta / Media / Baja — resultado real del control.
3. **Confianza en la evidencia:** Alta / Media / Baja — calidad y fiabilidad de la evidencia presentada.

### Hallazgos operativos

Registre hallazgos durante la operacion del SGPDP. Tipos disponibles:
- **NCM** — No Conformidad Mayor
- **NCm** — No Conformidad Menor
- **OBS** — Observacion
- **OM** — Oportunidad de Mejora
- **BP** — Buena Practica

### Evidencia requerida por controles de esta fase

| Control | Evidencia |
|---------|-----------|
| Cifrado AES-256 en reposo (Art. 30 / NIST PR.DS-1) | Configuracion verificada por auditoria tecnica |
| Contrato de encargado (Art. 38) | Contrato firmado con clausulas LOPDP |
| Protocolo de gestion de brechas (Art. 41) | Plan aprobado y simulacro anual |
| Capacitacion en proteccion de datos (Art. 30) | Registros de asistencia y evaluaciones |

---

## 8. Fase 6 — Auditoria

Ruta: `/fase-6` | Ciclo: **VERIFICAR** | Reglas: **RN-601, RN-602, RN-603**

### Que hace esta fase

Centro de monitoreo, auditorias formales, gestion de incidentes y generacion de indicadores de cumplimiento.

### Centro de Monitoreo

Vista consolidada con 4 KPIs criticos:
- **% Implementacion** del SGPDP
- **NC Mayores abiertas**
- **Incidentes activos** (con reloj de 72h)
- **Controles sin evidencia**

### Hallazgos con trazabilidad (RN-601)

Cada hallazgo se vincula obligatoriamente a un articulo de la matriz normativa. El sistema sugiere automaticamente el articulo aplicable desde la Fase 1 (RN-004). La trazabilidad completa es: F1 (Base legal) → F2 (Riesgo) → F6 (Hallazgo) → F7 (Mejora).

> **INV-6:** Un hallazgo se cierra solo con verificacion de eficacia + evidencia con hash registrada por un usuario humano con rol DPO. MARK AI no puede cerrar hallazgos.

### Checklist Inteligente (RN-603)

Cuestionario parametrizado por perfil de cumplimiento:
- **LOPDP** (perfil base, 8 preguntas)
- **ISO 27701** (alineacion con el estandar internacional)
- **Videovigilancia** (sector especifico)
- **Salud / Datos Sensibles** (sector especifico)
- **Inteligencia Artificial** (sector especifico)

### Gestion de incidentes

Ver seccion 12 de este manual (Protocolo 72h).

### Reporting Engine

Genere los siguientes informes con validez institucional para la SPDP:
- Estado General del SGPDP
- Informe de Auditoria
- Reporte de Hallazgos e Incidentes
- Dashboard de Indicadores
- Reporte PHVA y de Riesgos

Todos los PDF incluyen: encabezado institucional, empresa, periodo, DPO responsable, hash SHA-256 y codigo de verificacion.

---

## 9. Fase 7 — Mejora Continua

Ruta: `/fase-7` | Ciclo: **ACTUAR** | Reglas: **RN-701, RN-702**

### Que hace esta fase

Cierra el ciclo PHVA: seguimiento de recomendaciones, medicion de madurez, documentacion de lecciones aprendidas e identificacion de oportunidades de mejora.

### Seguimiento de recomendaciones

Cada recomendacion tiene un expediente digital con trazabilidad completa: de donde salio (F6, hallazgo), que norma aplica (F1) y que evidencia lo respalda.

Estados: Emitida → En implementacion → Implementada → Cerrada.

> **INV-6 / RN-702:** Ninguna recomendacion se cierra sin verificacion de eficacia con evidencia hasheada, registrada por el DPO humano en un ciclo posterior. MARK AI puede proponer el cierre pero nunca ejecutarlo.

### Nivel de Madurez Institucional

Escala de 5 niveles:

| Nivel | Nombre | Descripcion |
|-------|--------|-------------|
| 1 | Inicial | Procesos ad-hoc y desorganizados |
| 2 | Gestionado | Procesos planificados pero no estandarizados |
| 3 | Definido | SGPDP estandarizado y documentado |
| 4 | Controlado | SGPDP medido mediante KPIs y supervision activa |
| 5 | Optimizado | Enfoque en mejora continua e innovacion proactiva |

### Oportunidades de mejora automaticas

El sistema analiza las 7 fases e identifica oportunidades automaticamente. Ejemplos:
- Riesgos Alto/Critico sin mitigacion completa (F2)
- Hallazgos de auditoria que deben cerrarse (F6)
- Fases con madurez inferior al 50%
- Fases modelo con madurez superior al 80%

Usted selecciona las oportunidades que desea convertir en acciones de mejora.

---

## 10. Capacitaciones

Ruta: `/capacitaciones`

### E-Learning

8 modulos de capacitacion en proteccion de datos personales:

| Modulo | Nivel | Duracion |
|--------|-------|----------|
| Introduccion a la LOPDP Ecuador | Basico | 18 min |
| Derechos ARCO+ y atencion al titular | Basico | 22 min |
| Bases legales del tratamiento de datos | Intermedio | 20 min |
| Proteccion de datos sensibles y menores | Intermedio | 25 min |
| Gestion de incidentes — Protocolo 72h | Avanzado | 30 min |
| Evaluacion de Impacto EIPD — Metodologia | Avanzado | 35 min |
| Rol del DPO — Funciones y responsabilidades | Intermedio | 28 min |
| Transferencias internacionales de datos | Avanzado | 24 min |

Cada modulo incluye 10 preguntas de evaluacion. Se emite **certificado virtual solo si el puntaje es >= 70%** (INV-10, RN-801).

### Central de Capacitaciones

Monitoreo del programa de capacitacion: evaluaciones completadas, tasa de aprobacion, puntaje promedio, personas sin capacitar y avance por modulo.

### Informes DPO

Genere 3 tipos de informes con validez institucional:
- Informe Mensual de Capacitaciones
- Informe de Cumplimiento LOPDP
- Actas Individuales de Capacitacion

---

## 11. Aprobaciones y firmas

### Que acciones requieren firma del DPO

| Accion | Fase | Regla |
|--------|------|-------|
| Validar tratamiento en el RAT | F2 | RN-401 |
| Aprobar informe EIPD | F2 | Art. 39 LOPDP |
| Aprobar control de diseno | F4 | RN-401 |
| Cerrar hallazgo | F5/F6 | INV-6 |
| Cerrar recomendacion | F7 | INV-6 / RN-702 |
| Aprobar documento generado | Transversal | INV-5 |
| Notificar incidente a la SPDP | F6 | Art. 41 LOPDP |

### Cola de solicitudes de MARK AI

MARK AI puede generar **solicitudes de firma** cuando detecta que un documento, hallazgo o propuesta requiere aprobacion del DPO. Estas solicitudes aparecen en:

1. La seccion de solicitudes de firma del agente
2. Las notificaciones del topbar (campana)
3. El panel de MARK AI (toast de alerta)

Usted debe revisar cada solicitud, aprobar o rechazar, y registrar su decision.

> **INV-5:** MARK AI **nunca** puede ejecutar: aprobar documento, cerrar hallazgo, cerrar recomendacion, validar tratamiento ni firmar. Solo propone. El DPO humano decide.

---

## 12. Gestion de incidentes y protocolo 72h

### Flujo del protocolo (Art. 41 LOPDP, RN-602)

```
Deteccion del incidente
    │
    ▼
Registro en el sistema (inicia reloj de 72h)
    │
    ▼
Clasificacion (Confidencialidad / Integridad / Disponibilidad)
    │
    ▼
Evaluacion de impacto y alcance
    │
    ▼
¿Afecta derechos de titulares?
    ├── Si → Notificar a la SPDP (dentro de 72h)
    │         + Notificar a titulares afectados
    └── No → Documentar decision y evidencia
    │
    ▼
Plan de contencion y remediacion
    │
    ▼
Registro de evidencias con hash SHA-256
    │
    ▼
Cierre del incidente (con verificacion de eficacia)
```

### Plazos criticos

- **72 horas** desde la deteccion para notificar a la SPDP (Art. 41 LOPDP).
- El sistema calcula `fecha_max_reporte_spdp` automaticamente en el servidor (INV-9).
- Alerta preventiva cuando quedan menos de 24 horas.
- El estado del reloj se muestra en los KPIs de la Fase 6.

### Donde monitorear

- **Dashboard:** KPI "Incidentes activos"
- **Fase 6 → Indicadores:** panel con codigo del incidente, tipo, fecha maxima de reporte y estado de notificacion
- **Fase 6 → Gestion de Incidentes:** detalle completo con timeline

---

## 13. Supervision de MARK AI

### Que es MARK AI

MARK AI es el agente de inteligencia artificial operativo de LEXDATA IA. Ejecuta el trabajo operativo del SGPDP: analisis, observaciones, documentacion y coordinacion.

### Como interactuar

Abra el panel de MARK AI desde el chip en el topbar o desde el drawer derecho. Puede:
- Escribir preguntas en lenguaje natural
- Usar las **preguntas rapidas** predefinidas: "Hay brechas criticas?", "Estado del RAT", "Documentos pendientes", "Estado ARCO-PS", "DPAs sin firmar", "Proxima auditoria?"
- Solicitar que redacte documentos o proponga hallazgos

### Lo que MARK AI puede hacer

- Buscar normativa en el corpus legal
- Consultar el estado del RAT, riesgos, hallazgos, incidentes, DPAs
- Redactar borradores de documentos
- Proponer hallazgos para su revision
- Solicitar firma del DPO cuando es necesario

### Lo que MARK AI NO puede hacer (INV-5)

- Aprobar documentos
- Cerrar hallazgos o recomendaciones
- Validar tratamientos
- Firmar cualquier tipo de documento

Estas restricciones no son limitaciones tecnicas: son requisitos legales. La independencia del DPO y la reserva humana de decision son exigencias de la LOPDP.

### Como auditarlo

Toda accion de MARK AI se registra en la bitacora (`audit_log`) con `actor_type = MARK_AI`. La cadena de hash permite verificar la integridad de todo el registro. Puede consultar la bitacora en Dashboard → Actividad Reciente o directamente en la Fase 6.

### Como pausarlo

Si necesita suspender temporalmente la actividad del agente, consulte con el administrador del sistema. La pausa del agente no afecta el funcionamiento del resto del SGPDP.

---

## Glosario

| Termino | Definicion |
|---------|-----------|
| **ARCO-PS** | Derechos de Acceso, Rectificacion, Cancelacion, Oposicion, Portabilidad y Supresion |
| **DPA** | Data Processing Agreement (Contrato de encargado del tratamiento) |
| **DPO** | Delegado de Proteccion de Datos |
| **EIPD** | Evaluacion de Impacto en Proteccion de Datos |
| **LIA** | Legitimate Interest Assessment (Test de interes legitimo) |
| **LOPDP** | Ley Organica de Proteccion de Datos Personales del Ecuador |
| **PHVA** | Planificar-Hacer-Verificar-Actuar (ciclo de mejora continua) |
| **RAT** | Registro de Actividades de Tratamiento |
| **RLS** | Row-Level Security (seguridad a nivel de fila en la base de datos) |
| **RGLOPDP** | Reglamento General a la LOPDP |
| **SCCs** | Standard Contractual Clauses (Clausulas contractuales tipo) |
| **SGPDP** | Sistema de Gestion de Proteccion de Datos Personales |
| **SPDP** | Superintendencia de Proteccion de Datos Personales |
