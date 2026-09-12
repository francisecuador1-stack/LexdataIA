import { useQuery } from '@tanstack/react-query';
import { get } from '@/api/client';

export function useNormas(params?: Record<string, string>) {
  const search = new URLSearchParams(params).toString();
  return useQuery({
    queryKey: ['corpus', 'normas', params],
    queryFn: () => get<{ data: unknown[]; total: number }>(`/corpus/normas?${search}`),
  });
}

export function useNorma(codigo: string) {
  return useQuery({
    queryKey: ['corpus', 'normas', codigo],
    queryFn: () => get<Record<string, unknown>>(`/corpus/normas/${codigo}`),
    enabled: !!codigo,
  });
}

export function useMatriz(fase?: string) {
  return useQuery({
    queryKey: ['corpus', 'matriz', fase],
    queryFn: () => get<unknown[]>(`/corpus/matriz${fase ? `?fase=${fase}` : ''}`),
  });
}

export function usePrincipios() {
  return useQuery({
    queryKey: ['corpus', 'principios'],
    queryFn: () => get<unknown[]>('/corpus/principios'),
  });
}

export function useBusquedaNormas(q: string) {
  return useQuery({
    queryKey: ['corpus', 'buscar', q],
    queryFn: () => get<{ data: unknown[] }>(`/corpus/buscar?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 3,
  });
}

export function useCorpusStats() {
  return useQuery({
    queryKey: ['corpus', 'stats'],
    queryFn: () => get<{ nacionales: number; internacionales: number; total: number; controles: number }>('/corpus/normas/stats'),
  });
}
