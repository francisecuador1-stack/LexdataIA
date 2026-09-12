# Cumplimiento Propio — LEXDATA IA

## SGPDP de LEXDATA IA como Responsable del Tratamiento

**Documento dirigido a:** Clientes, auditores, reguladores y la Superintendencia de Proteccion de Datos Personales (SPDP).

**Version:** 0.6.0 | **Fecha:** Septiembre 2026

---

> **"Vender cumplimiento sin ser cumpliente es el mayor riesgo reputacional."**
>
> LEXDATA IA asesora a empresas en el cumplimiento de la LOPDP. Eso nos obliga a cumplirla nosotros mismos con un estandar igual o superior al que exigimos a nuestros clientes. Este documento es nuestro Registro de Actividades de Tratamiento, nuestra declaracion de bases legales y nuestra politica de privacidad como responsable del tratamiento.

---

## 1. Identidad del responsable del tratamiento

| Campo | Valor |
|-------|-------|
| Responsable | COGNITEX (Quito, Ecuador) |
| Actividad | Plataforma de cumplimiento SGPDP / LOPDP Ecuador |
| DPO del producto | Dra. Andreina Almeida — DPO Certificada SPDP |
| Contacto de privacidad | dpo@lexdata.ec |

---

## 2. Datos personales que tratamos

### 2.1 Datos de usuarios del sistema

| Dato | Finalidad | Base legal |
|------|-----------|-----------|
| Nombre completo | Identificacion del usuario en el sistema | Ejecucion del contrato (Art. 8 LOPDP) |
| Correo electronico institucional | Autenticacion, notificaciones, recuperacion de cuenta | Ejecucion del contrato |
| Contrasena (hash argon2id) | Autenticacion segura | Ejecucion del contrato |
| Rol en el sistema | Control de acceso basado en roles | Ejecucion del contrato |
| Direccion IP | Seguridad, deteccion de accesos anomalos | Interes legitimo (Art. 9 LOPDP) |
| Registros de sesion | Auditoria de acceso, deteccion de fraude | Obligacion legal (Art. 37 LOPDP) |
| Semilla TOTP (cifrada) | Autenticacion de dos factores | Ejecucion del contrato |

### 2.2 Datos de empresas clientes

| Dato | Finalidad | Base legal |
|------|-----------|-----------|
| Razon social, RUC, actividad economica | Identificacion del cliente ante la SPDP | Obligacion legal (Art. 37 LOPDP) |
| Nombre y cedula del representante legal | Formulario SPDP requerido por la autoridad | Obligacion legal |
| Direccion, provincia, telefono, correo | Contacto y ubicacion del responsable del tratamiento | Ejecucion del contrato |
| Respuestas del diagnostico PIMS | Evaluacion de madurez para dimensionar el servicio | Ejecucion del contrato |
| Respuestas del formulario SPDP (S1-S7) | Calculo del indice Pd-VaR y cotizacion | Ejecucion del contrato |

### 2.3 Datos del SGPDP de cada cliente

| Dato | Finalidad | Base legal |
|------|-----------|-----------|
| Registro de actividades de tratamiento (RAT) | Operacion del SGPDP | Ejecucion del contrato + Obligacion legal |
| Hallazgos, incidentes, recomendaciones | Auditoria y mejora continua del SGPDP del cliente | Ejecucion del contrato |
| Evaluaciones de capacitacion (puntajes) | Emision de certificados y seguimiento del programa de sensibilizacion | Ejecucion del contrato |
| Evidencias documentales | Boveda de integridad del SGPDP | Ejecucion del contrato + Obligacion legal |

### 2.4 Bitacora de auditoria

| Dato | Finalidad | Base legal |
|------|-----------|-----------|
| Acciones de usuarios (actor, accion, timestamp, entidad) | Trazabilidad, no repudio, defendibilidad ante la SPDP | Obligacion legal (Art. 37, 42 LOPDP) |
| Acciones de MARK AI (mismos campos + actor_type=MARK_AI) | Auditabilidad de las decisiones asistidas por IA | Interes legitimo + Obligacion legal |
| Cadena de hash (hash, prev_hash) | Integridad e inalterabilidad de los registros | Obligacion legal |

### 2.5 Datos que NO tratamos

- **Datos personales de titulares finales.** LEXDATA IA gestiona el SGPDP del cliente (metadatos: categorias, conteos, riesgos), pero los datos personales de los titulares del cliente permanecen en los sistemas del propio cliente. No accedemos, almacenamos ni procesamos datos de titulares finales.
- **Datos de salud, biometricos, geneticos o de menores.** No tratamos ninguna categoria especial de datos personales.

---

## 3. Encargados del tratamiento (procesadores)

LEXDATA IA utiliza los siguientes proveedores como encargados del tratamiento. Cada uno tiene contrato de encargado (DPA) formalizado con clausulas conformes al Art. 38 LOPDP:

### 3.1 Supabase Inc.

| Campo | Detalle |
|-------|--------|
| Funcion | Base de datos (PostgreSQL), autenticacion, almacenamiento de archivos |
| Datos procesados | Todos los datos de la plataforma (usuarios, tenants, SGPDP, evidencias) |
| Ubicacion de servidores | Configurable por region. Region preferida: que el cliente pueda justificar ante la SPDP |
| DPA | Disponible en supabase.com/legal |
| Medidas de seguridad | Cifrado en reposo y transito, aislamiento por proyecto, backups PITR |

### 3.2 Anthropic PBC

| Campo | Detalle |
|-------|--------|
| Funcion | Procesamiento de lenguaje natural para MARK AI |
| Datos procesados | Prompts con metadatos del SGPDP (estados, conteos, categorias). Sin datos personales de titulares finales |
| Ubicacion | Estados Unidos |
| DPA | Disponible en anthropic.com/policies |
| Uso para entrenamiento | Los datos enviados via API NO se utilizan para entrenar modelos |
| Retencion | Temporal, conforme a politica de seguridad y abuso de Anthropic |

### 3.3 Vercel Inc.

| Campo | Detalle |
|-------|--------|
| Funcion | Hosting de la aplicacion web (SPA estatica) |
| Datos procesados | Archivos estaticos (HTML, CSS, JS). No procesa datos personales directamente |
| Ubicacion | CDN global (edge) |
| DPA | Disponible en vercel.com/legal |

### 3.4 Sentry (Functional Software, Inc.)

| Campo | Detalle |
|-------|--------|
| Funcion | Monitoreo de errores y rendimiento |
| Datos procesados | Stack traces, metadatos de sesion (sin PII: el logger redacta datos personales antes del envio) |
| Ubicacion | Estados Unidos |
| DPA | Disponible en sentry.io/legal |

### 3.5 Firebase (Google LLC)

| Campo | Detalle |
|-------|--------|
| Funcion | Notificaciones push en la app movil (Firebase Cloud Messaging) |
| Datos procesados | Tokens de dispositivo, metadatos de notificacion. Sin contenido de datos personales |
| Ubicacion | Estados Unidos |
| DPA | Google Cloud DPA aplicable |

---

## 4. Transferencias internacionales de datos

Los siguientes proveedores implican transferencia internacional de datos fuera del Ecuador:

| Proveedor | Pais | Garantia aplicable |
|-----------|------|-------------------|
| Supabase | Configurable | Clausulas contractuales tipo (SCCs) + configuracion de region |
| Anthropic | Estados Unidos | SCCs + compromiso contractual de no uso para entrenamiento |
| Vercel | Global (CDN) | SCCs. Nota: solo archivos estaticos, sin datos personales |
| Sentry | Estados Unidos | SCCs + redaccion de PII previa al envio |
| Firebase | Estados Unidos | Google Cloud DPA + SCCs |

Documentamos cada transferencia conforme al Art. 54 LOPDP. Los clientes tienen derecho a conocer los paises de destino y las garantias aplicables.

---

## 5. Periodos de retencion

| Tipo de dato | Periodo de retencion | Fundamento |
|-------------|---------------------|-----------|
| Cuentas de usuario | Vigencia del contrato + 2 anos | Ejecucion del contrato + prescripcion |
| Datos de empresas clientes | Vigencia del contrato + 5 anos | Obligacion legal (Art. 37 LOPDP) |
| Evidencias documentales | 5 anos desde la fecha de carga | INV-3 del sistema. Requerimiento normativo |
| Bitacora de auditoria (audit_log) | 5 anos | Obligacion legal + defendibilidad |
| Certificados de capacitacion | Vigencia del contrato + 5 anos | Acreditacion ante la SPDP |
| Logs de sesion y acceso | 1 ano | Interes legitimo (seguridad) |
| Conversaciones con MARK AI | Vigencia del contrato + 2 anos | Auditabilidad del agente |

Al finalizar el periodo de retencion, los datos se eliminan de forma segura (borrado logico seguido de purga fisica en el siguiente ciclo de mantenimiento).

---

## 6. Medidas de seguridad

### 6.1 Tecnicas

| Medida | Implementacion |
|--------|---------------|
| Cifrado en transito | TLS 1.3 en todas las comunicaciones |
| Cifrado en reposo | Cifrado de disco en servidores de base de datos y almacenamiento |
| Cifrado de columnas sensibles | pgcrypto para columnas que pudieran contener datos de titulares |
| Hashing de contrasenas | argon2id con parametros seguros |
| Autenticacion de dos factores | TOTP obligatorio para roles con acceso a datos sensibles (DPO, LEGAL_ADMIN, SUPERADMIN) |
| Control de acceso | RBAC (7 roles) + RLS en PostgreSQL + aislamiento por tenant |
| Integridad de datos | Cadena de hash SHA-256 en evidencias y audit_log |
| Almacenamiento inmutable | Object-lock/WORM en bucket de evidencias |
| Rate limiting | Global y por endpoint (login, chat del agente, generacion de PDF) |
| Cabeceras de seguridad | Helmet, CSP estricta, sin unsafe-inline |
| Gestion de secretos | Variables de entorno. Prohibido .env en repositorio |

### 6.2 Organizativas

| Medida | Descripcion |
|--------|-------------|
| Principio de minimo privilegio | Cada rol accede solo a los datos que necesita |
| Separacion de roles de base de datos | `lexdata_app` (NOBYPASSRLS) para operacion, `postgres` solo para administracion |
| Redaccion de PII en logs | El logger elimina datos personales antes de enviar a Sentry y otros servicios |
| Revision de codigo | Pull requests con revision obligatoria antes de merge |
| Verificacion diaria de integridad | Job automatico `verify-chain` que valida la cadena de hash |
| Datos de prueba ficticios | Prohibido usar datos reales en desarrollo y testing |

---

## 7. Derechos del titular

Los usuarios del sistema (DPOs, colaboradores de clientes, administradores) pueden ejercer los siguientes derechos conforme a los Arts. 19-27 LOPDP:

| Derecho | Como ejercerlo |
|---------|---------------|
| **Acceso** | Solicitar que datos personales tenemos sobre usted | Escriba a dpo@lexdata.ec |
| **Rectificacion** | Corregir datos inexactos | Desde el perfil de usuario o escribiendo a dpo@lexdata.ec |
| **Cancelacion/Supresion** | Solicitar la eliminacion de sus datos | Escriba a dpo@lexdata.ec. Sujeto a periodos de retencion legal |
| **Oposicion** | Oponerse a un tratamiento especifico | Escriba a dpo@lexdata.ec |
| **Portabilidad** | Recibir sus datos en formato estructurado | Escriba a dpo@lexdata.ec |

### Plazo de respuesta

Conforme a la LOPDP, LEXDATA IA respondera a toda solicitud de ejercicio de derechos dentro de los **15 dias habiles** siguientes a la recepcion de la solicitud.

### Canal de contacto

**Correo:** dpo@lexdata.ec

**Responsable:** Dra. Andreina Almeida — DPO Certificada SPDP

---

## 8. Base legal por actividad de tratamiento (resumen RAT)

| Actividad | Base legal | Articulo LOPDP |
|-----------|-----------|---------------|
| Gestion de cuentas de usuario | Ejecucion del contrato | Art. 8 |
| Autenticacion y seguridad de acceso | Ejecucion del contrato + Interes legitimo | Art. 8, Art. 9 |
| Operacion del SGPDP del cliente | Ejecucion del contrato | Art. 8 |
| Bitacora de auditoria | Obligacion legal | Art. 37, Art. 42 |
| Registro ante la SPDP | Obligacion legal | Art. 37 |
| Calculo de indice Pd-VaR | Ejecucion del contrato | Art. 8 |
| Capacitaciones y certificados | Ejecucion del contrato | Art. 8 |
| Monitoreo de errores (Sentry) | Interes legitimo | Art. 9 |
| Notificaciones push (Firebase) | Consentimiento | Art. 7 |
| Asistencia con MARK AI | Ejecucion del contrato | Art. 8 |

---

## 9. Cambios a esta politica

Este documento se actualiza con cada version mayor del producto. Los cambios se notifican a los usuarios por correo electronico y se registran en el CHANGELOG del proyecto.

Ultima actualizacion: Septiembre 2026 (v0.6.0).
