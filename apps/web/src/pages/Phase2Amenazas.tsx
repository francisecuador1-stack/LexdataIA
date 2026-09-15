import { useState } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { TabBar } from '@/components/ui/TabBar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { NormativeBanner } from '@/components/ui/NormativeBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTratamientos, useActivos, useRiesgos, useMapaCalor, useEipd } from '@/hooks/useFases';
import { ShieldAlert, Database, AlertTriangle, Activity, FileWarning } from 'lucide-react';

const TABS = [
  { key: 'procesos', label: 'Procesos' },
  { key: 'rat', label: 'RAT' },
  { key: 'activos', label: 'Activos' },
  { key: 'categorias', label: 'Categorías' },
  { key: 'riesgos', label: 'Riesgos' },
  { key: 'eipd', label: 'EIPD' },
  { key: 'matriz', label: 'Matriz' },
  { key: 'mapa', label: 'Mapa de Calor' },
  { key: 'brechas', label: 'Brechas' },
  { key: 'reportes', label: 'Reportes' },
];

export function Phase2Amenazas() {
  const [tab, setTab] = useState('procesos');
  const { data: tratamientos, isLoading: loadingTrat } = useTratamientos();
  const { data: activos } = useActivos();
  const { data: riesgos } = useRiesgos();
  const { data: mapaCalor } = useMapaCalor();
  const { data: eipd } = useEipd();

  const tratList = (tratamientos as any)?.data as any[] | undefined;
  const activosList = (activos as any)?.data as any[] | undefined;
  const riesgosList = (riesgos as any)?.data as any[] | undefined;
  const eipdList = eipd as any[] | undefined;

  return (
    <div>
      <ModuleHeader
        ciclo="HACER"
        fase={2}
        title="Amenazas y Vulnerabilidades — Consola DPO"
        subtitle="Procesos · RAT · Activos · Categorías · Riesgos · EIPD/LIA · Matriz · Mapa de Calor · Brechas · Reportes"
        badges={[{ label: '2 EIPD obligatorias', variant: 'red' }]}
      />

      <TabBar tabs={TABS} activeKey={tab} onChange={setTab} />

      <div className="mt-6">
        {/* KPI Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard
            label="TRATAMIENTOS"
            value={(tratamientos as any)?.total ?? '—'}
            sub="procesos registrados"
            icon={Database}
          />
          <KpiCard
            label="ACTIVOS DE DATOS"
            value={(activos as any)?.total ?? '—'}
            sub="activos identificados"
            icon={Activity}
          />
          <KpiCard
            label="RIESGOS IDENTIFICADOS"
            value={(riesgos as any)?.total ?? '—'}
            sub={`${riesgosList?.filter((r: any) => r.nivel === 'CRITICO').length ?? 0} críticos`}
            tone={riesgosList?.some((r: any) => r.nivel === 'CRITICO') ? 'danger' : 'default'}
            icon={ShieldAlert}
          />
          <KpiCard
            label="EIPD PENDIENTES"
            value={(eipd as any[])?.filter((e: any) => e.estado === 'PENDIENTE').length ?? '—'}
            sub="evaluaciones de impacto"
            tone="warning"
            icon={FileWarning}
          />
          <KpiCard
            label="BRECHAS DETECTADAS"
            value="—"
            sub="controles sin evidencia"
            icon={AlertTriangle}
          />
        </div>

        {tab === 'procesos' && (
          <div>
            <NormativeBanner tone="info">
              Art. 51 LOPDP · Registro Nacional de Protección de Datos — Todo tratamiento de datos personales debe documentarse
              y registrarse conforme al principio de responsabilidad proactiva.
            </NormativeBanner>
            {loadingTrat ? (
              <EmptyState titulo="Cargando tratamientos…" />
            ) : (
              <DataTable
                columns={[
                  { key: 'codigo', header: 'Código', render: (r: any) => <span className="font-mono text-xs">{r.codigo}</span> },
                  { key: 'nombre', header: 'Tratamiento' },
                  { key: 'baseLegal', header: 'Base Legal', render: (r: any) => <Badge variant="blue">{r.baseLegal}</Badge> },
                  { key: 'categorias', header: 'Categorías', render: (r: any) => (
                    <div className="flex flex-wrap gap-1">
                      {(r.categorias as string[])?.slice(0, 2).map((c: string) => (
                        <Badge key={c} variant="slate">{c}</Badge>
                      ))}
                    </div>
                  )},
                  { key: 'estado', header: 'Estado', render: (r: any) => (
                    <Badge variant={r.estado === 'APROBADO' ? 'verificado' : r.estado === 'BLOQUEADO' ? 'bloqueado' : 'pendiente'}>
                      {r.estado}
                    </Badge>
                  )},
                  { key: 'riesgo', header: 'Riesgo', render: (r: any) => (
                    <Badge variant={r.nivelRiesgo?.toLowerCase() as any ?? 'slate'}>{r.nivelRiesgo ?? '—'}</Badge>
                  )},
                ]}
                data={tratList ?? []}
                emptyMessage="No hay tratamientos registrados"
              />
            )}
          </div>
        )}

        {tab === 'rat' && (
          <div>
            <NormativeBanner tone="legal">
              Registro de Actividades de Tratamiento (RAT) — Art. 37 LOPDP. Inventario obligatorio de todas las operaciones
              de tratamiento de datos personales.
            </NormativeBanner>
            <DataTable
              columns={[
                { key: 'codigo', header: 'Código' },
                { key: 'nombre', header: 'Actividad de Tratamiento' },
                { key: 'finalidad', header: 'Finalidad' },
                { key: 'baseLegal', header: 'Base Legal', render: (r: any) => <Badge variant="blue">{r.baseLegal}</Badge> },
                { key: 'responsable', header: 'Responsable' },
                { key: 'plazoConservacion', header: 'Plazo' },
              ]}
              data={tratList ?? []}
              emptyMessage="No hay actividades registradas en el RAT"
            />
          </div>
        )}

        {tab === 'activos' && (
          <div>
            <DataTable
              columns={[
                { key: 'codigo', header: 'Código', render: (r: any) => <span className="font-mono text-xs">{r.codigo}</span> },
                { key: 'nombre', header: 'Activo de Datos' },
                { key: 'tipo', header: 'Tipo', render: (r: any) => <Badge variant="slate">{r.tipo}</Badge> },
                { key: 'clasificacion', header: 'Clasificación', render: (r: any) => (
                  <Badge variant={r.clasificacion === 'SENSIBLE' ? 'red' : r.clasificacion === 'CONFIDENCIAL' ? 'amber' : 'slate'}>
                    {r.clasificacion}
                  </Badge>
                )},
                { key: 'ubicacion', header: 'Ubicación' },
                { key: 'estado', header: 'Estado', render: (r: any) => (
                  <Badge variant={r.estado === 'ACTIVO' ? 'verificado' : 'pendiente'}>{r.estado}</Badge>
                )},
              ]}
              data={activosList ?? []}
              emptyMessage="No hay activos de datos registrados"
            />
          </div>
        )}

        {tab === 'mapa' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Mapa de Calor de Riesgos</h3>
            {mapaCalor ? (
              <div>
                <div className="mb-4 grid grid-cols-5 gap-1">
                  {['Muy Alto', 'Alto', 'Medio', 'Bajo', 'Muy Bajo'].map((impacto, iRow) => (
                    ['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'].map((prob, iCol) => {
                      const intensity = (4 - iRow) + iCol;
                      const bg = intensity >= 6 ? 'bg-red-500' : intensity >= 4 ? 'bg-orange-400' : intensity >= 2 ? 'bg-yellow-300' : 'bg-green-300';
                      const count = (mapaCalor as any)?.celdas?.[`${iRow}-${iCol}`] ?? 0;
                      return (
                        <div key={`${iRow}-${iCol}`} className={`flex h-14 items-center justify-center rounded ${bg} text-xs font-bold text-white`}>
                          {count > 0 ? count : ''}
                        </div>
                      );
                    })
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Probabilidad →</span>
                  <span>↑ Impacto</span>
                </div>
              </div>
            ) : (
              <EmptyState titulo="Cargando mapa de calor…" />
            )}
          </div>
        )}

        {tab === 'riesgos' && (
          <div>
            <NormativeBanner tone="warning">
              Art. 37 LOPDP · Medidas de seguridad — Los riesgos identificados deben ser tratados con controles
              proporcionales. Los riesgos críticos y altos requieren atención prioritaria.
            </NormativeBanner>
            {riesgosList && (riesgosList as any[]).length > 0 ? (
              <DataTable
                columns={[
                  { key: 'tratamiento', header: 'Tratamiento', render: (r: any) => (
                    <span className="text-xs font-medium text-slate-700">{r.tratamiento?.nombre ?? '—'}</span>
                  )},
                  { key: 'activo', header: 'Activo', render: (r: any) => (
                    <span className="text-xs text-slate-600">{r.activo?.nombre ?? '—'}</span>
                  )},
                  { key: 'vulnerabilidadTexto', header: 'Vulnerabilidad', render: (r: any) => (
                    <span className="text-xs text-slate-600 line-clamp-2">{r.vulnerabilidadTexto ?? '—'}</span>
                  )},
                  { key: 'impacto', header: 'I', render: (r: any) => <span className="text-xs font-mono">{r.impacto}</span> },
                  { key: 'probabilidad', header: 'P', render: (r: any) => <span className="text-xs font-mono">{r.probabilidad}</span> },
                  { key: 'score', header: 'Score', render: (r: any) => <span className="text-xs font-bold">{r.score}</span> },
                  { key: 'nivel', header: 'Nivel', render: (r: any) => (
                    <Badge variant={r.nivel === 'CRITICO' ? 'red' : r.nivel === 'ALTO' ? 'amber' : r.nivel === 'MEDIO' ? 'blue' : 'green'}>
                      {r.nivel}
                    </Badge>
                  )},
                  { key: 'estado', header: 'Estado', render: (r: any) => (
                    <Badge variant={r.estado === 'MITIGADO' ? 'verificado' : 'pendiente'}>{r.estado}</Badge>
                  )},
                ]}
                data={riesgosList as any[]}
                emptyMessage="No hay riesgos registrados"
              />
            ) : (
              <EmptyState titulo="Sin riesgos registrados" descripcion="Los riesgos se generan al evaluar tratamientos y activos." />
            )}
          </div>
        )}

        {tab === 'eipd' && (
          <div>
            <NormativeBanner tone="info">
              Art. 42 LOPDP · Evaluación de Impacto — Obligatoria cuando el tratamiento implique datos sensibles
              a gran escala, decisiones automatizadas con elaboración de perfiles, o vigilancia sistemática.
            </NormativeBanner>
            {eipdList && (eipdList as any[]).length > 0 ? (
              <DataTable
                columns={[
                  { key: 'tratamiento', header: 'Tratamiento', render: (r: any) => (
                    <span className="text-xs font-medium text-slate-700">{r.tratamiento?.nombre ?? '—'}</span>
                  )},
                  { key: 'decision', header: 'Decisión', render: (r: any) => (
                    <Badge variant={r.decision === 'OBLIGATORIO' ? 'red' : 'green'}>{r.decision}</Badge>
                  )},
                  { key: 'puntajeMtge', header: 'Puntaje MTGE', render: (r: any) => (
                    <span className="text-xs font-mono">{r.puntajeMtge ?? '—'}</span>
                  )},
                  { key: 'estado', header: 'Estado', render: (r: any) => (
                    <Badge variant={r.estado === 'Completada' ? 'verificado' : r.estado === 'Pendiente' ? 'pendiente' : 'blue'}>
                      {r.estado}
                    </Badge>
                  )},
                  { key: 'granEscala', header: 'Gran escala', render: (r: any) => r.granEscala ? 'Sí' : 'No' },
                  { key: 'sensibles', header: 'Sensibles', render: (r: any) => r.sensibles ? 'Sí' : 'No' },
                  { key: 'menores', header: 'Menores', render: (r: any) => r.menores ? 'Sí' : 'No' },
                ]}
                data={eipdList as any[]}
                emptyMessage="No hay evaluaciones de impacto registradas"
              />
            ) : (
              <EmptyState titulo="Sin EIPD registradas" descripcion="Las EIPD se generan al identificar tratamientos de alto riesgo." />
            )}
          </div>
        )}

        {['categorias', 'matriz', 'brechas', 'reportes'].includes(tab) && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Vista de {TABS.find(t => t.key === tab)?.label} — En implementación.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
