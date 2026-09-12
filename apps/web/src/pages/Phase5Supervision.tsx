import { ModuleHeader } from '@/components/ModuleHeader';

export function Phase5Supervision() {
  return (
    <div>
      <ModuleHeader
        ciclo="HACER"
        fase={5}
        title="Implementación y Supervisión"
        subtitle="Controles Implementados · Medidas · Evidencias · Evaluación · Hallazgos · Recomendaciones · Planes · Reportes"
        badges={[
          { label: '1 hallazgo abierto', variant: 'red' },
          { label: '2 controles sin evidencia', variant: 'amber' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Contenido en construcción</p>
      </div>
    </div>
  );
}
