# Metodologia Pd-VaR — LEXDATA IA

## Indice de Riesgo de Privacidad para Priorizacion y Cotizacion

**Documento dirigido a:** Abogados, DPOs, gerentes comerciales y directivos de empresas clientes.

**Version:** 0.6.0 | **Fecha:** Septiembre 2026

---

## Declaracion importante

> **Pd-VaR (Privacy data Value-at-Risk) es un sistema de puntuacion heuristica para priorizacion y dimensionamiento de servicios de cumplimiento. NO es un modelo actuarial de valor en riesgo. No predice perdidas financieras, no calcula probabilidades estadisticas de siniestros ni estima exposicion monetaria. Su nombre es una analogia conceptual, no una equivalencia metodologica con el VaR financiero.**

---

## 1. Que mide Pd-VaR

Pd-VaR evalua la **exposicion al riesgo de privacidad** de una organizacion frente a la Ley Organica de Proteccion de Datos Personales (LOPDP) del Ecuador. El resultado se utiliza para:

1. **Priorizar:** Determinar que clientes requieren atencion mas urgente en la implementacion de su SGPDP.
2. **Dimensionar:** Estimar el esfuerzo y los recursos necesarios para la implementacion.
3. **Cotizar:** Generar una propuesta economica proporcional a la complejidad del caso.
4. **Clasificar:** Distinguir entre empresas de bajo riesgo (Caso A: lista de espera) y empresas que requieren servicio completo (Caso B).

---

## 2. Los 34 factores de entrada

El scoring se alimenta de la informacion proporcionada por el cliente en el Formulario SPDP (wizard de 7 secciones). Los factores se agrupan en 7 categorias:

### 2.1 Perfil organizacional (S1)

| Factor | Descripcion | Puntos |
|--------|-------------|--------|
| Sector de alto riesgo regulado | La empresa opera en salud/medicina o finanzas/banca/seguros, sectores con regulacion sectorial adicional a la LOPDP | 4 |
| Sector con regulacion sectorial complementaria | La empresa opera en gobierno, telecomunicaciones, educacion o comercio electronico | 2 |
| Gran empresa (200+ trabajadores) | Mayor volumen de datos internos (nomina, RRHH) y complejidad organizacional | 3 |
| Mediana empresa (50-199 trabajadores) | Complejidad organizacional moderada | 2 |
| Pequena empresa (10-49 trabajadores) | Complejidad organizacional basica | 1 |
| Red amplia de sucursales (10+) | Multiples puntos de recoleccion y tratamiento de datos, mayor riesgo de inconsistencias | 2 |
| Multiples sucursales (4-10) | Varios puntos de tratamiento | 1 |

### 2.2 Volumen de datos (S2)

| Factor | Descripcion | Puntos |
|--------|-------------|--------|
| Volumen masivo (>100.000 titulares) | Tratamiento a gran escala, uno de los criterios para EIPD obligatoria (Art. 39 LOPDP) | 6 |
| Volumen alto (10.000-100.000 titulares) | Volumen significativo que requiere controles robustos | 4 |
| Volumen moderado (1.000-10.000 titulares) | Volumen medio | 2 |
| Volumen reducido (<1.000 titulares) | Volumen basico | 1 |
| 5+ categorias de titulares distintas | Mayor diversidad de titulares implica multiples finalidades y bases legales | 3 |
| 3-4 categorias de titulares | Diversidad moderada | 2 |
| 1-2 categorias de titulares | Diversidad basica | 1 |

### 2.3 Datos sensibles y especiales (S3)

| Factor | Descripcion | Puntos |
|--------|-------------|--------|
| Datos de salud | Informacion medica, historias clinicas, resultados de examenes (Art. 26 LOPDP). Categoria de proteccion maxima | 5 |
| Datos de menores de edad | Informacion de ninos, ninas y adolescentes (Art. 25 LOPDP). Requiere consentimiento del representante legal y proteccion reforzada | 5 |
| Datos biometricos | Huellas dactilares, reconocimiento facial, iris y otros identificadores biometricos unicos | 4 |
| Datos geneticos | Informacion sobre el ADN, predisposiciones geneticas | 4 |
| Categorias especiales adicionales | Datos raciales, politicos, religiosos, sindicales, de orientacion sexual o penales. Se suman hasta un maximo de 5 puntos (2 puntos por cada categoria) | max 5 |

### 2.4 Tecnologia y automatizacion (S4)

| Factor | Descripcion | Puntos |
|--------|-------------|--------|
| Sistemas de inteligencia artificial | Uso de IA para procesar datos personales. Requiere evaluacion especifica conforme a ISO 42001 y Art. 29 LOPDP | 4 |
| Decisiones automatizadas sobre titulares | El sistema toma decisiones que producen efectos juridicos o similares sobre personas sin intervencion humana (Art. 29 LOPDP) | 3 |
| Elaboracion de perfiles de personas | Tratamiento automatizado para evaluar aspectos personales del titular (comportamiento, preferencias, ubicacion) | 3 |
| Transferencias internacionales de datos | Los datos personales se envian fuera del Ecuador. Requiere garantias del Art. 54 LOPDP (SCCs, nivel de adecuacion, etc.) | 4 |
| Proveedores cloud/SaaS en el extranjero | Uso de servicios en la nube alojados fuera del pais, lo que constituye transferencia internacional | 2 |

### 2.5 Madurez actual (S5)

Estos factores puntuan la **ausencia** de elementos de cumplimiento. Una empresa que ya los tiene parte con menor riesgo.

| Factor | Descripcion | Puntos |
|--------|-------------|--------|
| Sin RAT | No tiene Registro de Actividades de Tratamiento (Art. 37 LOPDP). Obligacion fundamental | 3 |
| Sin EIPD realizada | No ha realizado Evaluacion de Impacto en Proteccion de Datos cuando podria ser obligatoria | 2 |
| Sin LIA | No ha realizado evaluacion de interes legitimo cuando usa esa base legal | 1 |
| Sin politicas formales de privacidad | No tiene politica de proteccion de datos aprobada ni publicada | 3 |
| Sin DPO designado | No tiene Delegado de Proteccion de Datos designado ni notificado a la SPDP | 3 |

### 2.6 Operativa y experiencia (S6)

| Factor | Descripcion | Puntos |
|--------|-------------|--------|
| Carga ARCO+ muy alta (>100/ano) | Recibe mas de 100 solicitudes de ejercicio de derechos al ano. Requiere procesos robustos y automatizados | 4 |
| Carga ARCO+ alta (51-100/ano) | Volumen significativo de solicitudes | 3 |
| Carga ARCO+ moderada (10-50/ano) | Volumen medio | 2 |
| Carga ARCO+ reducida (<10/ano) | Volumen basico | 1 |
| Historial de incidentes critico (>5/ano) | Patron recurrente de brechas de seguridad. Indica debilidades estructurales | 5 |
| Historial de incidentes alto (3-5/ano) | Incidentes frecuentes | 3 |
| Incidentes de seguridad previos (1-2/ano) | Incidentes aislados | 2 |

### 2.7 Gobernanza y antecedentes (S7)

| Factor | Descripcion | Puntos |
|--------|-------------|--------|
| Sin compromiso documentado de la alta direccion | La direccion no ha formalizado su compromiso con el cumplimiento de la LOPDP. Requisito de la ISO 27701 §5.1 | 3 |
| Sin comite interno de privacidad | No existe un grupo formal responsable de la gobernanza de datos personales | 1 |
| Antecedentes de reclamos de titulares | Ciudadanos han presentado quejas o reclamos por el tratamiento de sus datos | 4 |
| Sanciones o advertencias previas de la SPDP | La Superintendencia de Proteccion de Datos Personales ha sancionado o advertido a la empresa. Factor de mayor peso en el scoring | 6 |

---

## 3. Calculo del puntaje

### 3.1 Formula

```
Total = Suma de puntos de todos los factores aplicables
Pd-VaR Score = min(100, round(Total / 85 * 100))
```

El valor **85** es el techo de referencia: representa un caso hipotetico de exposicion extrema donde concurren casi todos los factores de riesgo. El score se normaliza a una escala de 0 a 100.

### 3.2 Umbrales y niveles de riesgo

| Nivel | Rango | Interpretacion |
|-------|-------|---------------|
| **Bajo** | 0 — 19 | Organizacion con exposicion reducida. Pocas categorias de datos, volumen bajo, sin factores agravantes. |
| **Medio** | 20 — 39 | Exposicion moderada. Requiere implementacion estructurada del SGPDP pero sin urgencia critica. |
| **Alto** | 40 — 64 | Exposicion significativa. Multiples factores de riesgo presentes. Implementacion prioritaria recomendada. |
| **Critico** | 65 — 100 | Exposicion maxima. Combinacion de datos sensibles, gran volumen, tecnologia avanzada y/o antecedentes regulatorios. Atencion inmediata requerida. |

---

## 4. Clasificacion de casos

### Caso A — Lista de espera

Se clasifica como Caso A (micro-empresa de bajo riesgo) cuando:
- La empresa tiene 1 a 9 trabajadores (o no se especifica), **Y**
- No trata datos de salud, biometricos ni de menores, **Y**
- No usa inteligencia artificial ni tiene transferencias internacionales, **Y**
- No tiene otros factores agravantes de alto riesgo.

**Resultado:** La empresa se registra en la lista de espera prioritaria y sera contactada cuando el servicio de implementacion simplificado este disponible.

### Caso B — Servicio completo

Cualquier empresa que no cumpla las condiciones del Caso A se clasifica como Caso B y recibe una cotizacion completa de implementacion del SGPDP.

---

## 5. Derivacion de honorarios

Los honorarios mensuales se calculan a partir de una tarifa base ajustada por el nivel de riesgo y factores agravantes:

### 5.1 Tarifa base (por tamano de empresa)

| Tamano | Trabajadores | Tarifa base (USD/mes) |
|--------|-------------|----------------------|
| Micro | 1-9 | 380 |
| Pequena | 10-49 | 550 |
| Mediana | 50-199 | 750 |
| Grande | 200+ | 1.100 |

### 5.2 Multiplicador por nivel de riesgo

| Nivel de riesgo | Multiplicador |
|-----------------|---------------|
| Bajo | 1.00 |
| Medio | 1.15 |
| Alto | 1.30 |
| Critico | 1.55 |

### 5.3 Adicionales por factores especificos

| Condicion | Adicional (USD/mes) |
|-----------|-------------------|
| Datos de salud o datos de menores | +100 |
| Uso de IA o decisiones automatizadas | +75 |
| Transferencias internacionales de datos | +50 |
| Sanciones previas de la SPDP | +150 |

### 5.4 Calculo final

```
Honorario mensual = round((Base * Multiplicador + Adicionales) / 50) * 50
```

El resultado se redondea al multiplo de 50 USD mas cercano.

**Fee de implementacion inicial:** USD 5.400 (pago unico que cubre la configuracion del SGPDP, el diagnostico inicial y la documentacion base).

### 5.5 Ejemplo

Una empresa mediana (120 trabajadores), sector salud, que trata datos de pacientes (salud + menores), con transferencias internacionales a AWS, sin RAT ni EIPD, con un incidente previo:

| Factor | Puntos |
|--------|--------|
| Sector de alto riesgo (salud) | 4 |
| Mediana empresa | 2 |
| Datos de salud | 5 |
| Datos de menores | 5 |
| Transferencias internacionales | 4 |
| Cloud extranjero (AWS) | 2 |
| Sin RAT | 3 |
| Sin EIPD | 2 |
| Incidentes previos (1-2) | 2 |
| **Total** | **29** |

Pd-VaR Score = min(100, round(29/85 * 100)) = **34** → **Medio**

Honorario = round((750 * 1.15 + 100 + 50) / 50) * 50 = round(1012.5 / 50) * 50 = **USD 1.050/mes**

---

## 6. Desglose del resultado

El formulario muestra al cliente:

1. **Indice Pd-VaR** con puntaje numerico y nivel de riesgo (con codigo de color).
2. **Tabla de factores** ordenados por peso descendente, donde el cliente puede ver que elementos contribuyen mas a su puntaje.
3. **Cotizacion** con honorario mensual y fee de implementacion.
4. **Proximos pasos** segun la clasificacion (Caso A o Caso B).

---

## 7. Limitaciones del scoring

### Que no mide Pd-VaR

- **No predice perdidas financieras.** No estima cuanto costaria un incidente de seguridad ni una sancion de la SPDP.
- **No es una evaluacion de cumplimiento.** Un puntaje bajo no significa que la empresa cumple con la LOPDP; significa que su perfil de riesgo es menor.
- **No es una EIPD.** La Evaluacion de Impacto en Proteccion de Datos (Art. 39 LOPDP) es un proceso formal con requisitos especificos que no puede suplirse con un scoring automatizado.
- **No considera factores cualitativos.** La cultura organizacional, la calidad de los procesos existentes, la experiencia del equipo y otros factores cualitativos no se capturan en el formulario.

### Cuando el DPO debe sobrescribir el score

El DPO puede y debe ajustar la clasificacion de riesgo cuando:

- El cliente tiene circunstancias atenuantes que el formulario no captura (ej. certificacion ISO 27001 vigente).
- El cliente tiene circunstancias agravantes no contempladas (ej. investigacion abierta por autoridad reguladora sectorial).
- El sector del cliente tiene regulacion especifica que modifica el analisis (ej. normativa de la Superintendencia de Bancos).
- La informacion proporcionada por el cliente es inconsistente con la realidad operativa observada.

La sobrescritura del score queda registrada en el sistema con la justificacion del DPO y es auditable.

---

## 8. Actualizacion de la metodologia

Los pesos, umbrales y factores del Pd-VaR se revisan periodicamente conforme a:

- Cambios en la normativa ecuatoriana (nuevas resoluciones de la SPDP o del SGPDP).
- Experiencia acumulada en implementaciones reales.
- Retroalimentacion del equipo de DPOs.

Toda actualizacion se documenta con su version, fecha y justificacion.
