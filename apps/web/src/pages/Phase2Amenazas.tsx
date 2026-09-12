import { ModuleHeader } from '@/components/ModuleHeader';

export function Phase2Amenazas() {
  return (
    <div>
      <ModuleHeader
        ciclo="HACER"
        fase={2}
        title="Amenazas y Vulnerabilidades — Consola DPO"
        subtitle="Procesos · RAT · Activos · Categorías · Riesgos · EIPD/LIA · Matriz · Mapa de Calor · Brechas · Reportes"
        badges={[{ label: '2 EIPD obligatorias', variant: 'red' }]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Contenido en construcción</p>
      </div>
    </div>
  );
}
