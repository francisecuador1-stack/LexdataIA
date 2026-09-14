import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useDocumentos,
  useIndiceEstado,
  useUploadDocumento,
  useExtraer,
  useIndexar,
} from '@/hooks/useCorpusAdmin';
import { Upload, Database, RefreshCw, FileText, AlertTriangle } from 'lucide-react';

const ESTADO_COLORS: Record<string, string> = {
  CARGADO: 'bg-slate-100 text-slate-700',
  EXTRAYENDO: 'bg-blue-100 text-blue-700',
  EXTRAIDO: 'bg-amber-100 text-amber-700',
  EN_REVISION: 'bg-amber-100 text-amber-700',
  PUBLICADO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
  ERROR: 'bg-red-100 text-red-700',
};

/**
 * §8.2: Pestaña de Administración del Corpus.
 * Visible only for LEGAL_ADMIN / SUPERADMIN.
 */
export function CorpusAdminTab() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="space-y-6">
      {/* A. Index status */}
      <IndiceEstadoPanel />

      {/* B. Documents table */}
      <DocumentosPanel onUpload={() => setShowUpload(true)} />

      {/* C. Upload dialog */}
      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}
    </div>
  );
}

// ─── Index Status Panel (§8.2 C) ─────────────────────────

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
        <KpiCard
          label="Chunks con embedding"
          value={`${estado.chunksConEmbedding} / ${estado.chunksTotales}`}
        />
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        {estado.modelo && (
          <span>
            Modelo: <strong>{estado.modelo}</strong> · {estado.dimensiones}d
          </span>
        )}
        {estado.ultimaIndexacion && (
          <span>
            Última: {new Date(estado.ultimaIndexacion).toLocaleString('es-EC')}
          </span>
        )}
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
          {estado.pendientes} normas sin texto verificado — excluidas de la búsqueda semántica
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

// ─── Documents Panel (§8.2 A) ────────────────────────────

function DocumentosPanel({ onUpload }: { onUpload: () => void }) {
  const { data: docs, isLoading } = useDocumentos();
  const extraer = useExtraer();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          Documentos fuente
        </h3>
        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
        >
          <Upload className="h-3.5 w-3.5" />
          Cargar normativa
        </button>
      </div>

      {isLoading ? (
        <EmptyState icon={FileText} titulo="Cargando documentos…" />
      ) : !docs?.data?.length ? (
        <EmptyState
          icon={FileText}
          titulo="Sin documentos"
          descripcion="Suba un PDF, DOCX o TXT para comenzar la extracción."
        />
      ) : (
        <DataTable
          columns={[
            { key: 'nombreArchivo', header: 'Archivo' },
            { key: 'fuente', header: 'Fuente', render: (r: any) => <Badge variant="blue">{r.fuente}</Badge> },
            { key: 'organismoEmisor', header: 'Organismo' },
            {
              key: 'estado',
              header: 'Estado',
              render: (r: any) => (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ESTADO_COLORS[r.estado] ?? ''}`}>
                  {r.estado}
                </span>
              ),
            },
            {
              key: 'articulos',
              header: 'Artículos',
              render: (r: any) => (
                <span className="text-xs text-slate-600">
                  {r._count?.articulos ?? 0}
                </span>
              ),
            },
            {
              key: 'createdAt',
              header: 'Subido',
              render: (r: any) => (
                <span className="text-xs text-slate-500">
                  {new Date(r.createdAt).toLocaleDateString('es-EC')}
                </span>
              ),
            },
            {
              key: 'acciones',
              header: '',
              render: (r: any) => (
                <div className="flex gap-1">
                  {r.estado === 'CARGADO' && (
                    <button
                      onClick={() => extraer.mutate(r.id)}
                      disabled={extraer.isPending}
                      className="rounded bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100"
                    >
                      Extraer
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          data={docs.data}
        />
      )}
    </div>
  );
}

// ─── Upload Dialog (§8.2 B step 1) ──────────────────────

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

    upload.mutate(
      { formData: fd, onProgress: setProgress },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-lg"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-800">Cargar normativa</h2>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Archivo (PDF, DOCX, TXT)</label>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Fuente</label>
            <select
              value={fuente}
              onChange={(e) => setFuente(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {['LOPDP', 'RGLOPDP', 'SPDP', 'SGPDP', 'CRE', 'ISO_27001', 'ISO_27701', 'ISO_42001', 'NIST'].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="NACIONAL">Nacional</option>
              <option value="INTERNACIONAL">Internacional</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Organismo emisor *</label>
          <input
            value={organismo}
            onChange={(e) => setOrganismo(e.target.value)}
            placeholder="Asamblea Nacional del Ecuador"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>

        {upload.isPending && (
          <div className="mb-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="mt-1 text-xs text-slate-500">{progress}%</span>
          </div>
        )}

        {upload.isError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {(upload.error as any)?.message ?? 'Error al subir'}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!file || !organismo || upload.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {upload.isPending ? 'Subiendo…' : 'Subir documento'}
          </button>
        </div>
      </form>
    </div>
  );
}
