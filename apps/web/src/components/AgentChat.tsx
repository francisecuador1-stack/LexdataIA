import { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const QUICK_CHIPS = [
  '¿Hay brechas críticas?',
  'Estado del RAT',
  'Documentos pendientes',
  'Estado ARCO-PS',
  'DPAs sin firmar',
  '¿Próxima auditoría?',
];

const GREETING =
  'Hola, soy MARK AI — Agente DPO Operativo de LEXDATA. Estoy ejecutando revisiones normativas en tiempo real sobre todas las fases del sistema. El DPO humano supervisa estratégicamente; yo me encargo de toda la operativa: análisis, observaciones, documentación y coordinación con los agentes de los clientes. ¿En qué puedo ayudarte?';

interface AgentChatProps {
  open: boolean;
  onClose: () => void;
}

export function AgentChat({ open, onClose }: AgentChatProps) {
  const [input, setInput] = useState('');

  return (
    <div
      className={cn(
        'fixed right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-slate-200 bg-white shadow-xl transition-transform duration-300',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-navy-950 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
            MA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">MARK AI</span>
              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-400">
                EN LÍNEA
              </span>
            </div>
            <div className="text-[10px] text-blue-300">Agente DPO Operativo · LEXDATA IA</div>
          </div>
        </div>
        <button onClick={onClose} className="rounded p-1 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Alert toast */}
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            MARK AI · Firma DPO requerida
          </div>
          <p className="text-[11px] text-amber-600">
            DPA con proveedor cloud pendiente de firma. El encargado requiere validación del DPO.
          </p>
        </div>

        {/* Greeting */}
        <div className="mb-4">
          <div className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            {GREETING}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">MARK AI · ahora</div>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setInput(chip)}
              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] text-blue-700 transition hover:bg-blue-100"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe a MARK AI…"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
          <button className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
