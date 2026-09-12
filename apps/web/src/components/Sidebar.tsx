import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Shield, Building2, FileCheck,
  Eye, ClipboardCheck, TrendingUp, GraduationCap, Users, FileText,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_SECTIONS = [
  {
    label: 'ANÁLISIS',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard PHVA', sub: 'Visión general del sistema' },
    ],
  },
  {
    label: 'PLANIFICAR',
    items: [
      { to: '/fase-1', icon: BookOpen, label: 'Fase 1 · Normas', sub: 'Biblioteca jurídica' },
      { to: '/fase-2', icon: Shield, label: 'Fase 2 · Amenazas y Vulnerabilidades', sub: 'Inventario, riesgos y mapa de calor' },
      { to: '/fase-3', icon: Building2, label: 'Fase 3 · Implementación', sub: 'Diagnóstico organizacional' },
      { to: '/fase-4', icon: FileCheck, label: 'Fase 4 · Definición', sub: 'Marco estratégico' },
    ],
  },
  {
    label: 'HACER',
    items: [
      { to: '/fase-5', icon: Eye, label: 'Fase 5 · Supervisión', sub: 'Controles y hallazgos' },
    ],
  },
  {
    label: 'VERIFICAR',
    items: [
      { to: '/fase-6', icon: ClipboardCheck, label: 'Fase 6 · Auditoría', sub: 'KPIs y bitácora' },
    ],
  },
  {
    label: 'ACTUAR',
    items: [
      { to: '/fase-7', icon: TrendingUp, label: 'Fase 7 · Mejora Continua', sub: 'Recomendaciones y madurez' },
    ],
  },
  {
    label: 'CAPACITACIONES',
    items: [
      { to: '/capacitaciones', icon: GraduationCap, label: 'Capacitaciones', sub: 'E-Learning · Central · Informes' },
    ],
  },
  {
    label: 'CLIENTE',
    items: [
      { to: '/portal-cliente', icon: Users, label: 'Portal del Cliente', sub: 'Vista del cliente' },
      { to: '/registro', icon: FileText, label: 'Formulario SPDP', sub: 'Registro de empresa' },
    ],
  },
];

const SEED_COMPANIES = [
  'TechCorp Ecuador S.A.',
  'Salud Digital Quito Cía. Ltda.',
  'Banco del Pacífico',
  'EduOnline S.A.',
  'LogiFreight Ecuador',
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-700 bg-navy-900 text-white transition-all duration-200',
        collapsed ? 'w-16' : 'w-[248px]',
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold">
              LX
            </div>
            <span className="text-sm font-semibold">LEXDATA IA</span>
          </div>
        )}
        <button onClick={onToggle} className="rounded p-1 hover:bg-white/10">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Company selector */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Empresa activa
          </label>
          <select className="w-full rounded bg-navy-950 px-2 py-1.5 text-xs text-white outline-none">
            {SEED_COMPANIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-3">
            {!collapsed && (
              <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {section.label}
              </div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'mb-0.5 flex items-center gap-2 rounded-lg px-2 py-2 text-xs transition',
                    isActive
                      ? 'bg-blue-600/20 text-blue-300'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
                    collapsed && 'justify-center',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <div className="min-w-0">
                    <div className="truncate font-medium">{item.label}</div>
                    <div className="truncate text-[10px] text-slate-500">{item.sub}</div>
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer: DPO */}
      {!collapsed && (
        <div className="border-t border-slate-700 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
              DA
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium">Dra. Andreina Almeida</div>
              <div className="truncate text-[10px] text-slate-400">DPO Certificada · SPDP</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
