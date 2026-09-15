import { useState } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { TabBar } from '@/components/ui/TabBar';
import { Badge } from '@/components/ui/Badge';
import { useClienteResumen } from '@/hooks/useClientes';
import { useMadurez } from '@/hooks/useFases';
import { Activity, Shield, FileCheck, AlertTriangle, TrendingUp } from 'lucide-react';

const TABS = [
  { key: 'vision', label: 'Visión General' },
  { key: 'f1', label: 'F1 · Normas', badge: 'P' },
  { key: 'f2', label: 'F2 · Riesgos', badge: 'P' },
  { key: 'f3', label: 'F3 · Implementación', badge: 'P' },
  { key: 'f4', label: 'F4 · Definición', badge: 'P' },
  { key: 'f5', label: 'F5 · Supervisión', badge: 'H' },
  { key: 'f6', label: 'F6 · Auditoría', badge: 'V' },
  { key: 'f7', label: 'F7 · Mejora', badge: 'A' },
];

export function Dashboard() {
  const [tab, setTab] = useState('vision');
  const { data: resumen, isLoading } = useClienteResumen();
  const { data: madurez } = useMadurez();

  const kpis = (resumen as any)?.kpis;

  return (
    <div>
      <ModuleHeader
        ciclo="ANÁLISIS"
        title="Dashboard de Cumplimiento PHVA"
        subtitle={`Sistema SGPDP · LOPDP Ecuador · Actualización ${new Date().toLocaleDateString('es-EC', { month: 'short', year: 'numeric' })}`}
        badges={[{ label: 'Atención requerida', variant: 'amber' }]}
      />

      <TabBar tabs={TABS} activeKey={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === 'vision' && (
          <div>
            {/* 5 KPI cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <KpiCard
                label="ESTADO SGPDP"
                value="Atención requerida"
                sub={`Definido · ${(madurez as any)?.valor ?? '—'}/5`}
                tone="warning"
                icon={Activity}
              />
              <KpiCard
                label="MADUREZ GLOBAL"
                value={`${(madurez as any)?.valor ?? '—'} / 5.0`}
                sub={(madurez as any)?.etiqueta ?? '—'}
                icon={TrendingUp}
              />
              <KpiCard
                label="CUMPLIMIENTO DOC."
                value={isLoading ? '—' : kpis?.controlesTotales > 0
                  ? `${Math.round((kpis.controlesImplementados / kpis.controlesTotales) * 100)}%`
                  : '0%'}
                sub={`${kpis?.controlesImplementados ?? 0} de ${kpis?.controlesTotales ?? 0} controles`}
                icon={FileCheck}
              />
              <KpiCard
                label="HALLAZGOS ABIERTOS"
                value={kpis?.hallazgosAbiertos ?? '—'}
                sub="0 críticos"
                tone={kpis?.hallazgosAbiertos > 0 ? 'warning' : 'default'}
                icon={AlertTriangle}
              />
              <KpiCard
                label="RIESGOS CRÍTICOS"
                value={kpis?.riesgosCriticos ?? '—'}
                sub={`${kpis?.riesgosTotal ?? 0} total`}
                tone={kpis?.riesgosCriticos > 0 ? 'danger' : 'default'}
                icon={Shield}
              />
            </div>

            {/* Progress by module */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Progreso por módulo
              </h3>
              <div className="space-y-3">
                {['F1 · Normas', 'F2 · Riesgos', 'F3 · Implementación', 'F4 · Definición', 'F5 · Supervisión', 'F6 · Auditoría', 'F7 · Mejora'].map((f, i) => {
                  const pcts = [80, 40, 60, 60, 40, 60, 40];
                  const pct = pcts[i] ?? 0;
                  const levels = ['Controlado', 'Gestionado', 'Definido', 'Definido', 'Gestionado', 'Definido', 'Gestionado'];
                  return (
                    <div key={f} className="flex items-center gap-3">
                      <span className="w-32 text-xs text-slate-600">{f}</span>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="w-8 text-right text-xs font-medium text-slate-700">{pct}%</span>
                      <Badge variant="slate">{levels[i]}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab !== 'vision' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Vista de fase {tab.toUpperCase()} — KPIs, gráfico principal y detalle del ciclo PHVA.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
