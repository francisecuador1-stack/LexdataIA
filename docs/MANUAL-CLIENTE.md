# Manual del Portal del Cliente — LEXDATA IA

## Guia de uso para empresas responsables del tratamiento

**Dirigido a:** Administradores y colaboradores de empresas clientes de LEXDATA IA.

**Version:** 0.6.0 | **Fecha:** Septiembre 2026

---

## Indice

1. [Acceso al portal](#1-acceso-al-portal)
2. [Diagnostico PIMS](#2-diagnostico-pims)
3. [Formulario SPDP y cotizacion](#3-formulario-spdp-y-cotizacion)
4. [Capacitaciones](#4-capacitaciones)
5. [Mis Documentos](#5-mis-documentos)
6. [Carga de evidencias](#6-carga-de-evidencias)
7. [Asistente (Chat con MARK AI)](#7-asistente)
8. [Mi Empresa](#8-mi-empresa)
9. [Preguntas frecuentes](#9-preguntas-frecuentes)

---

## 1. Acceso al portal

### Primer acceso

1. Recibira una invitacion por correo electronico con un enlace para crear su cuenta.
2. Establezca una contrasena segura (minimo 12 caracteres).
3. Una vez autenticado, acceda al **Portal del Cliente** desde el menu lateral izquierdo.

### Roles disponibles

| Rol | Que puede hacer |
|-----|----------------|
| **Administrador del Cliente** (`CLIENTE_ADMIN`) | Completar diagnosticos, gestionar documentos, ver capacitaciones, chatear con el asistente |
| **Colaborador** (`CLIENTE_COLABORADOR`) | Realizar capacitaciones y consultar documentos propios |

---

## 2. Diagnostico PIMS

Ruta: Portal del Cliente → Diagnostico PIMS

El Diagnostico PIMS (Privacy Information Management System) evalua el nivel de madurez de su empresa frente a la LOPDP del Ecuador en **11 modulos con 33 preguntas**.

### Los 11 modulos

| # | Modulo | Que evalua |
|---|--------|-----------|
| 0 | Fundamentos y Ecosistema | Si la empresa sabe que esta sujeta a la LOPDP, si ha hecho diagnosticos previos, si tiene responsable de cumplimiento |
| 1 | Gobernanza y Compromiso Institucional | Respaldo de la alta direccion, comite de privacidad, politicas aprobadas |
| 2 | Mapeo de Flujos e Inventario de Datos | Si tiene inventariados los flujos de datos personales y su registro de actividades (RAT) |
| 3 | Adecuacion de Politicas y Documentacion | Politicas de privacidad, avisos informativos, procedimientos documentados |
| 4 | Regularizacion Contractual con Terceros | Contratos con proveedores (DPA), clausulas de confidencialidad, transferencias internacionales |
| 5 | Operativizacion de Derechos ARCO-PS | Canales para que los titulares ejerzan sus derechos, plazos de respuesta, registros |
| 6 | Seguridad Tecnica y Gestion de Riesgos | Cifrado, controles de acceso, evaluaciones de riesgos, medidas de seguridad |
| 7 | Respuesta a Incidentes y Brechas | Protocolo de respuesta, capacidad de notificacion en 72h, plan de contencion |
| 8 | Cultura de Privacidad y KPIs | Programa de sensibilizacion, indicadores de cumplimiento, mejora continua |
| 9 | Conservacion, Bloqueo y Eliminacion Segura | Politicas de retencion, procedimientos de eliminacion, registros de destruccion |
| 10 | Auditoria Interna y Control de Madurez | Programa de auditorias, seguimiento de hallazgos, nivel de madurez |

### Como completar el diagnostico

1. Seleccione el modulo que desea responder.
2. Lea cada pregunta con atencion. Incluyen una **nota explicativa** que aclara el contexto.
3. Para cada pregunta, seleccione una de las tres opciones:
   - **Si, implementado:** La empresa ya tiene esto en funcionamiento.
   - **En proceso:** Se esta trabajando en ello pero no esta completo.
   - **No implementado:** No existe o no se ha iniciado.
4. Puede pausar y retomar el diagnostico en cualquier momento. Su progreso se guarda automaticamente.
5. Use los botones **Anterior** y **Siguiente** para navegar entre preguntas y modulos.

### Resultado

Al completar los 11 modulos, el sistema calcula un puntaje de madurez por area. Este resultado sirve como punto de partida para que el DPO asignado disene el plan de implementacion del SGPDP de su empresa.

---

## 3. Formulario SPDP y cotizacion

Ruta: Formulario SPDP (menu lateral)

Este wizard de **7 secciones** recopila la informacion necesaria para registrar su empresa ante la Superintendencia de Proteccion de Datos Personales y generar una cotizacion personalizada.

### Secciones del formulario

#### Identificacion

Datos formales de la empresa que deben coincidir con los datos del SRI:
- Razon social, RUC (13 digitos), sitio web, actividad economica (CIIU)
- Representante legal: nombre completo y cedula de identidad
- Ubicacion: direccion, ciudad, provincia, telefono, correo institucional

#### S1 — Perfil de la empresa

Sector economico, numero de trabajadores y cantidad de sucursales.

#### S2 — Volumen de datos

Cantidad aproximada de titulares cuyos datos personales trata la empresa y las categorias de titulares (clientes, empleados, proveedores, pacientes, usuarios digitales, menores, etc.).

#### S3 — Tipos de datos

Indique si su empresa trata datos sensibles: salud, biometricos, geneticos, menores de edad, raciales, politicos, religiosos, sindicales, orientacion sexual, penales.

#### S4 — Tecnologia

Si utiliza inteligencia artificial, toma decisiones automatizadas sobre personas, realiza perfilamiento, tiene transferencias internacionales de datos o usa proveedores cloud en el extranjero.

#### S5 — Madurez actual

Si ya cuenta con RAT, EIPD, LIA, politicas formales de privacidad o DPO designado.

#### S6 — Operativa

Volumen de solicitudes ARCO al ano, historial de incidentes de seguridad, canal de atencion de derechos.

#### S7 — Gobernanza

Compromiso documentado de la alta direccion, comite de privacidad, antecedentes de reclamos o sanciones de la SPDP.

### Resultado Pd-VaR

Al completar el formulario, el sistema calcula automaticamente el indice **Pd-VaR** (Privacy data Value-at-Risk), que determina:

- **Nivel de riesgo:** Bajo, Medio, Alto o Critico
- **Desglose de factores** que contribuyen al puntaje, ordenados por peso
- **Cotizacion personalizada** basada en el perfil de riesgo

La Dra. Andreina Almeida revisara su perfil Pd-VaR en 24 horas habiles.

### Proximos pasos despues del formulario

- Se iniciara el Diagnostico LOPDP completo (Fase 1 — Normas aplicables)
- Se generara el RAT, EIPD y documentacion base del SGPDP
- Tendra acceso al Dashboard LOPDP
- Primer reporte mensual al SPDP en el plazo reglamentario

---

## 4. Capacitaciones

Ruta: Capacitaciones (menu lateral)

### E-Learning

LEXDATA IA ofrece **8 modulos de capacitacion** en proteccion de datos personales, disenados para colaboradores de todos los niveles:

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

### Como funciona la evaluacion

1. Seleccione un modulo y revise el contenido educativo.
2. Al finalizar, complete la evaluacion de **10 preguntas**.
3. Si obtiene un puntaje **igual o superior al 70%**, recibira un **certificado virtual** descargable con validez institucional.
4. Si no aprueba, puede volver a intentar la evaluacion.

### Certificados

Los certificados incluyen:
- Nombre del participante
- Modulo completado
- Puntaje obtenido
- Fecha de emision
- Hash SHA-256 de validacion
- Codigo de verificacion

---

## 5. Mis Documentos

Ruta: Portal del Cliente → Mis Documentos

En esta seccion puede consultar todos los documentos generados en el marco de su SGPDP:

- Politicas de proteccion de datos
- Avisos de privacidad
- Contratos de encargado (DPA)
- Informes de auditoria
- Certificados de capacitacion
- Reportes del SGPDP

Los documentos estan organizados por tipo y fecha. Puede descargarlos en formato PDF. Cada documento tiene un **hash SHA-256** y un **codigo de verificacion** que garantizan su integridad.

---

## 6. Carga de evidencias

Cuando el DPO o el sistema le soliciten documentacion, puede cargar evidencias desde el portal:

1. Acceda a la seccion de evidencias correspondiente.
2. Seleccione el tipo de documento y la dimension relacionada.
3. Cargue el archivo.
4. El sistema genera automaticamente un **hash SHA-256** del archivo.
5. La evidencia queda registrada como inmutable en la boveda.

> **Importante:** Las evidencias no pueden editarse ni eliminarse una vez cargadas. Se conservan por un minimo de 5 anos conforme a la normativa. Este es un requisito de integridad y no repudio del SGPDP.

---

## 7. Asistente

Ruta: Portal del Cliente → Asistente

El asistente es un canal de comunicacion con MARK AI, el agente operativo de LEXDATA IA. Puede usarlo para:

- Consultar el estado de su SGPDP
- Preguntar sobre requisitos de la LOPDP
- Solicitar informacion sobre sus documentos
- Recibir orientacion sobre proximos pasos

Las respuestas del asistente se basan en la normativa ecuatoriana vigente. Cuando una pregunta excede el alcance del asistente, sera derivada al DPO asignado a su empresa.

> **Nota:** El asistente no toma decisiones ni aprueba documentos. Toda decision relevante la toma el DPO humano certificado ante la SPDP.

---

## 8. Mi Empresa

Ruta: Portal del Cliente → Mi Empresa

Consulte y actualice la informacion de su empresa:
- Datos de identificacion (razon social, RUC, actividad economica)
- Representante legal
- Ubicacion y contacto
- DPO asignado
- Estado del SGPDP

---

## 9. Preguntas frecuentes

### Que es la LOPDP?

La Ley Organica de Proteccion de Datos Personales (LOPDP) es la norma ecuatoriana que regula el tratamiento de datos personales. Fue publicada en 2021 y es de cumplimiento obligatorio para toda persona natural o juridica que trate datos personales de titulares en el Ecuador.

### Que es un SGPDP?

Es un Sistema de Gestion de Proteccion de Datos Personales: un marco estructurado que permite a las organizaciones demostrar cumplimiento con la LOPDP de forma continua y auditable.

### Que es el RAT?

El Registro de Actividades de Tratamiento (Art. 37 LOPDP) es el inventario de todas las actividades en las que su empresa trata datos personales, con detalle de finalidad, base legal, categorias de datos, plazos de conservacion y medidas de seguridad.

### Que pasa si tengo un incidente de seguridad?

Notifique inmediatamente al DPO asignado. La LOPDP (Art. 41) exige que la Superintendencia de Proteccion de Datos Personales sea notificada dentro de las **72 horas** siguientes a la deteccion del incidente cuando este pueda afectar los derechos de los titulares.

### Que son los derechos ARCO-PS?

Son los derechos que la LOPDP otorga a toda persona sobre sus datos personales:
- **A**cceso: saber que datos tiene la empresa sobre usted
- **R**ectificacion: corregir datos inexactos
- **C**ancelacion: solicitar la eliminacion de datos
- **O**posicion: oponerse a determinados tratamientos
- **P**ortabilidad: recibir sus datos en formato estructurado
- **S**upresion: solicitar la eliminacion definitiva

### Mis datos estan seguros en LEXDATA IA?

Si. LEXDATA IA implementa cifrado en transito (TLS 1.3) y en reposo (AES-256), control de acceso basado en roles, aislamiento por tenant (cada empresa solo ve sus propios datos) y boveda de evidencias con integridad criptografica. Consulte el documento de [Cumplimiento Propio](CUMPLIMIENTO-PROPIO.md) para mas detalles.
