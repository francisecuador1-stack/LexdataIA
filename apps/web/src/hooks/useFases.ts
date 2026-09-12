import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/api/client';
import { useActiveClient } from '@/stores/useActiveClient';

// Helper to create phase-scoped hooks
function useFaseQuery<T>(fase: string, endpoint: string, key: string) {
  const clienteId = useActiveClient((s) => s.clienteId);
  return useQuery({
    queryKey: [fase, key, clienteId],
    queryFn: () => get<T>(`/${fase}/${endpoint}`),
    enabled: !!clienteId,
  });
}

// ── Fase 2 ──
export const useTratamientos = () => useFaseQuery<{ data: unknown[]; total: number }>('fase-2', 'tratamientos', 'tratamientos');
export const useActivos = () => useFaseQuery<{ data: unknown[]; total: number }>('fase-2', 'activos', 'activos');
export const useRiesgos = () => useFaseQuery<{ data: unknown[]; total: number }>('fase-2', 'riesgos', 'riesgos');
export const useMapaCalor = () => useFaseQuery<Record<string, unknown>>('fase-2', 'mapa-calor', 'mapa-calor');
export const useMatrizConsolidada = () => useFaseQuery<Record<string, unknown>>('fase-2', 'matriz-consolidada', 'matriz');
export const useBrechaControles = () => useFaseQuery<Record<string, unknown>>('fase-2', 'brecha-controles', 'brecha');
export const useEipd = () => useFaseQuery<unknown[]>('fase-2', 'eipd', 'eipd');
export const useReporteEjecutivo = () => useFaseQuery<Record<string, unknown>>('fase-2', 'reporte-ejecutivo', 'reporte');

// ── Fase 3 ──
export const useDiagnostico = () => useFaseQuery<Record<string, unknown>>('fase-3', 'diagnostico', 'diagnostico');
export const useGobierno = () => useFaseQuery<unknown[]>('fase-3', 'gobierno', 'gobierno');
export const useRolesSgpdp = () => useFaseQuery<unknown[]>('fase-3', 'roles', 'roles');
export const useRecursos = () => useFaseQuery<unknown[]>('fase-3', 'recursos', 'recursos');
export const useBrechas = () => useFaseQuery<{ data: unknown[] }>('fase-3', 'brechas', 'brechas');

// ── Fase 6 ──
export const useCentroMonitoreo = () => useFaseQuery<Record<string, unknown>>('fase-6', 'monitoreo', 'monitoreo');
export const useAuditorias = () => useFaseQuery<{ data: unknown[] }>('fase-6', 'auditorias', 'auditorias');
export const useIncidentes = () => useFaseQuery<{ data: unknown[] }>('fase-6', 'incidentes', 'incidentes');
export const useIndicadores = () => useFaseQuery<Record<string, unknown>>('fase-6', 'indicadores', 'indicadores');

// ── Fase 7 ──
export const useMadurez = () => useFaseQuery<Record<string, unknown>>('fase-7', 'madurez', 'madurez');
export const useRecomendaciones = () => useFaseQuery<{ data: unknown[] }>('fase-7', 'recomendaciones', 'recomendaciones');
export const useOportunidades = () => useFaseQuery<{ data: unknown[] }>('fase-7', 'oportunidades', 'oportunidades');
export const useLecciones = () => useFaseQuery<{ data: unknown[] }>('fase-7', 'lecciones', 'lecciones');

// ── Mutations ──
export function useValidarTratamiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; estado: string; observaciones?: string }) =>
      post(`/fase-2/tratamientos/${params.id}/resolucion`, { estado: params.estado, observaciones: params.observaciones }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fase-2', 'tratamientos'] }),
  });
}

export function useCerrarHallazgo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; hashEvidencia: string }) =>
      post(`/fase-6/hallazgos/${params.id}/cerrar`, { hashEvidencia: params.hashEvidencia }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fase-6'] }),
  });
}
