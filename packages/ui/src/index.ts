// Design system tokens — LEXDATA IA
// Colors extracted from prototype palette

export const colors = {
  navy: {
    900: '#1a2332',
    950: '#0f1e3d',
  },
  blue: {
    900: '#1e3a8a',
    800: '#1e40af',
    600: '#2563eb',
    500: '#3b82f6',
    300: '#93c5fd',
    50: '#eff6ff',
  },
  slate: {
    200: '#e2e8f0',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
  },
  bg: '#f5f7fa',
  card: '#ffffff',
  green: { 600: '#059669' },
  red: { 500: '#ef4444' },
} as const;

export const NIVELES_MADUREZ = [
  { nivel: 1, nombre: 'Inicial', descripcion: 'Procesos ad-hoc y desorganizados' },
  { nivel: 2, nombre: 'Gestionado', descripcion: 'Procesos planificados pero no estandarizados' },
  { nivel: 3, nombre: 'Definido', descripcion: 'SGPDP estandarizado y documentado' },
  { nivel: 4, nombre: 'Controlado', descripcion: 'SGPDP medido mediante KPIs y supervisión activa' },
  { nivel: 5, nombre: 'Optimizado', descripcion: 'Enfoque en la mejora continua e innovación proactiva' },
] as const;
