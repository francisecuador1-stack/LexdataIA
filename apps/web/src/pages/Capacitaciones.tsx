import { ModuleHeader } from '@/components/ModuleHeader';

export function Capacitaciones() {
  return (
    <div>
      <ModuleHeader
        ciclo="CAPACITACIONES"
        title="Capacitaciones"
        subtitle="E-Learning · Evaluación de conocimientos · Certificación virtual · Central de cumplimiento · Informes DPO"
        badges={[
          { label: '10/12 evaluaciones aprobadas', variant: 'green' },
          { label: '8 módulos disponibles', variant: 'blue' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Contenido en construcción</p>
      </div>
    </div>
  );
}
