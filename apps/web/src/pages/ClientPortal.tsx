import { ModuleHeader } from '@/components/ModuleHeader';

export function ClientPortal() {
  return (
    <div>
      <ModuleHeader
        ciclo="PORTAL DEL CLIENTE · LOPDP"
        title="Diagnóstico PIMS · LOPDP Ecuador"
        subtitle="Evaluación de madurez en 10 pasos — Sistema de Gestión de Protección de Datos Personales"
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Contenido en construcción</p>
      </div>
    </div>
  );
}
