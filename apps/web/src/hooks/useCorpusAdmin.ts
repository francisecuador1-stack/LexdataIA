import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del, apiUpload } from '@/api/client';

// ─── Documentos ──────────────────────────────────────────

export function useDocumentos(params?: { limit?: number; cursor?: string }) {
  const search = new URLSearchParams();
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.cursor) search.set('cursor', params.cursor);
  const qs = search.toString();

  return useQuery({
    queryKey: ['corpus-admin', 'documentos', params],
    queryFn: () => get<{ data: any[]; hasMore: boolean; cursor: string | null }>(
      `/corpus/admin/documentos${qs ? `?${qs}` : ''}`,
    ),
  });
}

export function useDocumento(id: string) {
  return useQuery({
    queryKey: ['corpus-admin', 'documentos', id],
    queryFn: () => get<any>(`/corpus/admin/documentos/${id}`),
    enabled: !!id,
  });
}

export function useUploadDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { formData: FormData; onProgress?: (pct: number) => void }) =>
      apiUpload<any>('/corpus/admin/documentos', args.formData, args.onProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corpus-admin', 'documentos'] });
    },
  });
}

export function useDeleteDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/corpus/admin/documentos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corpus-admin', 'documentos'] });
    },
  });
}

// ─── Extracción ──────────────────────────────────────────

export function useExtraer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentoId: string) =>
      post<any>(`/corpus/admin/documentos/${documentoId}/extraer`),
    onSuccess: (_, documentoId) => {
      qc.invalidateQueries({ queryKey: ['corpus-admin', 'documentos', documentoId] });
    },
  });
}

export function useArticulos(documentoId: string) {
  return useQuery({
    queryKey: ['corpus-admin', 'articulos', documentoId],
    queryFn: () => get<any[]>(`/corpus/admin/documentos/${documentoId}/articulos`),
    enabled: !!documentoId,
  });
}

export function useUpdateArticulo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; data: any }) =>
      patch<any>(`/corpus/admin/articulos/${args.id}`, args.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corpus-admin', 'articulos'] });
    },
  });
}

export function useDividirArticulo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => post<any>(`/corpus/admin/articulos/${id}/dividir`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corpus-admin', 'articulos'] });
    },
  });
}

// ─── Publicación ─────────────────────────────────────────

export function usePublicar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { documentoId: string; motivoCambio: string }) =>
      post<any>(`/corpus/admin/documentos/${args.documentoId}/publicar`, {
        motivoCambio: args.motivoCambio,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corpus-admin'] });
      qc.invalidateQueries({ queryKey: ['corpus'] }); // Refresh public corpus
    },
  });
}

// ─── Indexación ──────────────────────────────────────────

export function useIndexar() {
  return useMutation({
    mutationFn: (args?: { normaIds?: string[]; forzar?: boolean }) =>
      post<any>('/corpus/admin/indexar', args ?? {}),
  });
}

export function useIndiceEstado() {
  return useQuery({
    queryKey: ['corpus-admin', 'indice', 'estado'],
    queryFn: () =>
      get<{
        normasTotales: number;
        normasVerificadas: number;
        normasIndexadas: number;
        chunksTotales: number;
        chunksConEmbedding: number;
        modelo: string | null;
        dimensiones: number;
        ultimaIndexacion: string | null;
        pendientes: number;
      }>('/corpus/admin/indice/estado'),
  });
}

// ─── Jobs ────────────────────────────────────────────────

export function useJob(id: string | null) {
  return useQuery({
    queryKey: ['corpus-admin', 'jobs', id],
    queryFn: () => get<any>(`/corpus/admin/jobs/${id}`),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      // Poll every 2s while job is running
      if (data?.estado === 'PENDIENTE' || data?.estado === 'EJECUTANDO') return 2000;
      return false;
    },
  });
}

// ─── Exportación ─────────────────────────────────────────

export function useExportar() {
  return useMutation({
    mutationFn: () => post<any>('/corpus/admin/exportar'),
  });
}
