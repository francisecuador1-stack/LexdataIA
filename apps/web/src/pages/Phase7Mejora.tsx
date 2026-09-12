import { useState } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { TabBar } from '@/components/ui/TabBar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { NormativeBanner } from '@/components/ui/NormativeBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMadurez, useRecomendaciones, useOportunidades, useLecciones } from '@/hooks/useFases';
import { TrendingUp, Target, Lightbulb, BookOpen, BarChart3 } from 'lucide-react';

const TABS = [
  { key: 'seguimiento', label: 'Seguimiento' },
  { key: 'recomendaciones', label: 'Recomend.' },
  { key: 'acciones', label: 'Acciones' },
  { key: 'verificacion', label: 'Verificación' },
  { key: 'kpis', label: 'KPIs' },
  { key: 'madurez', label: 'Madurez' },
  { key: 'tendencias', label: 'Tendencias' },
  { key: 'lecciones', label: 'Lecciones' },
  { key: 'reportes', label: 'Reportes' },
];

export function Phase7Mejora() {
  const [tab, setTab] = useState('seguimiento');
  const { data: madurez, isLoading: loadingMadurez } = useMadurez();
  const { data: recomendaciones } = useRecomendaciones();
  const { data: oportunidades } = useOportunidades();
  const { data: lecciones } = useLecciones();

  const mad = madurez as any;
  const recomList = (recomendaciones as any)?.data as any[] | undefined;
  const leccionesList = (lecciones as any)?.data as any[] | undefined;

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

      <TabBar tabs={TABS} activeKey={tab} onChange={setTab} />

      <div className="mt-6">
        {/* KPI Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard
            label="MADUREZ GLOBAL"
            value={mad?.valor ? `${mad.valor} / 5.0` : '—'}
            sub={mad?.etiqueta ?? '—'}
            icon={TrendingUp}
          />
          <KpiCard
            label="RECOMENDACIONES"
            value={recomList?.length ?? '—'}
            sub={`${recomList?.filter((r: any) => r.estado === 'ACTIVA').length ?? 0} activas`}
            tone={recomList?.some((r: any) => r.estado === 'ACTIVA') ? 'warning' : 'default'}
            icon={Target}
          />
          <KpiCard
            label="OPORTUNIDADES"
            value={(oportunidades as any)?.data?.length ?? '—'}
            sub="mejoras identificadas"
            icon={Lightbulb}
          />
          <KpiCard
            label="LECCIONES"
            value={leccionesList?.length ?? '—'}
            sub="aprendidas documentadas"
            icon={BookOpen}
          />
          <KpiCard
            label="TENDENCIA"
            value={mad?.tendencia ?? '—'}
            sub={mad?.deltaUltimoPeriodo ? `${mad.deltaUltimoPeriodo > 0 ? '+' : ''}${mad.deltaUltimoPeriodo}` : '—'}
            tone={mad?.deltaUltimoPeriodo > 0 ? 'success' : mad?.deltaUltimoPeriodo < 0 ? 'danger' : 'default'}
            icon={BarChart3}
          />
        </div>

        {tab === 'seguimiento' && (
          <div>
            <NormativeBanner tone="info">
              Ciclo PHVA — Fase ACTUAR · Mejora continua del SGPDP. Seguimiento de acciones correctivas, preventivas
              y de mejora para elevar el nivel de madurez del sistema.
            </NormativeBanner>
            {loadingMadurez ? (
              <EmptyState titulo="Cargando datos de seguimiento…" />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">Seguimiento del Ciclo PHVA</h3>
                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">PLANIFICAR</span>
                    <div className="mt-1 text-xl font-bold text-blue-800">{mad?.fases?.planificar ?? '—'}%</div>
                    <div className="mt-0.5 text-xs text-blue-600">F1-F4 completado</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">HACER</span>
                    <div className="mt-1 text-xl font-bold text-emerald-800">{mad?.fases?.hacer ?? '—'}%</div>
                    <div className="mt-0.5 text-xs text-emerald-600">F5 completado</div>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">VERIFICAR</span>
                    <div className="mt-1 text-xl font-bold text-amber-800">{mad?.fases?.verificar ?? '—'}%</div>
                    <div className="mt-0.5 text-xs text-amber-600">F6 completado</div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-purple-700">ACTUAR</span>
                    <div className="mt-1 text-xl font-bold text-purple-800">{mad?.fases?.actuar ?? '—'}%</div>
                    <div className="mt-0.5 text-xs text-purple-600">F7 completado</div>
                  </div>
                </div>

                {/* Madurez by dimension */}
                {mad?.dimensiones && (
                  <div>
                    <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Madurez por dimensión</h4>
                    <div className="space-y-2">
                      {(mad.dimensiones as any[]).map((d: any, i: number) => (
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'recomendaciones' && (
          <div>
            <DataTable
              columns={[
                { key: 'codigo', header: 'Código', render: (r: any) => <span className="font-mono text-xs">{r.codigo}</span> },
                { key: 'titulo', header: 'Recomendación' },
                { key: 'origen', header: 'Origen', render: (r: any) => <Badge variant="blue">{r.origen}</Badge> },
                { key: 'prioridad', header: 'Prioridad', render: (r: any) => (
                  <Badge variant={r.prioridad === 'ALTA' ? 'alto' : r.prioridad === 'MEDIA' ? 'medio' : 'bajo'}>
                    {r.prioridad}
                  </Badge>
                )},
                { key: 'responsable', header: 'Responsable' },
                { key: 'fechaLimite', header: 'Fecha Límite', render: (r: any) => (
                  <span className="text-xs">{r.fechaLimite ? new Date(r.fechaLimite).toLocaleDateString('es-EC') : '—'}</span>
                )},
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'COMPLETADA' ? 'verificado' : r.estado === 'ACTIVA' ? 'pendiente' : 'slate'}>
                    {r.estado}
                  </Badge>
                )},
              ]}
              data={recomList ?? []}
              emptyMessage="No hay recomendaciones registradas"
            />
          </div>
        )}

        {tab === 'lecciones' && (
          <div>
            <p className="mb-4 text-sm text-slate-600">Lecciones aprendidas del ciclo PHVA — Documentación de experiencias para mejora continua</p>
            <div className="space-y-2">
              {leccionesList?.map((l: any, i: number) => (
                <div key={l.id ?? i} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{l.titulo}</span>
                      <span className="ml-2 text-xs text-slate-500">{l.fase}</span>
                    </div>
                    <Badge variant={l.tipo === 'POSITIVA' ? 'green' : l.tipo === 'NEGATIVA' ? 'red' : 'slate'}>
                      {l.tipo}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{l.descripcion}</p>
                  {l.accionDerivada && (
                    <p className="mt-1 text-xs text-blue-600">Acción: {l.accionDerivada}</p>
                  )}
                </div>
              )) ?? <EmptyState titulo="No hay lecciones documentadas" icon={BookOpen} />}
            </div>
          </div>
        )}

        {['acciones', 'verificacion', 'kpis', 'madurez', 'tendencias', 'reportes'].includes(tab) && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Vista de {TABS.find(t => t.key === tab)?.label} — Contenido detallado del módulo F7 · Mejora Continua.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
