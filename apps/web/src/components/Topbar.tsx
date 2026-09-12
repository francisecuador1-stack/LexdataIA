import { useState, useEffect } from 'react';
import { Bell, User } from 'lucide-react';

const TICKER_MESSAGES = [
  'FASE 6 · Procesando hallazgos de auditoría para ciclo PHVA de mejora continua',
  'FASE 2 · Analizando bases legales de tratamientos en el RAT actualizado',
  'FASE 4 · Revisando cláusulas DPA con encargados de tratamiento externos',
  'FASE 6 · Monitoreando registro de incidentes · Protocolo 72h SPDP activo',
  'FASE 5 · Verificando plazos ARCO-PS · 15 días hábiles (Acceso, Rectificación, Eliminación)',
  'FASE 2 · Revisando EIPD — verificando criterios de alto riesgo LOPDP Art. 39',
];

interface TopbarProps {
  onAgentClick: () => void;
}

export function Topbar({ onAgentClick }: TopbarProps) {
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIdx((i) => (i + 1) % TICKER_MESSAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-14 items-center justify-between bg-gradient-to-r from-navy-950 to-navy-900 px-4 text-white">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
          LX
        </div>
        <div>
          <span className="text-sm font-semibold">LEXDATA IA</span>
          <span className="ml-2 text-xs text-blue-300">Sistema SGPDP · LOPDP Ecuador</span>
        </div>
      </div>

      {/* Center-left: MARK AI chip */}
      <button
        onClick={onAgentClick}
        className="flex items-center gap-2 rounded-full bg-navy-900/50 px-3 py-1 text-xs transition hover:bg-navy-900"
      >
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="font-medium">MARK AI</span>
        <span className="text-blue-300">Toca para chatear · Agente DPO Operativo</span>
      </button>

      {/* Center: Ticker */}
      <div className="hidden max-w-md truncate text-xs text-blue-200 lg:block">
        {TICKER_MESSAGES[tickerIdx]}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="hidden text-right text-xs md:block">
          <div className="font-medium">DPO Humano</div>
          <div className="text-blue-300">Control y Supervisión Estratégica</div>
        </div>
        <button className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold">
            3
          </span>
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
          <User className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
