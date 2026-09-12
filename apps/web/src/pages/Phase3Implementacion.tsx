import { useState } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { TabBar } from '@/components/ui/TabBar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { NormativeBanner } from '@/components/ui/NormativeBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDiagnostico, useGobierno, useRolesSgpdp, useRecursos, useBrechas } from '@/hooks/useFases';
import { ClipboardCheck, Users, Building2, FolderOpen, AlertTriangle } from 'lucide-react';

const TABS = [
  { key: 'diagnostico', label: 'Diagnóstico' },
  { key: 'gobierno', label: 'Gobierno' },
  { key: 'roles', label: 'Roles' },
  { key: 'recursos', label: 'Recursos' },
  { key: 'evidencias', label: 'Evidencias' },
  { key: 'brechas', label: 'Brechas' },
  { key: 'recomendaciones', label: 'Recomendaciones' },
  { key: 'informe', label: 'Informe' },
];

export function Phase3Implementacion() {
  const [tab, setTab] = useState('diagnostico');
  const { data: diagnostico, isLoading: loadingDiag } = useDiagnostico();
  const { data: gobierno } = useGobierno();
  const { data: roles } = useRolesSgpdp();
  const { data: recursos } = useRecursos();
  const { data: brechas } = useBrechas();

  const diag = diagnostico as any;
  const brechasList = (brechas as any)?.data as any[] | undefined;

  return (
    <div>
      <ModuleHeader
        ciclo="PLANIFICAR"
        fase={3}
        title="Implementación Inicial"
        subtitle="Diagnóstico organizacional · Gobierno · Roles · Recursos · Evidencias · Brechas · Recomendaciones · Informe"
      />

      <TabBar tabs={TABS} activeKey={tab} onChange={setTab} />

      <div className="mt-6">
        {/* KPI Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard
            label="MADUREZ DIAGNÓSTICO"
            value={diag?.nivelMadurez ?? '—'}
            sub={diag?.etiqueta ?? 'evaluando'}
            icon={ClipboardCheck}
          />
          <KpiCard
            label="ESTRUCTURA GOBIERNO"
            value={(gobierno as any[])?.length ?? '—'}
            sub="órganos definidos"
            icon={Building2}
          />
          <KpiCard
            label="ROLES ASIGNADOS"
            value={(roles as any[])?.length ?? '—'}
            sub="personas con rol SGPDP"
            icon={Users}
          />
          <KpiCard
            label="RECURSOS"
            value={(recursos as any[])?.length ?? '—'}
            sub="recursos asignados"
            icon={FolderOpen}
          />
          <KpiCard
            label="BRECHAS"
            value={brechasList?.length ?? '—'}
            sub="brechas identificadas"
            tone={brechasList && brechasList.length > 0 ? 'warning' : 'default'}
            icon={AlertTriangle}
          />
        </div>

        {tab === 'diagnostico' && (
          <div>
            <NormativeBanner tone="info">
              Art. 47 LOPDP · Medidas de seguridad — El responsable del tratamiento implementará medidas técnicas y organizativas
              apropiadas. El diagnóstico es el primer paso para identificar el nivel de madurez.
            </NormativeBanner>
            {loadingDiag ? (
              <EmptyState titulo="Cargando diagnóstico…" />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">Diagnóstico Organizacional SGPDP</h3>
                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Nivel de Madurez</span>
                    <div className="mt-1 text-xl font-bold text-slate-800">{diag?.nivelMadurez ?? '—'} / 5</div>
                    <div className="mt-0.5 text-xs text-slate-500">{diag?.etiqueta ?? '—'}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Cumplimiento</span>
                    <div className="mt-1 text-xl font-bold text-slate-800">{diag?.cumplimiento ?? '—'}%</div>
                    <div className="mt-0.5 text-xs text-slate-500">de requisitos LOPDP</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Áreas Evaluadas</span>
                    <div className="mt-1 text-xl font-bold text-slate-800">{diag?.areasEvaluadas ?? '—'}</div>
                    <div className="mt-0.5 text-xs text-slate-500">departamentos</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Fecha Evaluación</span>
                    <div className="mt-1 text-xl font-bold text-slate-800">{diag?.fechaEvaluacion ? new Date(diag.fechaEvaluacion).toLocaleDateString('es-EC') : '—'}</div>
                    <div className="mt-0.5 text-xs text-slate-500">última evaluación</div>
                  </div>
                </div>

                {diag?.dimensiones && (
                  <div>
                    <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Dimensiones evaluadas</h4>
                    <div className="space-y-2">
                      {(diag.dimensiones as any[]).map((d: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-40 text-xs text-slate-600">{d.nombre}</span>
                          <div className="flex-1">
                            <div className="h-2 rounded-full bg-slate-100">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${(d.valor / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="w-12 text-right text-xs font-medium text-slate-700">{d.valor}/5</span>
                          <Badge variant={d.valor >= 4 ? 'green' : d.valor >= 2.5 ? 'amber' : 'red'}>
                            {d.valor >= 4 ? 'Bueno' : d.valor >= 2.5 ? 'Regular' : 'Bajo'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'gobierno' && (
          <div>
            <NormativeBanner tone="legal">
              Estructura de gobierno del SGPDP — Definición de la organización, comités, y órganos de supervisión
              para la protección de datos personales.
            </NormativeBanner>
            <DataTable
              columns={[
                { key: 'nombre', header: 'Órgano / Comité' },
                { key: 'tipo', header: 'Tipo', render: (r: any) => <Badge variant="blue">{r.tipo}</Badge> },
                { key: 'responsable', header: 'Responsable' },
                { key: 'frecuencia', header: 'Frecuencia de reunión' },
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'ACTIVO' ? 'verificado' : 'pendiente'}>{r.estado}</Badge>
                )},
              ]}
              data={(gobierno as any[]) ?? []}
              emptyMessage="No hay estructura de gobierno definida"
            />
          </div>
        )}

        {tab === 'roles' && (
          <div>
            <DataTable
              columns={[
                { key: 'rol', header: 'Rol SGPDP', render: (r: any) => <Badge variant="purple">{r.rol}</Badge> },
                { key: 'nombre', header: 'Persona Asignada' },
                { key: 'area', header: 'Área / Departamento' },
                { key: 'responsabilidades', header: 'Responsabilidades principales' },
                { key: 'fechaAsignacion', header: 'Fecha', render: (r: any) => (
                  <span className="text-xs">{r.fechaAsignacion ? new Date(r.fechaAsignacion).toLocaleDateString('es-EC') : '—'}</span>
                )},
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'ACTIVO' ? 'verificado' : 'pendiente'}>{r.estado}</Badge>
                )},
              ]}
              data={(roles as any[]) ?? []}
              emptyMessage="No hay roles asignados"
            />
          </div>
        )}

        {['recursos', 'evidencias', 'brechas', 'recomendaciones', 'informe'].includes(tab) && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Vista de {TABS.find(t => t.key === tab)?.label} — Contenido detallado del módulo F3 · Implementación Inicial.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
