import { useState } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { TabBar } from '@/components/ui/TabBar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { NormativeBanner } from '@/components/ui/NormativeBanner';
import { useMatriz } from '@/hooks/useCorpus';
import { useBrechaControles } from '@/hooks/useFases';
import { ShieldCheck, Eye, FileCheck, AlertTriangle, CheckCircle } from 'lucide-react';

const TABS = [
  { key: 'controles', label: 'Controles' },
  { key: 'tecnicas', label: 'Téc.' },
  { key: 'organizativas', label: 'Org.' },
  { key: 'juridicas', label: 'Jurídicas' },
  { key: 'evidencias', label: 'Evidencias' },
  { key: 'evaluacion', label: 'Evaluación' },
  { key: 'hallazgos', label: 'Hallazgos' },
  { key: 'recomendaciones', label: 'Recom.' },
  { key: 'planes', label: 'Planes' },
  { key: 'reportes', label: 'Reportes' },
];

export function Phase5Supervision() {
  const [tab, setTab] = useState('controles');
  const { data: matriz } = useMatriz('HACER');
  const { data: brecha } = useBrechaControles();

  const matrizList = (matriz as any[]) ?? [];
  const brechaData = brecha as any;
  const implementados = matrizList.filter((c: any) => c.estado === 'IMPLEMENTADO').length;
  const sinEvidencia = matrizList.filter((c: any) => !c.evidencia).length;

  return (
    <div>
      <ModuleHeader
        ciclo="HACER"
        fase={5}
        title="Implementación y Supervisión"
        subtitle="Controles Implementados · Medidas · Evidencias · Evaluación · Hallazgos · Recomendaciones · Planes · Reportes"
        badges={[
          { label: '1 hallazgo abierto', variant: 'red' },
          { label: '2 controles sin evidencia', variant: 'amber' },
        ]}
      />

      <TabBar tabs={TABS} activeKey={tab} onChange={setTab} />

      <div className="mt-6">
        {/* KPI Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard
            label="CONTROLES FASE H"
            value={matrizList.length}
            sub="controles en supervisión"
            icon={ShieldCheck}
          />
          <KpiCard
            label="IMPLEMENTADOS"
            value={implementados}
            sub={`${matrizList.length > 0 ? Math.round((implementados / matrizList.length) * 100) : 0}% completado`}
            tone="success"
            icon={CheckCircle}
          />
          <KpiCard
            label="EN SUPERVISIÓN"
            value={matrizList.filter((c: any) => c.estado === 'EN_SUPERVISION').length || '—'}
            sub="monitoreo activo"
            icon={Eye}
          />
          <KpiCard
            label="SIN EVIDENCIA"
            value={sinEvidencia || '—'}
            sub="requieren documentación"
            tone={sinEvidencia > 0 ? 'warning' : 'default'}
            icon={FileCheck}
          />
          <KpiCard
            label="HALLAZGOS"
            value={brechaData?.hallazgosAbiertos ?? '—'}
            sub="abiertos"
            tone={brechaData?.hallazgosAbiertos > 0 ? 'danger' : 'default'}
            icon={AlertTriangle}
          />
        </div>

        {tab === 'controles' && (
          <div>
            <NormativeBanner tone="info">
              Fase HACER — Supervisión de la implementación efectiva de controles. Verificación de que las medidas
              técnicas, organizativas y jurídicas definidas en F4 están operativas.
            </NormativeBanner>
            <DataTable
              columns={[
                { key: 'codigo', header: 'Código', render: (r: any) => <span className="font-mono text-xs">{r.codigo ?? r.identificador}</span> },
                { key: 'titulo', header: 'Control' },
                { key: 'tipoMedida', header: 'Tipo', render: (r: any) => (
                  <Badge variant={r.tipoMedida === 'TECNICA' ? 'blue' : r.tipoMedida === 'ORGANIZATIVA' ? 'purple' : 'green'}>
                    {r.tipoMedida}
                  </Badge>
                )},
                { key: 'responsable', header: 'Responsable' },
                { key: 'evidencia', header: 'Evidencia', render: (r: any) => (
                  r.evidencia
                    ? <Badge variant="verificado">Documentada</Badge>
                    : <Badge variant="pendiente">Pendiente</Badge>
                )},
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'IMPLEMENTADO' ? 'verificado' : r.estado === 'EN_SUPERVISION' ? 'blue' : 'pendiente'}>
                    {r.estado ?? 'PENDIENTE'}
                  </Badge>
                )},
              ]}
              data={matrizList}
              emptyMessage="No hay controles en fase de supervisión"
            />
          </div>
        )}

        {tab === 'tecnicas' && (
          <div>
            <DataTable
              columns={[
                { key: 'codigo', header: 'Código', render: (r: any) => <span className="font-mono text-xs">{r.codigo ?? r.identificador}</span> },
                { key: 'titulo', header: 'Medida Técnica' },
                { key: 'responsable', header: 'Responsable' },
                { key: 'fechaImplementacion', header: 'Implementación', render: (r: any) => (
                  <span className="text-xs">{r.fechaImplementacion ? new Date(r.fechaImplementacion).toLocaleDateString('es-EC') : '—'}</span>
                )},
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'IMPLEMENTADO' ? 'verificado' : 'pendiente'}>{r.estado ?? 'PENDIENTE'}</Badge>
                )},
              ]}
              data={matrizList.filter((c: any) => c.tipoMedida === 'TECNICA')}
              emptyMessage="No hay medidas técnicas en supervisión"
            />
          </div>
        )}

        {['organizativas', 'juridicas', 'evidencias', 'evaluacion', 'hallazgos', 'recomendaciones', 'planes', 'reportes'].includes(tab) && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Vista de {TABS.find(t => t.key === tab)?.label} — Contenido detallado del módulo F5 · Supervisión.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
