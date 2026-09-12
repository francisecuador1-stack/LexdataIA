import { useState } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { TabBar } from '@/components/ui/TabBar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { NormativeBanner } from '@/components/ui/NormativeBanner';
import { useMatriz } from '@/hooks/useCorpus';
import { useBrechaControles } from '@/hooks/useFases';
import { ShieldCheck, Lock, FileCheck, Scale, AlertTriangle } from 'lucide-react';

const TABS = [
  { key: 'controles', label: 'Controles' },
  { key: 'tecnicas', label: 'Téc.' },
  { key: 'organizativas', label: 'Org.' },
  { key: 'juridicas', label: 'Jurídicas' },
  { key: 'evidencias', label: 'Evidencias' },
  { key: 'evaluacion', label: 'Evaluación' },
  { key: 'hallazgos', label: 'Hallazgos' },
  { key: 'planes', label: 'Planes' },
  { key: 'reporte', label: 'Reporte' },
];

export function Phase4Definicion() {
  const [tab, setTab] = useState('controles');
  const { data: matriz } = useMatriz('PLANIFICAR');
  const { data: brecha } = useBrechaControles();

  const matrizList = (matriz as any[]) ?? [];
  const brechaData = brecha as any;

  return (
    <div>
      <ModuleHeader
        ciclo="PLANIFICAR"
        fase={4}
        title="Definición — Marco Estratégico"
        subtitle="Controles · Medidas técnicas/organizativas/jurídicas · Evidencias · Evaluación · Hallazgos · Planes · Reporte"
        badges={[{ label: '1 tratamiento bloqueado', variant: 'amber' }]}
      />

      <TabBar tabs={TABS} activeKey={tab} onChange={setTab} />

      <div className="mt-6">
        {/* KPI Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard
            label="CONTROLES DEFINIDOS"
            value={matrizList.length}
            sub="controles del marco"
            icon={ShieldCheck}
          />
          <KpiCard
            label="MEDIDAS TÉCNICAS"
            value={matrizList.filter((c: any) => c.tipoMedida === 'TECNICA').length || '—'}
            sub="cifrado, acceso, backup"
            icon={Lock}
          />
          <KpiCard
            label="MEDIDAS ORGANIZATIVAS"
            value={matrizList.filter((c: any) => c.tipoMedida === 'ORGANIZATIVA').length || '—'}
            sub="políticas, procesos"
            icon={FileCheck}
          />
          <KpiCard
            label="MEDIDAS JURÍDICAS"
            value={matrizList.filter((c: any) => c.tipoMedida === 'JURIDICA').length || '—'}
            sub="contratos, cláusulas"
            icon={Scale}
          />
          <KpiCard
            label="BRECHAS CONTROL"
            value={brechaData?.totalBrechas ?? '—'}
            sub="sin evidencia"
            tone={brechaData?.totalBrechas > 0 ? 'warning' : 'default'}
            icon={AlertTriangle}
          />
        </div>

        {tab === 'controles' && (
          <div>
            <NormativeBanner tone="legal">
              Art. 37-42 LOPDP · Marco de controles — Definición de medidas técnicas, organizativas y jurídicas
              para garantizar el cumplimiento de la normativa de protección de datos personales.
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
                { key: 'fasePHVA', header: 'Fase', render: (r: any) => <Badge variant="blue">{r.fasePHVA}</Badge> },
                { key: 'evidenciaRequerida', header: 'Evidencia requerida' },
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'IMPLEMENTADO' ? 'verificado' : r.estado === 'EN_PROCESO' ? 'pendiente' : 'no-verificado'}>
                    {r.estado ?? 'PENDIENTE'}
                  </Badge>
                )},
              ]}
              data={matrizList}
              emptyMessage="No hay controles definidos para esta fase"
            />
          </div>
        )}

        {tab === 'tecnicas' && (
          <div>
            <NormativeBanner tone="info">
              Medidas técnicas de seguridad — Cifrado, control de acceso, pseudonimización, copias de seguridad,
              segmentación de red y demás controles tecnológicos.
            </NormativeBanner>
            <DataTable
              columns={[
                { key: 'codigo', header: 'Código', render: (r: any) => <span className="font-mono text-xs">{r.codigo ?? r.identificador}</span> },
                { key: 'titulo', header: 'Medida Técnica' },
                { key: 'descripcion', header: 'Descripción' },
                { key: 'evidenciaRequerida', header: 'Evidencia' },
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'IMPLEMENTADO' ? 'verificado' : 'pendiente'}>
                    {r.estado ?? 'PENDIENTE'}
                  </Badge>
                )},
              ]}
              data={matrizList.filter((c: any) => c.tipoMedida === 'TECNICA')}
              emptyMessage="No hay medidas técnicas definidas"
            />
          </div>
        )}

        {tab === 'organizativas' && (
          <div>
            <NormativeBanner tone="info">
              Medidas organizativas — Políticas internas, procesos de gestión, capacitación, designación de roles
              y responsabilidades en materia de protección de datos.
            </NormativeBanner>
            <DataTable
              columns={[
                { key: 'codigo', header: 'Código', render: (r: any) => <span className="font-mono text-xs">{r.codigo ?? r.identificador}</span> },
                { key: 'titulo', header: 'Medida Organizativa' },
                { key: 'descripcion', header: 'Descripción' },
                { key: 'evidenciaRequerida', header: 'Evidencia' },
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'IMPLEMENTADO' ? 'verificado' : 'pendiente'}>
                    {r.estado ?? 'PENDIENTE'}
                  </Badge>
                )},
              ]}
              data={matrizList.filter((c: any) => c.tipoMedida === 'ORGANIZATIVA')}
              emptyMessage="No hay medidas organizativas definidas"
            />
          </div>
        )}

        {['juridicas', 'evidencias', 'evaluacion', 'hallazgos', 'planes', 'reporte'].includes(tab) && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Vista de {TABS.find(t => t.key === tab)?.label} — Contenido detallado del módulo F4 · Definición.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
