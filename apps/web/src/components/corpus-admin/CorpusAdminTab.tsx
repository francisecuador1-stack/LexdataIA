import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useDocumentos,
  useDocumento,
  useIndiceEstado,
  useUploadDocumento,
  useExtraer,
  useIndexar,
  usePublicar,
  useArticulos,
  useUpdateArticulo,
  useDeleteDocumento,
} from '@/hooks/useCorpusAdmin';
import { Upload, Database, RefreshCw, FileText, AlertTriangle, ArrowLeft, Check, X, Trash2 } from 'lucide-react';

const ESTADO_COLORS: Record<string, string> = {
  CARGADO: 'bg-slate-100 text-slate-700',
  EXTRAYENDO: 'bg-blue-100 text-blue-700',
  EXTRAIDO: 'bg-amber-100 text-amber-700',
  EN_REVISION: 'bg-amber-100 text-amber-700',
  PUBLICADO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
  ERROR: 'bg-red-100 text-red-700',
};

const ART_ESTADO_COLORS: Record<string, string> = {
  PROPUESTO: 'bg-slate-100 text-slate-700',
  EDITADO: 'bg-blue-100 text-blue-700',
  APROBADO: 'bg-green-100 text-green-700',
  DESCARTADO: 'bg-red-100 text-red-700',
};

export function CorpusAdminTab() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  if (selectedDocId) {
    return <DocumentoDetail docId={selectedDocId} onBack={() => setSelectedDocId(null)} />;
  }

  return (
    <div className="space-y-6">
      <IndiceEstadoPanel />
      <DocumentosPanel onUpload={() => setShowUpload(true)} onSelect={setSelectedDocId} />
      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}
    </div>
  );
}

// ─── Index Status Panel ─────────────────────────────────

function IndiceEstadoPanel() {
  const { data: estado } = useIndiceEstado();
  const indexar = useIndexar();

  if (!estado) return null;

  return (
    <div>
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
        Estado del Índice Semántico
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Normas totales" value={estado.normasTotales} />
        <KpiCard label="Verificadas" value={estado.normasVerificadas} />
        <KpiCard label="Indexadas" value={estado.normasIndexadas} />
        <KpiCard label="Chunks con embedding" value={`${estado.chunksConEmbedding} / ${estado.chunksTotales}`} />
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        {estado.modelo && <span>Modelo: <strong>{estado.modelo}</strong> · {estado.dimensiones}d</span>}
        {estado.ultimaIndexacion && <span>Última: {new Date(estado.ultimaIndexacion).toLocaleString('es-EC')}</span>}
        <button
          onClick={() => indexar.mutate({ forzar: false })}
          disabled={indexar.isPending}
          className="ml-auto flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${indexar.isPending ? 'animate-spin' : ''}`} />
          {indexar.isPending ? 'Indexando…' : 'Reindexar'}
        </button>
      </div>
      {estado.pendientes > 0 && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          {estado.pendientes} normas verificadas pendientes de indexación semántica
        </div>
      )}
      {estado.normasVerificadas === 0 && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <Database className="h-4 w-4" />
          Flujo: Cargar documento → Extraer artículos → Aprobar → Publicar → Indexar.
          La indexación solo procesa normas publicadas con texto verificado.
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

// ─── Documents Panel ────────────────────────────────────

function DocumentosPanel({ onUpload, onSelect }: { onUpload: () => void; onSelect: (id: string) => void }) {
  const { data: docs, isLoading } = useDocumentos();
  const extraer = useExtraer();
  const deleteMut = useDeleteDocumento();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Documentos fuente</h3>
        <button onClick={onUpload} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700">
          <Upload className="h-3.5 w-3.5" /> Cargar normativa
        </button>
      </div>
      {isLoading ? (
        <EmptyState icon={FileText} titulo="Cargando documentos…" />
      ) : !docs?.data?.length ? (
        <EmptyState icon={FileText} titulo="Sin documentos" descripcion="Suba un PDF, DOCX o TXT para comenzar." />
      ) : (
        <DataTable
          columns={[
            { key: 'nombreArchivo', header: 'Archivo', render: (r: any) => (
              <button onClick={() => onSelect(r.id)} className="text-left text-blue-600 hover:underline text-xs font-medium">{r.nombreArchivo}</button>
            )},
            { key: 'fuente', header: 'Fuente', render: (r: any) => <Badge variant="blue">{r.fuente}</Badge> },
            { key: 'organismoEmisor', header: 'Organismo' },
            { key: 'estado', header: 'Estado', render: (r: any) => (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ESTADO_COLORS[r.estado] ?? ''}`} title={r.errorMensaje ?? undefined}>
                {r.estado}{r.estado === 'ERROR' && r.errorMensaje && <span className="ml-1 cursor-help">⚠</span>}
              </span>
            )},
            { key: 'articulos', header: 'Artículos', render: (r: any) => <span className="text-xs text-slate-600">{r._count?.articulos ?? 0}</span> },
            { key: 'createdAt', header: 'Subido', render: (r: any) => <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString('es-EC')}</span> },
            { key: 'acciones', header: '', render: (r: any) => (
              <div className="flex gap-1">
                {(r.estado === 'CARGADO' || r.estado === 'ERROR') && (
                  <button onClick={() => extraer.mutate(r.id)} disabled={extraer.isPending} className="rounded bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100">
                    {r.estado === 'ERROR' ? 'Reintentar' : 'Extraer'}
                  </button>
                )}
                {r.estado === 'EXTRAIDO' && (
                  <button onClick={() => onSelect(r.id)} className="rounded bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-100">
                    Revisar
                  </button>
                )}
                {r.estado !== 'PUBLICADO' && (
                  <button
                    onClick={() => { if (confirm('¿Eliminar este documento?')) deleteMut.mutate(r.id); }}
                    disabled={deleteMut.isPending}
                    className="rounded bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )},
          ]}
          data={docs.data}
        />
      )}
    </div>
  );
}

// ─── Document Detail + Articles ─────────────────────────

function DocumentoDetail({ docId, onBack }: { docId: string; onBack: () => void }) {
  const { data: doc } = useDocumento(docId);
  const { data: articulos, isLoading: artLoading } = useArticulos(docId);
  const updateArt = useUpdateArticulo();
  const publicar = usePublicar();
  const [motivoCambio, setMotivoCambio] = useState('');
  const [showPublish, setShowPublish] = useState(false);

  if (!doc) return <EmptyState icon={FileText} titulo="Cargando documento…" />;

  const artList = Array.isArray(articulos) ? articulos : [];
  const aprobados = artList.filter((a: any) => a.estado === 'APROBADO').length;
  const descartados = artList.filter((a: any) => a.estado === 'DESCARTADO').length;
  const pendientes = artList.filter((a: any) => a.estado !== 'APROBADO' && a.estado !== 'DESCARTADO').length;
  const allResolved = artList.length > 0 && pendientes === 0 && aprobados > 0;

  const handleApproveAll = () => {
    const toApprove = artList.filter((a: any) => a.estado === 'PROPUESTO' && a.fidelidadVerificada);
    toApprove.forEach((a: any) => updateArt.mutate({ id: a.id, data: { estado: 'APROBADO' } }));
  };

  const handlePublish = () => {
    if (!motivoCambio.trim()) return;
    publicar.mutate(
      { documentoId: docId, motivoCambio },
      { onSuccess: () => { setShowPublish(false); onBack(); } },
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-slate-100">
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-800">{doc.nombreArchivo}</h3>
          <p className="text-xs text-slate-500">{doc.fuente} · {doc.organismoEmisor} · {doc.estado}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${ESTADO_COLORS[doc.estado] ?? ''}`}>
          {doc.estado}
        </span>
      </div>

      {/* Error message */}
      {doc.errorMensaje && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <strong>Error:</strong> {doc.errorMensaje}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs">
        <span>Total: <strong>{artList.length}</strong></span>
        <span className="text-green-700">Aprobados: <strong>{aprobados}</strong></span>
        <span className="text-red-600">Descartados: <strong>{descartados}</strong></span>
        <span className="text-amber-700">Pendientes: <strong>{pendientes}</strong></span>
      </div>

      {/* Bulk actions */}
      <div className="flex gap-2">
        {pendientes > 0 && (
          <button
            onClick={handleApproveAll}
            disabled={updateArt.isPending}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Check className="mr-1 inline h-3 w-3" />
            Aprobar todos los verificados
          </button>
        )}
        {allResolved && !showPublish && doc.estado !== 'PUBLICADO' && (
          <button
            onClick={() => setShowPublish(true)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Publicar y vectorizar
          </button>
        )}
      </div>

      {/* Publish form */}
      {showPublish && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 text-xs font-semibold text-blue-800">Publicar {aprobados} normas</h4>
          <p className="mb-2 text-xs text-blue-700">{descartados} artículos serán descartados. Las normas se crearán/actualizarán con textoVerificado = true.</p>
          <input
            value={motivoCambio}
            onChange={(e) => setMotivoCambio(e.target.value)}
            placeholder="Motivo del cambio (obligatorio)"
            className="mb-2 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm"
          />
          {publicar.isError && (
            <div className="mb-2 text-xs text-red-600">{(publicar.error as any)?.message ?? 'Error al publicar'}</div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handlePublish}
              disabled={!motivoCambio.trim() || publicar.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {publicar.isPending ? 'Publicando…' : 'Confirmar publicación'}
            </button>
            <button onClick={() => setShowPublish(false)} className="rounded-lg px-4 py-2 text-xs text-slate-600 hover:bg-slate-100">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Articles list */}
      {artLoading ? (
        <EmptyState icon={FileText} titulo="Cargando artículos…" />
      ) : artList.length === 0 ? (
        <EmptyState icon={FileText} titulo="Sin artículos extraídos" descripcion="Ejecute la extracción primero." />
      ) : (
        <div className="space-y-2">
          {artList.map((art: any) => (
            <ArticuloCard key={art.id} art={art} onUpdate={(data) => updateArt.mutate({ id: art.id, data })} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticuloCard({ art, onUpdate }: { art: any; onUpdate: (data: any) => void }) {
  return (
    <div className={`rounded-lg border p-4 ${art.estado === 'APROBADO' ? 'border-green-200 bg-green-50/30' : art.estado === 'DESCARTADO' ? 'border-red-200 bg-red-50/30 opacity-60' : 'border-slate-200 bg-white'}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">#{art.orden}</span>
          <span className="text-xs font-medium text-slate-800">{art.identificador}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ART_ESTADO_COLORS[art.estado] ?? ''}`}>
            {art.estado}
          </span>
          {!art.fidelidadVerificada && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
              Fidelidad no verificada
            </span>
          )}
          {art.metodoExtraccion && (
            <span className="text-[10px] text-slate-400">{art.metodoExtraccion} · {art.confianza ? `${Math.round(art.confianza * 100)}%` : '—'}</span>
          )}
        </div>
        {art.estado !== 'APROBADO' && art.estado !== 'DESCARTADO' && (
          <div className="flex gap-1">
            <button
              onClick={() => onUpdate({ estado: 'APROBADO' })}
              disabled={!art.fidelidadVerificada}
              title={!art.fidelidadVerificada ? 'Edite el texto primero — fidelidad no verificada' : 'Aprobar'}
              className="rounded bg-green-50 p-1.5 text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onUpdate({ estado: 'DESCARTADO' })}
              className="rounded bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <h4 className="mb-1 text-sm font-medium text-slate-800">{art.titulo}</h4>
      <p className="text-xs text-slate-600 line-clamp-3">{art.textoNormativo}</p>
      {art.codigoPropuesto && (
        <span className="mt-1 inline-block text-[10px] text-slate-400">Código: {art.codigoPropuesto}</span>
      )}
    </div>
  );
}

// ─── Upload Dialog ──────────────────────────────────────

function UploadDialog({ onClose }: { onClose: () => void }) {
  const upload = useUploadDocumento();
  const [file, setFile] = useState<File | null>(null);
  const [fuente, setFuente] = useState('LOPDP');
  const [tipo, setTipo] = useState('NACIONAL');
  const [organismo, setOrganismo] = useState('');
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !organismo) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('fuente', fuente);
    fd.append('tipo', tipo);
    fd.append('organismoEmisor', organismo);
    upload.mutate({ formData: fd, onProgress: setProgress }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Cargar normativa</h2>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Archivo (PDF, DOCX, TXT)</label>
          <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Fuente</label>
            <select value={fuente} onChange={(e) => setFuente(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              {['LOPDP', 'RGLOPDP', 'SPDP', 'SGPDP', 'CRE', 'ISO_27001', 'ISO_27701', 'ISO_42001', 'NIST'].map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="NACIONAL">Nacional</option>
              <option value="INTERNACIONAL">Internacional</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Organismo emisor *</label>
          <input value={organismo} onChange={(e) => setOrganismo(e.target.value)} placeholder="Asamblea Nacional del Ecuador" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
        </div>
        {upload.isPending && (
          <div className="mb-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>
            <span className="mt-1 text-xs text-slate-500">{progress}%</span>
          </div>
        )}
        {upload.isError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{(upload.error as any)?.message ?? 'Error al subir'}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
          <button type="submit" disabled={!file || !organismo || upload.isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {upload.isPending ? 'Subiendo…' : 'Subir documento'}
          </button>
        </div>
      </form>
    </div>
  );
}
