import { useQuery } from '@tanstack/react-query';
import { get } from '@/api/client';
import { useActiveClient } from '@/stores/useActiveClient';
import { useEffect } from 'react';

interface ClienteSummary {
  id: string;
  razonSocial: string;
  ruc: string;
  sector: string;
  ciudad: string;
  nivelRiesgo: string | null;
}

export function useClientes() {
  const setClientes = useActiveClient((s) => s.setClientes);

  const query = useQuery({
    queryKey: ['clientes'],
    queryFn: () => get<ClienteSummary[]>('/clientes'),
  });

  useEffect(() => {
    if (query.data) {
      setClientes(query.data);
    }
  }, [query.data, setClientes]);

  return query;
}

export function useClienteResumen() {
  const clienteId = useActiveClient((s) => s.clienteId);

  return useQuery({
    queryKey: ['clientes', clienteId, 'resumen'],
    queryFn: () => get<Record<string, unknown>>(`/clientes/${clienteId}/resumen`),
    enabled: !!clienteId,
  });
}

export function useDerivacionDocumental() {
  const clienteId = useActiveClient((s) => s.clienteId);

  return useQuery({
    queryKey: ['clientes', clienteId, 'derivacion'],
    queryFn: () => get<Array<Record<string, unknown>>>(`/clientes/${clienteId}/derivacion-documental`),
    enabled: !!clienteId,
  });
}
