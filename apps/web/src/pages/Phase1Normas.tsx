import { useState } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { TabBar } from '@/components/ui/TabBar';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { NormativeBanner } from '@/components/ui/NormativeBanner';
import { HashChip } from '@/components/ui/HashChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNormas, useMatriz, usePrincipios, useCorpusStats } from '@/hooks/useCorpus';
import { BookOpen, Search } from 'lucide-react';

// Badges are computed dynamically from useCorpusStats() — see below

export function Phase1Normas() {
  const [tab, setTab] = useState('biblioteca');
  const [tipo, setTipo] = useState<'NACIONAL' | 'INTERNACIONAL'>('NACIONAL');
  const [selectedNorma, setSelectedNorma] = useState<any>(null);
  const [search, setSearch] = useState('');

  const { data: normas } = useNormas({ tipo, ...(search ? { q: search } : {}) });
  const { data: matriz } = useMatriz();
  const { data: principios } = usePrincipios();
  const { data: stats } = useCorpusStats();

  const tabs = [
    { key: 'biblioteca', label: 'Biblioteca Jurídica', badge: stats ? `${stats.nacionales}N · ${stats.internacionales}I` : '—' },
    { key: 'matriz', label: 'Matriz Normativa', badge: 'API · RN-004' },
    { key: 'principios', label: 'Principios Rectores', badge: String(stats?.controles ?? '—') },
  ];

  return (
    <div>
      <ModuleHeader
        ciclo="PLANIFICAR"
        fase={1}
        title="Motor de Conocimiento Normativo"
        subtitle={`Biblioteca jurídica dual · ${stats?.total ?? 36} normas · Nacional + Internacional`}
        badges={[{ label: 'RN-004', variant: 'blue' }]}
      />

      <TabBar tabs={tabs} activeKey={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === 'biblioteca' && (
          <div className="flex gap-6">
            {/* Left: List */}
            <div className="w-96 shrink-0">
              {/* Toggle Nacional/Internacional */}
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => setTipo('NACIONAL')}
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${tipo === 'NACIONAL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Nacional ({stats?.nacionales ?? '—'})
                </button>
                <button
                  onClick={() => setTipo('INTERNACIONAL')}
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${tipo === 'INTERNACIONAL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Internacional ({stats?.internacionales ?? '—'})
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Búsqueda semántica…"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* Norma cards */}
              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                {(normas?.data as any[])?.map((n: any) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNorma(n)}
                    className={`w-full rounded-lg border p-3 text-left transition ${selectedNorma?.id === n.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant={n.fuente?.toLowerCase() as any ?? 'slate'}>{n.fuente}</Badge>
                      <span className="text-xs font-medium text-slate-700">{n.identificador}</span>
                      <Badge variant="vigente">Vigente</Badge>
                      {n.textoVerificado === false && (
                        <Badge variant="pendiente">Texto pendiente de verificación</Badge>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-800">{n.titulo}</div>
                    <div className="text-[10px] text-slate-500">{n.categoria}</div>
                  </button>
                )) ?? <EmptyState icon={BookOpen} titulo="Cargando normas…" />}
              </div>
            </div>

            {/* Right: Detail */}
            <div className="flex-1">
              {selectedNorma ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant={selectedNorma.fuente?.toLowerCase() as any}>{selectedNorma.fuente}</Badge>
                    <Badge variant="blue">{selectedNorma.identificador}</Badge>
                    <Badge variant="blue">{selectedNorma.fasePHVA}</Badge>
                    <Badge variant="vigente">Vigente</Badge>
                    <Badge variant={selectedNorma.tipo === 'NACIONAL' ? 'green' : 'purple'}>{selectedNorma.tipo}</Badge>
                  </div>
                  <h2 className="mb-1 text-lg font-bold text-slate-800">{selectedNorma.titulo}</h2>
                  <p className="mb-4 text-xs text-slate-500">{selectedNorma.categoria}</p>

                  <div className="mb-4">
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Resumen ejecutivo</h4>
                    <p className="text-sm text-slate-700">{selectedNorma.resumenEjecutivo}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Texto normativo</h4>
                    {selectedNorma.textoVerificado === false && (
                      <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Texto pendiente de verificación — el contenido normativo aún no está cargado.
                      </div>
                    )}
                    <p className="text-sm text-slate-600">{selectedNorma.textoNormativo}</p>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 text-xs">
                    <div><span className="font-semibold text-slate-600">ORGANISMO EMISOR</span><br />{selectedNorma.organismoEmisor}</div>
                    <div><span className="font-semibold text-slate-600">FECHA DE EMISIÓN</span><br />{new Date(selectedNorma.fechaEmision).toLocaleDateString('es-EC')}</div>
                    <div><span className="font-semibold text-slate-600">VERSIÓN</span><br />{selectedNorma.version}</div>
                    <div><span className="font-semibold text-slate-600">TIPO DE NORMA</span><br />{selectedNorma.tipo}</div>
                  </div>

                  <div className="mb-4 rounded-lg bg-slate-50 p-3">
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Hash criptográfico — Integridad normativa</h4>
                    <HashChip hash={selectedNorma.hashSha256} />
                    <p className="mt-1 text-[10px] text-slate-400">Este hash garantiza que el contenido normativo es inalterable. Cualquier modificación invalidaría el hash (RN-004).</p>
                  </div>

                  {selectedNorma.controlesNormativos?.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Controles normativos asociados</h4>
                      {selectedNorma.controlesNormativos.map((c: any) => (
                        <div key={c.id} className="mb-2 rounded-lg border border-slate-200 p-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="blue">{c.fasePHVA}</Badge>
                            <span className="text-sm font-medium text-slate-700">{c.titulo}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">Evidencia: {c.evidenciaRequerida}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20">
                  <BookOpen className="mb-3 h-10 w-10 text-slate-300" />
                  <h3 className="text-sm font-medium text-slate-700">Seleccione una norma</h3>
                  <p className="mt-1 max-w-sm text-center text-xs text-slate-400">
                    Explore la normativa ecuatoriana: Constitución, LOPDP, Reglamento, Resoluciones SPDP y SGPDP.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'matriz' && (
          <div>
            <NormativeBanner tone="legal">
              RN-004 · Matriz Normativa — API Interna del Sistema. Los controles son inmutables para operadores.
              Solo LEGAL_ADMIN puede versionar el corpus, con traza de auditoría.
            </NormativeBanner>
            <DataTable
              columns={[
                { key: 'fuente', header: 'Fuente', render: (r: any) => <Badge variant={r.norma?.fuente?.toLowerCase() as any}>{r.norma?.fuente} {r.norma?.identificador}</Badge> },
                { key: 'titulo', header: 'Control normativo' },
                { key: 'evidenciaRequerida', header: 'Evidencia requerida' },
                { key: 'fasePHVA', header: 'Fase', render: (r: any) => <Badge variant="blue">{r.fasePHVA}</Badge> },
                { key: 'hashSha256', header: 'Hash', render: (r: any) => <HashChip hash={r.hashSha256} /> },
              ]}
              data={(matriz as any[]) ?? []}
            />
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{(matriz as any[])?.length ?? 0} de {(matriz as any[])?.length ?? 0} controles · Matriz es de solo lectura para operadores</span>
              <Badge variant="blue">API Interna · RN-004</Badge>
            </div>
          </div>
        )}

        {tab === 'principios' && (
          <div>
            <p className="mb-4 text-sm text-slate-600">13 Principios Rectores · Art. 10 LOPDP + RGLOPDP — Obligatorios para todo tratamiento</p>
            <div className="space-y-2">
              {(principios as any[])?.map((p: any) => (
                <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{p.nombre}</span>
                      <span className="ml-2 text-xs text-slate-500">{p.baseNormativa}</span>
                    </div>
                    <Badge variant={p.estados?.[0]?.estado === 'VERIFICADO' ? 'verificado' : p.estados?.[0]?.estado === 'PENDIENTE' ? 'pendiente' : 'no-verificado'}>
                      {p.estados?.[0]?.estado ?? 'PENDIENTE'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{p.definicion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
