import { ModuleHeader } from '@/components/ModuleHeader';

export function Phase4Definicion() {
  return (
    <div>
      <ModuleHeader
        ciclo="PLANIFICAR"
        fase={4}
        title="Definición — Marco Estratégico"
        subtitle="Controles · Medidas técnicas/organizativas/jurídicas · Evidencias · Evaluación · Hallazgos · Planes · Reporte"
        badges={[{ label: '1 tratamiento bloqueado', variant: 'amber' }]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Contenido en construcción</p>
      </div>
    </div>
  );
}
