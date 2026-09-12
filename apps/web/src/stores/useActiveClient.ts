import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClienteSummary {
  id: string;
  razonSocial: string;
  ruc: string;
  sector: string;
  ciudad: string;
  nivelRiesgo: string | null;
}

interface ActiveClientState {
  clienteId: string | null;
  cliente: ClienteSummary | null;
  clientes: ClienteSummary[];
  setClienteId: (id: string) => void;
  setClientes: (clientes: ClienteSummary[]) => void;
}

export const useActiveClient = create<ActiveClientState>()(
  persist(
    (set, get) => ({
      clienteId: null,
      cliente: null,
      clientes: [],
      setClienteId: (id: string) => {
        const clientes = get().clientes;
        const cliente = clientes.find((c) => c.id === id) ?? null;
        set({ clienteId: id, cliente });
      },
      setClientes: (clientes: ClienteSummary[]) => {
        const currentId = get().clienteId;
        const cliente = clientes.find((c) => c.id === currentId) ?? clientes[0] ?? null;
        set({
          clientes,
          clienteId: cliente?.id ?? null,
          cliente,
        });
      },
    }),
    {
      name: 'lexdata-active-client',
      partialize: (state) => ({ clienteId: state.clienteId }),
    },
  ),
);
