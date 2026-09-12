# MARK AI — Agente DPO Operativo

## Inteligencia Artificial al servicio del cumplimiento normativo

**Documento dirigido a:** Abogados, DPOs, gerentes de cumplimiento y directivos de empresas clientes.

**Version:** 0.6.0 | **Fecha:** Septiembre 2026

---

## 1. Que es MARK AI

MARK AI es el agente de inteligencia artificial operativo de LEXDATA IA. Su funcion es asistir al Delegado de Proteccion de Datos (DPO) humano en las tareas operativas del Sistema de Gestion de Proteccion de Datos Personales (SGPDP), reduciendo la carga de trabajo repetitivo y mejorando la consistencia del analisis normativo.

MARK AI **no es un DPO virtual ni un sustituto del criterio humano.** Es una herramienta de apoyo operativo que trabaja bajo la supervision directa del DPO certificado ante la SPDP.

---

## 2. Que puede hacer MARK AI

### 2.1 Analizar

- **Busqueda normativa:** Consulta la biblioteca juridica completa (28 normas nacionales, 8 internacionales) con busqueda semantica. Toda cita normativa que genera se acompana del identificador de la norma y su hash SHA-256, lo que permite verificar que la fuente es autentica y no ha sido alterada.

- **Estado del RAT:** Revisa el Registro de Actividades de Tratamiento e identifica actividades sin base legal documentada, con plazos de conservacion vencidos o que requieren actualizacion.

- **Resumen de riesgos:** Analiza la matriz de riesgos consolidada e identifica los tratamientos con mayor exposicion, riesgos en zona roja (Alto/Critico) y evaluaciones de impacto pendientes.

- **Revision de hallazgos:** Consulta hallazgos abiertos, su severidad, la norma asociada y el tiempo que llevan sin resolver.

- **Estado de incidentes:** Monitorea incidentes activos, calcula el tiempo restante del reloj de 72 horas (Art. 41 LOPDP) y alerta sobre plazos criticos.

- **DPAs pendientes:** Identifica contratos de encargado del tratamiento (Data Processing Agreements) que requieren formalizacion o actualizacion.

- **Estado ARCO-PS:** Revisa solicitudes de ejercicio de derechos de los titulares y sus plazos de respuesta.

### 2.2 Documentar

- **Redaccion de borradores:** Genera borradores de documentos del SGPDP (politicas, procedimientos, informes) basados en la normativa aplicable y el contexto del cliente.

- **Propuesta de hallazgos:** Identifica posibles no conformidades y las formula como propuestas de hallazgo para revision del DPO.

### 2.3 Coordinar

- **Solicitudes de firma:** Cuando detecta que un documento o decision requiere la aprobacion del DPO, genera una solicitud formal que se registra en la cola de firmas pendientes.

- **Preguntas rapidas:** Ofrece respuestas inmediatas a consultas operativas frecuentes: "Hay brechas criticas?", "Documentos pendientes", "Proxima auditoria?", entre otras.

---

## 3. Que NO puede hacer MARK AI — y por que

Las siguientes acciones estan **excluidas por diseno** de las capacidades del agente. No se trata de una limitacion tecnica pendiente de resolver, sino de un requisito legal deliberado:

| Accion prohibida | Fundamento legal |
|------------------|-----------------|
| **Aprobar documentos** | La aprobacion de politicas, procedimientos e informes del SGPDP requiere la firma de un ser humano con responsabilidad legal. Un agente de IA no puede asumir responsabilidad juridica (Art. 42 LOPDP). |
| **Cerrar hallazgos** | El cierre de un hallazgo exige verificacion de eficacia por parte del DPO humano, con evidencia respaldada por hash criptografico (INV-6). La decision de que un hallazgo ha sido efectivamente remediado requiere juicio profesional. |
| **Cerrar recomendaciones** | Misma logica que el cierre de hallazgos: se requiere verificacion humana de eficacia en un ciclo posterior (RN-702). |
| **Validar tratamientos** | La validacion de un tratamiento en el RAT implica que el DPO certifica que la base legal es licita y que el tratamiento cumple con los principios del Art. 10 LOPDP. Esta certificacion es personal e intransferible. |
| **Firmar** | La firma (electronica o manuscrita) de cualquier documento del SGPDP es un acto juridico que solo puede realizar una persona natural con capacidad legal. |

**Principio rector:** La Ley Organica de Proteccion de Datos Personales del Ecuador establece que el DPO debe actuar con independencia y autonomia (Art. 42). Delegar decisiones de cumplimiento a un sistema automatizado contradiria este mandato y comprometeria la defendibilidad del SGPDP ante la Superintendencia de Proteccion de Datos Personales.

---

## 4. Como se supervisa a MARK AI

### 4.1 Supervision en tiempo real

El DPO humano supervisa la actividad del agente a traves de:

- **Ticker de actividad:** En la barra superior de la aplicacion se muestra en tiempo real la actividad actual del agente (ej: "Procesando hallazgos de auditoria para ciclo PHVA de mejora continua").

- **Panel del agente:** Al abrir el drawer derecho, el DPO puede ver el historial de conversacion, las acciones realizadas y las solicitudes pendientes.

- **Notificaciones:** Cuando MARK AI genera una solicitud de firma o detecta una situacion critica, el DPO recibe una notificacion en la campana del topbar.

### 4.2 Revision de propuestas

Todo lo que MARK AI produce (borradores, propuestas de hallazgo, solicitudes de firma) se presenta como **propuesta para revision**. El DPO puede:

- **Aprobar:** Aceptar la propuesta y ejecutar la accion correspondiente.
- **Modificar:** Editar el contenido antes de aprobarlo.
- **Rechazar:** Descartar la propuesta con un motivo documentado.

### 4.3 Mecanismo de pausa

Si el DPO considera necesario suspender temporalmente la actividad del agente (por ejemplo, durante una auditoria externa o una revision critica), puede solicitar la pausa del agente al administrador del sistema. La pausa es reversible y no afecta los datos ni el estado del SGPDP.

---

## 5. Como se audita a MARK AI

### 5.1 Bitacora de acciones

**Toda accion** realizada por MARK AI se registra en la bitacora de auditoria (`audit_log`) del sistema con los siguientes atributos:

| Campo | Valor |
|-------|-------|
| `actor_type` | `MARK_AI` |
| `accion` | Descripcion de la accion realizada |
| `entidad` | Tipo y ID del recurso afectado |
| `tenant_id` | Empresa sobre la que se actuo |
| `timestamp` | Marca temporal precisa |
| `hash` | Hash SHA-256 del registro |
| `prev_hash` | Hash del registro anterior (cadena de integridad) |

### 5.2 Cadena de integridad

Los registros de auditoria de MARK AI forman una **cadena de hash** (similar al concepto de blockchain): cada registro contiene el hash del registro anterior. Esto garantiza que:

- No se pueden eliminar registros intermedios sin romper la cadena.
- No se pueden modificar registros pasados sin que la alteracion sea detectable.
- Un job diario (`verify-chain`) valida la integridad de toda la cadena.

### 5.3 Diferenciacion de actores

En cualquier revision o auditoria, es posible distinguir con precision que acciones fueron realizadas por:

- **HUMANO:** Decisiones y acciones del DPO o de otros usuarios del sistema.
- **MARK_AI:** Analisis, propuestas y acciones operativas del agente.
- **SISTEMA:** Acciones automaticas del sistema (alertas, calculos, verificaciones).

### 5.4 Trazabilidad normativa

Cuando MARK AI cita una norma, la respuesta incluye:
- El identificador de la norma (`norma_id`)
- El hash SHA-256 del contenido normativo

Si el sistema de busqueda normativa (RAG) no encuentra soporte para una afirmacion, MARK AI **no completa de memoria**. En lugar de inventar, responde que no tiene base normativa cargada para esa consulta.

---

## 6. Manejo de datos

### 6.1 Que datos ve MARK AI

MARK AI accede unicamente a los datos del tenant (empresa) sobre el que esta operando el DPO. El acceso esta controlado por las mismas reglas de aislamiento (Row-Level Security) que aplican a todos los usuarios del sistema.

Los datos a los que puede acceder incluyen:
- Corpus normativo (normas, controles, principios)
- Registro de actividades de tratamiento (RAT)
- Matriz de riesgos
- Hallazgos e incidentes
- Estado de controles y evidencias
- Estado de capacitaciones

### 6.2 Como se construyen los prompts

Los prompts (instrucciones) que se envian al modelo de IA se construyen en el servidor, nunca en el cliente. El sistema:

1. Recibe la pregunta del DPO.
2. Busca en el corpus normativo la informacion relevante (RAG con pgvector).
3. Construye el prompt con la pregunta, el contexto normativo recuperado y las instrucciones del sistema.
4. Envia el prompt al modelo de IA (Anthropic API).
5. Recibe la respuesta y la registra en la bitacora.

El `tenant_id` se inyecta por el servidor en todas las herramientas del agente. El modelo de IA nunca puede especificar a que tenant acceder.

### 6.3 Datos almacenados por el proveedor de IA

LEXDATA IA utiliza la API de Anthropic (Claude) para el procesamiento de lenguaje natural. Conforme a la politica de uso de la API de Anthropic:

- Los datos enviados a traves de la API **no se utilizan para entrenar modelos**.
- Anthropic puede retener los datos temporalmente para fines de seguridad y deteccion de abuso, conforme a su politica de retencion publicada.
- No se envian datos personales de titulares al modelo de IA. Los prompts contienen metadatos del SGPDP (estados, conteos, categorias) pero no datos personales identificables.

---

## 7. Limitaciones y descargo de responsabilidad

### Limitaciones inherentes de la IA

MARK AI es un sistema de inteligencia artificial generativa. Como tal, presenta limitaciones que deben tenerse en cuenta:

- **Puede generar respuestas incorrectas.** Aunque el sistema esta disenado para basar sus respuestas en el corpus normativo verificado, existe la posibilidad de que una respuesta contenga imprecisiones. Por eso toda propuesta del agente requiere revision humana.

- **No sustituye el asesoramiento juridico.** Las respuestas de MARK AI no constituyen opinion legal ni asesoramiento profesional. El DPO y el equipo juridico de la empresa son los unicos responsables de las decisiones de cumplimiento.

- **El contexto tiene limites.** En conversaciones muy largas o con muchos documentos, el agente puede perder contexto de elementos mencionados anteriormente.

- **No tiene acceso a informacion externa en tiempo real.** MARK AI trabaja exclusivamente con la informacion contenida en el sistema (corpus normativo, datos del tenant). No consulta fuentes externas, registros judiciales ni bases de datos de terceros.

### Descargo

MARK AI es una herramienta de apoyo operativo. COGNITEX y LEXDATA IA no garantizan que el uso del agente asegure el cumplimiento normativo. La responsabilidad del cumplimiento de la LOPDP recae en el responsable del tratamiento y en el DPO designado conforme al Art. 42 de la Ley.

El uso del agente debe enmarcarse siempre en una estrategia de cumplimiento supervisada por profesionales certificados en proteccion de datos personales.
