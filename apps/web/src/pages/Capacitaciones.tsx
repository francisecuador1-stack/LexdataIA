import { useState } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { TabBar } from '@/components/ui/TabBar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { NormativeBanner } from '@/components/ui/NormativeBanner';
import { GraduationCap, BookOpen, Award, FileText } from 'lucide-react';

const TABS = [
  { key: 'elearning', label: 'E-Learning' },
  { key: 'central', label: 'Central' },
  { key: 'informe', label: 'Informe DPO' },
];

const MODULOS = [
  { id: '1', codigo: 'CAP-001', titulo: 'Fundamentos LOPDP', duracion: '45 min', tipo: 'Obligatorio', estado: 'COMPLETADO', aprobados: 12, total: 12 },
  { id: '2', codigo: 'CAP-002', titulo: 'Derechos ARCO+', duracion: '30 min', tipo: 'Obligatorio', estado: 'COMPLETADO', aprobados: 10, total: 12 },
  { id: '3', codigo: 'CAP-003', titulo: 'Tratamiento de datos sensibles', duracion: '60 min', tipo: 'Obligatorio', estado: 'EN_CURSO', aprobados: 8, total: 12 },
  { id: '4', codigo: 'CAP-004', titulo: 'Seguridad de la información', duracion: '45 min', tipo: 'Obligatorio', estado: 'EN_CURSO', aprobados: 6, total: 12 },
  { id: '5', codigo: 'CAP-005', titulo: 'Gestión de incidentes', duracion: '30 min', tipo: 'Recomendado', estado: 'PENDIENTE', aprobados: 0, total: 12 },
  { id: '6', codigo: 'CAP-006', titulo: 'EIPD/LIA Evaluaciones de impacto', duracion: '60 min', tipo: 'DPO', estado: 'PENDIENTE', aprobados: 0, total: 3 },
  { id: '7', codigo: 'CAP-007', titulo: 'Transferencias internacionales', duracion: '45 min', tipo: 'Recomendado', estado: 'PENDIENTE', aprobados: 0, total: 12 },
  { id: '8', codigo: 'CAP-008', titulo: 'Auditoría interna SGPDP', duracion: '60 min', tipo: 'DPO', estado: 'PENDIENTE', aprobados: 0, total: 3 },
];

export function Capacitaciones() {
  const [tab, setTab] = useState('elearning');

  const completados = MODULOS.filter(m => m.estado === 'COMPLETADO').length;
  const enCurso = MODULOS.filter(m => m.estado === 'EN_CURSO').length;

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

      <TabBar tabs={TABS} activeKey={tab} onChange={setTab} />

      <div className="mt-6">
        {/* KPI Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="MÓDULOS DISPONIBLES"
            value={MODULOS.length}
            sub="cursos en plataforma"
            icon={BookOpen}
          />
          <KpiCard
            label="COMPLETADOS"
            value={completados}
            sub={`${Math.round((completados / MODULOS.length) * 100)}% del programa`}
            tone="success"
            icon={GraduationCap}
          />
          <KpiCard
            label="EN CURSO"
            value={enCurso}
            sub="módulos activos"
            icon={BookOpen}
          />
          <KpiCard
            label="CERTIFICACIONES"
            value="10/12"
            sub="evaluaciones aprobadas"
            icon={Award}
          />
        </div>

        {tab === 'elearning' && (
          <div>
            <NormativeBanner tone="info">
              Art. 47 LOPDP · Capacitación — El responsable del tratamiento garantizará que el personal que intervenga
              en el tratamiento de datos personales reciba la formación adecuada.
            </NormativeBanner>
            <DataTable
              columns={[
                { key: 'codigo', header: 'Código', render: (r: any) => <span className="font-mono text-xs">{r.codigo}</span> },
                { key: 'titulo', header: 'Módulo' },
                { key: 'duracion', header: 'Duración' },
                { key: 'tipo', header: 'Tipo', render: (r: any) => (
                  <Badge variant={r.tipo === 'Obligatorio' ? 'red' : r.tipo === 'DPO' ? 'purple' : 'slate'}>
                    {r.tipo}
                  </Badge>
                )},
                { key: 'progreso', header: 'Progreso', render: (r: any) => (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${(r.aprobados / r.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">{r.aprobados}/{r.total}</span>
                  </div>
                )},
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'COMPLETADO' ? 'verificado' : r.estado === 'EN_CURSO' ? 'pendiente' : 'slate'}>
                    {r.estado}
                  </Badge>
                )},
              ]}
              data={MODULOS as any}
            />
          </div>
        )}

        {tab === 'central' && (
          <div>
            <NormativeBanner tone="legal">
              Central de Cumplimiento — Repositorio de materiales, políticas y guías de referencia para la
              formación continua en protección de datos personales.
            </NormativeBanner>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { titulo: 'Política de Protección de Datos', tipo: 'Política', estado: 'Vigente' },
                { titulo: 'Manual del DPO', tipo: 'Manual', estado: 'Vigente' },
                { titulo: 'Guía de Derechos ARCO+', tipo: 'Guía', estado: 'Vigente' },
                { titulo: 'Protocolo de Incidentes', tipo: 'Protocolo', estado: 'En revisión' },
                { titulo: 'Procedimiento EIPD', tipo: 'Procedimiento', estado: 'Vigente' },
                { titulo: 'Plantilla de Consentimiento', tipo: 'Plantilla', estado: 'Vigente' },
              ].map((doc, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="blue">{doc.tipo}</Badge>
                    <Badge variant={doc.estado === 'Vigente' ? 'vigente' : 'pendiente'}>{doc.estado}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-800">{doc.titulo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'informe' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Informe de Capacitaciones para el DPO</h3>
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Cobertura</span>
                <div className="mt-1 text-xl font-bold text-slate-800">83%</div>
                <div className="mt-0.5 text-xs text-slate-500">del personal capacitado</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Tasa de Aprobación</span>
                <div className="mt-1 text-xl font-bold text-slate-800">92%</div>
                <div className="mt-0.5 text-xs text-slate-500">evaluaciones aprobadas</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Horas Formación</span>
                <div className="mt-1 text-xl font-bold text-slate-800">36h</div>
                <div className="mt-0.5 text-xs text-slate-500">total acumulado</div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Informe generado automáticamente. Próxima actualización programada tras finalización de módulos en curso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
