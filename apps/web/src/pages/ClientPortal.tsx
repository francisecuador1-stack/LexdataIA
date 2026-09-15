import { useState } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { TabBar } from '@/components/ui/TabBar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { NormativeBanner } from '@/components/ui/NormativeBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useClienteResumen, useDerivacionDocumental } from '@/hooks/useClientes';
import { useMadurez } from '@/hooks/useFases';
import { ClipboardCheck, Building2, FileText, MessageSquare, TrendingUp, Download, Eye, Trash2, XCircle } from 'lucide-react';

const TABS = [
  { key: 'diagnostico', label: 'Diagnóstico PIMS' },
  { key: 'empresa', label: 'Mi Empresa' },
  { key: 'documentos', label: 'Mis Documentos' },
  { key: 'asistente', label: 'Asistente' },
];

const DIMENSIONES_PIMS = [
  { nombre: 'Liderazgo y compromiso', valor: 3.2, peso: 15 },
  { nombre: 'Contexto de la organización', valor: 2.8, peso: 10 },
  { nombre: 'Planificación', valor: 2.5, peso: 12 },
  { nombre: 'Soporte y recursos', valor: 3.0, peso: 10 },
  { nombre: 'Operación del SGPDP', valor: 2.2, peso: 15 },
  { nombre: 'Evaluación del desempeño', valor: 1.8, peso: 13 },
  { nombre: 'Mejora continua', valor: 2.0, peso: 10 },
  { nombre: 'Derechos del titular', valor: 3.5, peso: 8 },
  { nombre: 'Seguridad de la información', valor: 2.4, peso: 5 },
  { nombre: 'Transferencias internacionales', valor: 1.5, peso: 2 },
];

export function ClientPortal() {
  const [tab, setTab] = useState('diagnostico');
  const { data: resumen, isLoading } = useClienteResumen();
  const { data: madurez } = useMadurez();
  const { data: documentos } = useDerivacionDocumental();

  const res = resumen as any;
  const mad = madurez as any;
  const docList = documentos as any[] | undefined;

  const promedioMadurez = DIMENSIONES_PIMS.reduce((acc, d) => acc + d.valor, 0) / DIMENSIONES_PIMS.length;

  return (
    <div>
      <ModuleHeader
        ciclo="PORTAL DEL CLIENTE · LOPDP"
        title="Diagnóstico PIMS · LOPDP Ecuador"
        subtitle="Evaluación de madurez en 10 pasos — Sistema de Gestión de Protección de Datos Personales"
      />

      <TabBar tabs={TABS} activeKey={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === 'diagnostico' && (
          <div>
            <NormativeBanner tone="info">
              Diagnóstico PIMS (Privacy Information Management System) — Evaluación del nivel de madurez
              del sistema de gestión de protección de datos personales conforme a LOPDP e ISO/IEC 27701.
            </NormativeBanner>

            {/* KPI Row */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard
                label="MADUREZ PIMS"
                value={`${promedioMadurez.toFixed(1)} / 5.0`}
                sub="promedio ponderado"
                icon={TrendingUp}
              />
              <KpiCard
                label="DIMENSIONES"
                value={DIMENSIONES_PIMS.length}
                sub="áreas evaluadas"
                icon={ClipboardCheck}
              />
              <KpiCard
                label="NIVEL"
                value={promedioMadurez >= 4 ? 'Optimizado' : promedioMadurez >= 3 ? 'Definido' : promedioMadurez >= 2 ? 'Gestionado' : 'Inicial'}
                sub="clasificación general"
                icon={Building2}
              />
              <KpiCard
                label="DOCUMENTOS"
                value={docList?.length ?? '—'}
                sub="en derivación"
                icon={FileText}
              />
            </div>

            {/* Dimensiones */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">Evaluación por Dimensión PIMS</h3>
              <div className="space-y-3">
                {DIMENSIONES_PIMS.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-medium text-slate-500">{i + 1}.</span>
                    <span className="w-56 text-xs text-slate-700">{d.nombre}</span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${d.valor >= 3.5 ? 'bg-green-500' : d.valor >= 2.5 ? 'bg-blue-500' : d.valor >= 1.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${(d.valor / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right text-xs font-medium text-slate-700">{d.valor}/5</span>
                    <span className="w-10 text-right text-[10px] text-slate-400">{d.peso}%</span>
                    <Badge variant={d.valor >= 3.5 ? 'green' : d.valor >= 2.5 ? 'blue' : d.valor >= 1.5 ? 'amber' : 'red'}>
                      {d.valor >= 3.5 ? 'Bueno' : d.valor >= 2.5 ? 'Regular' : d.valor >= 1.5 ? 'Bajo' : 'Crítico'}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-semibold text-slate-700">Promedio ponderado</span>
                <span className="text-sm font-bold text-slate-800">{promedioMadurez.toFixed(1)} / 5.0</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'empresa' && (
          <div>
            {isLoading ? (
              <EmptyState titulo="Cargando datos de la empresa…" icon={Building2} />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">Datos de Mi Empresa</h3>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Razón Social</span>
                    <div className="mt-1 text-sm font-medium text-slate-800">{(res as any)?.cliente?.razonSocial ?? 'No registrado'}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">RUC</span>
                    <div className="mt-1 text-sm font-medium text-slate-800">{(res as any)?.cliente?.ruc ?? 'No registrado'}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Sector</span>
                    <div className="mt-1 text-sm font-medium text-slate-800">{(res as any)?.cliente?.sector ?? 'No registrado'}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Ciudad</span>
                    <div className="mt-1 text-sm font-medium text-slate-800">{(res as any)?.cliente?.ciudad ?? 'No registrado'}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Nivel de Riesgo</span>
                    <div className="mt-1">
                      <Badge variant={(res as any)?.cliente?.nivelRiesgo === 'ALTO' || (res as any)?.cliente?.nivelRiesgo === 'CRITICO' ? 'alto' : (res as any)?.cliente?.nivelRiesgo === 'MEDIO' ? 'medio' : 'bajo'}>
                        {(res as any)?.cliente?.nivelRiesgo ?? 'No registrado'}
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Madurez SGPDP</span>
                    <div className="mt-1 text-sm font-medium text-slate-800">{mad?.valor ?? '—'} / 5.0</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'documentos' && (
          <DocumentosTab docList={docList} />
        )}

        {tab === 'asistente' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="mb-3 h-10 w-10 text-blue-400" />
              <h3 className="text-sm font-medium text-slate-700">Asistente LEXDATA IA</h3>
              <p className="mt-1 max-w-sm text-center text-xs text-slate-400">
                Consulte sobre normativa LOPDP, estado de su SGPDP, o solicite ayuda con cualquier módulo del sistema.
                El asistente usa inteligencia artificial para responder con base en la normativa vigente.
              </p>
              <div className="mt-6 w-full max-w-lg">
                <div className="flex gap-2">
                  <input
                    placeholder="Escriba su consulta sobre protección de datos…"
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-400"
                    disabled
                  />
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white" disabled>
                    Enviar
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-400">Asistente en implementación — Disponible próximamente</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Documents Tab with Actions (N1) ───────────────────

function DocumentosTab({ docList }: { docList: any[] | undefined }) {
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteMotivo, setDeleteMotivo] = useState('');

  const handleDelete = () => {
    if (!deleteMotivo.trim()) return;
    // TODO: call DELETE /documentos/:id with motivo when backend is implemented
    // For now, show confirmation
    alert(`Documento "${deleteTarget?.titulo}" marcado para eliminación.\nMotivo: ${deleteMotivo}\n\n(Pendiente: endpoint backend de soft delete)`);
    setDeleteTarget(null);
    setDeleteMotivo('');
  };

  return (
    <div>
      <NormativeBanner tone="legal">
        Derivación documental — Documentos generados por el sistema SGPDP para su organización.
        La trazabilidad y el hash de integridad se registran al generar cada documento.
      </NormativeBanner>
      {docList && docList.length > 0 ? (
        <div className="space-y-2">
          {docList.map((doc: any, i: number) => (
            <div key={doc.id ?? i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-400" />
                <div>
                  <div className="text-sm font-medium text-slate-800">{doc.titulo ?? doc.nombre}</div>
                  <div className="text-[10px] text-slate-500">{doc.tipo} · {doc.baseNormativa}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* State-conditional actions (N1) */}
                {doc.estado === 'PENDIENTE' && (
                  <button className="rounded bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100">
                    Generar
                  </button>
                )}
                {doc.estado === 'BORRADOR' && (
                  <>
                    <button className="rounded bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100" title="Ver">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100" title="Descargar">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(doc)}
                      className="rounded bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                      title="Eliminar borrador"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                {(doc.estado === 'APROBADO' || doc.estado === 'FIRMADO') && (
                  <>
                    <button className="rounded bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100" title="Ver">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100" title="Descargar">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100" title="Anular (acción DPO)">
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                <Badge variant={doc.estado === 'APROBADO' ? 'verificado' : doc.estado === 'BORRADOR' ? 'pendiente' : 'slate'}>
                  {doc.estado}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState titulo="Sin documentos disponibles" descripcion="Los documentos se generarán conforme avance el SGPDP." icon={FileText} />
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-sm font-bold text-slate-800">Eliminar documento</h3>
            <p className="mb-1 text-xs text-slate-600">
              ¿Está seguro de eliminar el borrador <strong>"{deleteTarget.titulo}"</strong>?
            </p>
            <p className="mb-4 text-[10px] text-slate-400">
              El documento volverá a estado Pendiente en la derivación. Esta acción queda registrada en la auditoría.
              Nota: esto NO es una solicitud de supresión de datos personales (Art. 15 LOPDP).
            </p>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-slate-600">Motivo de la eliminación *</label>
              <input
                value={deleteMotivo}
                onChange={(e) => setDeleteMotivo(e.target.value)}
                placeholder="Indique el motivo…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteMotivo(''); }}
                className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={!deleteMotivo.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Eliminar borrador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
