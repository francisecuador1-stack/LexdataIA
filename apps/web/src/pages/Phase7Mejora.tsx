import { ModuleHeader } from '@/components/ModuleHeader';

export function Phase7Mejora() {
  return (
    <div>
      <ModuleHeader
        ciclo="ACTUAR"
        fase={7}
        title="Mejora Continua — Cierre del Ciclo PHVA"
        subtitle="Seguimiento · Recomendaciones · Acciones · Verificación · KPIs · Madurez · Tendencias · Lecciones · Reportes"
        badges={[
          { label: 'Madurez 2.7/5 — Definido', variant: 'blue' },
          { label: '3 recomendaciones activas', variant: 'amber' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Contenido en construcción</p>
      </div>
    </div>
  );
}
