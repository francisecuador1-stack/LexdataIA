# ADR-0001: La base de datos es la fuente de verdad del corpus normativo

- **Estado:** Aceptada
- **Fecha:** 2026-09-14
- **Decisor:** Francisco Jácome (Gerente General, COGNITEX)

## Contexto

Hasta ahora, el corpus normativo (36 normas) vive exclusivamente en archivos YAML
en `packages/legal-corpus/corpus/` con un `corpus.lock.json` que verifica integridad
SHA-256. El seed (`prisma/seed.ts`) carga estos YAML a la base de datos al arrancar.

La tarea RN-004 introduce una ventana de administración donde `LEGAL_ADMIN` sube
PDFs, revisa artículos extraídos y publica normas verificadas directamente en la
base de datos. Si mantenemos los YAML como fuente de verdad, tendríamos dos fuentes
que se desincronizan.

## Decisión

**A partir de esta ADR, la base de datos es la fuente de verdad en runtime.**

Los YAML pasan a ser:

1. **Semilla de arranque** para entornos nuevos (`prisma/seed.ts` sigue funcionando).
2. **Artefacto exportado** desde la base, vía `POST /corpus/admin/exportar`, que
   regenera los YAML y el `corpus.lock.json` con hashes recalculados.

## Consecuencias

- `loadAndVerifyCorpus()` sigue intacta como control de integridad del artefacto
  versionado en git. No se modifica.
- `prisma/seed.ts` usa los YAML para bootstrap; no se rompe.
- Las normas publicadas vía UI se exportan al repo cuando `LEGAL_ADMIN` lo decide.
  El commit del YAML exportado es responsabilidad del administrador.
- Las normas con `textoVerificado = false` (los 36 placeholders actuales) quedan
  excluidas de la búsqueda semántica hasta que se cargue su contenido real.
- `NormaVersion` guarda el historial de cambios; nunca se borran normas publicadas.

## Alternativas consideradas

1. **Mantener YAML como fuente de verdad** — Rechazada: obligaría a que toda edición
   pase por git, eliminando la ventaja de la UI de administración.
2. **Sincronización bidireccional** — Rechazada: complejidad innecesaria y riesgo
   de conflictos entre la UI y cambios manuales en el repo.
