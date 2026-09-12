import { ModuleHeader } from '@/components/ModuleHeader';

export function Phase6Auditoria() {
  return (
    <div>
      <ModuleHeader
        ciclo="VERIFICAR"
        fase={6}
        title="Monitoreo y Revisión — Auditoría"
        subtitle="Monitoreo · Auditorías · Revisiones · Checklist · Hallazgos · Indicadores · Incidentes · Evidencias · Reportes"
        badges={[
          { label: '1 hallazgo abierto', variant: 'red' },
          { label: '1 incidente activo', variant: 'red' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Contenido en construcción</p>
      </div>
    </div>
  );
}
