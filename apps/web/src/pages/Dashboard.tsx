import { ModuleHeader } from '@/components/ModuleHeader';

export function Dashboard() {
  return (
    <div>
      <ModuleHeader
        ciclo="ANÁLISIS"
        title="Dashboard de Cumplimiento PHVA"
        subtitle="Sistema SGPDP · LOPDP Ecuador · Actualización jul 2026"
        badges={[{ label: 'Atención requerida', variant: 'amber' }]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Dashboard en construcción — Visión General, F1–F7</p>
      </div>
    </div>
  );
}
