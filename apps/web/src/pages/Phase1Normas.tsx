import { ModuleHeader } from '@/components/ModuleHeader';

export function Phase1Normas() {
  return (
    <div>
      <ModuleHeader
        ciclo="PLANIFICAR"
        fase={1}
        title="Motor de Conocimiento Normativo"
        subtitle="Biblioteca jurídica dual · 36 normas · Nacional + Internacional"
        badges={[{ label: 'RN-004', variant: 'blue' }]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Contenido en construcción</p>
      </div>
    </div>
  );
}
