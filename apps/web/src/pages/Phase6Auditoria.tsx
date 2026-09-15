import { useState } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { TabBar } from '@/components/ui/TabBar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { NormativeBanner } from '@/components/ui/NormativeBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCentroMonitoreo, useAuditorias, useIncidentes, useIndicadores } from '@/hooks/useFases';
import { Monitor, ClipboardList, AlertTriangle, BarChart3, ShieldAlert } from 'lucide-react';

const TABS = [
  { key: 'monitoreo', label: 'Monitoreo' },
  { key: 'auditorias', label: 'Auditorías' },
  { key: 'revisiones', label: 'Revisiones' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'hallazgos', label: 'Hallazgos' },
  { key: 'indicadores', label: 'Indicadores' },
  { key: 'incidentes', label: 'Incidentes' },
  { key: 'evidencias', label: 'Evidencias' },
  { key: 'reportes', label: 'Reportes' },
];

export function Phase6Auditoria() {
  const [tab, setTab] = useState('monitoreo');
  const { data: monitoreo, isLoading: loadingMon } = useCentroMonitoreo();
  const { data: auditorias } = useAuditorias();
  const { data: incidentes } = useIncidentes();
  const { data: indicadores } = useIndicadores();

  const mon = monitoreo as any;
  const auditList = (auditorias as any)?.data as any[] | undefined;
  const incidentesList = (incidentes as any)?.data as any[] | undefined;
  const indData = indicadores as any;

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

      <TabBar tabs={TABS} activeKey={tab} onChange={setTab} />

      <div className="mt-6">
        {/* KPI Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard
            label="ESTADO MONITOREO"
            value={mon?.estado ?? '—'}
            sub={mon?.ultimaRevision ? `Última: ${new Date(mon.ultimaRevision).toLocaleDateString('es-EC')}` : '—'}
            icon={Monitor}
          />
          <KpiCard
            label="AUDITORÍAS"
            value={auditList?.length ?? '—'}
            sub={`${auditList?.filter((a: any) => a.estado === 'COMPLETADA').length ?? 0} completadas`}
            icon={ClipboardList}
          />
          <KpiCard
            label="HALLAZGOS ABIERTOS"
            value={mon?.hallazgosAbiertos ?? '—'}
            sub={`${mon?.hallazgosCriticos ?? 0} críticos`}
            tone={mon?.hallazgosCriticos > 0 ? 'danger' : mon?.hallazgosAbiertos > 0 ? 'warning' : 'default'}
            icon={AlertTriangle}
          />
          <KpiCard
            label="INCIDENTES"
            value={incidentesList?.filter((i: any) => i.estado === 'ACTIVO').length ?? '—'}
            sub="activos"
            tone={incidentesList?.some((i: any) => i.estado === 'ACTIVO') ? 'danger' : 'default'}
            icon={ShieldAlert}
          />
          <KpiCard
            label="INDICADORES"
            value={indData?.cumplimientoGlobal ? `${indData.cumplimientoGlobal}%` : '—'}
            sub="cumplimiento global"
            icon={BarChart3}
          />
        </div>

        {tab === 'monitoreo' && (
          <div>
            <NormativeBanner tone="warning">
              Art. 47-48 LOPDP · Monitoreo continuo — El responsable del tratamiento debe verificar periódicamente
              la eficacia de las medidas de seguridad implementadas y documentar los resultados.
            </NormativeBanner>
            {loadingMon ? (
              <EmptyState titulo="Cargando centro de monitoreo…" />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">Centro de Monitoreo SGPDP</h3>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Estado General</span>
                    <div className="mt-1 text-lg font-bold text-slate-800">{mon?.estado ?? '—'}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Controles Monitoreados</span>
                    <div className="mt-1 text-lg font-bold text-slate-800">{mon?.controlesMonitoreados ?? '—'}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Alertas Activas</span>
                    <div className="mt-1 text-lg font-bold text-slate-800">{mon?.alertasActivas ?? '—'}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Próxima Revisión</span>
                    <div className="mt-1 text-lg font-bold text-slate-800">
                      {mon?.proximaRevision ? new Date(mon.proximaRevision).toLocaleDateString('es-EC') : '—'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Hallazgos Abiertos</span>
                    <div className="mt-1 text-lg font-bold text-slate-800">{mon?.hallazgosAbiertos ?? '—'}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Incidentes Activos</span>
                    <div className="mt-1 text-lg font-bold text-slate-800">{mon?.incidentesActivos ?? '—'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'auditorias' && (
          <div>
            <NormativeBanner tone="legal">
              Programa de auditorías del SGPDP — Verificación independiente del cumplimiento de la LOPDP
              y la eficacia de las medidas implementadas.
            </NormativeBanner>
            <DataTable
              columns={[
                { key: 'codigo', header: 'Código', render: (r: any) => <span className="font-mono text-xs">{r.codigo}</span> },
                { key: 'titulo', header: 'Auditoría' },
                { key: 'tipo', header: 'Tipo', render: (r: any) => <Badge variant={r.tipo === 'INTERNA' ? 'blue' : 'purple'}>{r.tipo}</Badge> },
                { key: 'alcance', header: 'Alcance' },
                { key: 'fechaProgramada', header: 'Fecha', render: (r: any) => (
                  <span className="text-xs">{r.fechaProgramada ? new Date(r.fechaProgramada).toLocaleDateString('es-EC') : '—'}</span>
                )},
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'COMPLETADA' ? 'verificado' : r.estado === 'EN_CURSO' ? 'blue' : 'pendiente'}>
                    {r.estado}
                  </Badge>
                )},
                { key: 'hallazgos', header: 'Hallazgos', render: (r: any) => (
                  <span className="text-xs font-medium">{r.totalHallazgos ?? 0}</span>
                )},
              ]}
              data={auditList ?? []}
              emptyMessage="No hay auditorías registradas"
            />
          </div>
        )}

        {tab === 'incidentes' && (
          <div>
            <NormativeBanner tone="warning">
              Art. 43 LOPDP · Notificación de vulneraciones — Las vulneraciones de seguridad deben notificarse
              a la Superintendencia de Protección de Datos en el término de 5 días, y al titular en 3 días (Art. 46).
            </NormativeBanner>
            <DataTable
              columns={[
                { key: 'codigo', header: 'Código', render: (r: any) => <span className="font-mono text-xs">{r.codigo}</span> },
                { key: 'titulo', header: 'Incidente' },
                { key: 'severidad', header: 'Severidad', render: (r: any) => (
                  <Badge variant={r.severidad === 'CRITICA' ? 'critica' : r.severidad === 'MAYOR' ? 'mayor' : 'menor'}>
                    {r.severidad}
                  </Badge>
                )},
                { key: 'fechaDeteccion', header: 'Detección', render: (r: any) => (
                  <span className="text-xs">{r.fechaDeteccion ? new Date(r.fechaDeteccion).toLocaleDateString('es-EC') : '—'}</span>
                )},
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'RESUELTO' ? 'verificado' : r.estado === 'ACTIVO' ? 'red' : 'pendiente'}>
                    {r.estado}
                  </Badge>
                )},
                { key: 'notificado', header: 'Notificado', render: (r: any) => (
                  <Badge variant={r.notificadoSPDP ? 'verificado' : 'no-verificado'}>
                    {r.notificadoSPDP ? 'Sí' : 'No'}
                  </Badge>
                )},
              ]}
              data={incidentesList ?? []}
              emptyMessage="No hay incidentes registrados"
            />
          </div>
        )}

        {['revisiones', 'checklist', 'hallazgos', 'indicadores', 'evidencias', 'reportes'].includes(tab) && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Vista de {TABS.find(t => t.key === tab)?.label} — Contenido detallado del módulo F6 · Auditoría.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
