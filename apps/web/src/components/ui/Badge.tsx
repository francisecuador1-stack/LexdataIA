import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'blue' | 'green' | 'red' | 'amber' | 'slate' | 'purple'
  | 'lopdp' | 'rglopdp' | 'spdp' | 'sgpdp' | 'cre' | 'iso' | 'nist'
  | 'vigente' | 'pendiente' | 'verificado' | 'no-verificado' | 'bloqueado'
  | 'critica' | 'mayor' | 'menor'
  | 'bajo' | 'medio' | 'alto' | 'critico'
  | 'P' | 'H' | 'V' | 'A';

const VARIANT_MAP: Record<BadgeVariant, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  // Normative sources
  lopdp: 'bg-blue-100 text-blue-800 border-blue-300',
  rglopdp: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  spdp: 'bg-violet-100 text-violet-800 border-violet-300',
  sgpdp: 'bg-purple-100 text-purple-800 border-purple-300',
  cre: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  iso: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  nist: 'bg-teal-100 text-teal-800 border-teal-300',
  // Status
  vigente: 'bg-green-50 text-green-700 border-green-200',
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  verificado: 'bg-green-50 text-green-700 border-green-200',
  'no-verificado': 'bg-red-50 text-red-700 border-red-200',
  bloqueado: 'bg-red-100 text-red-800 border-red-300',
  // Severity
  critica: 'bg-red-100 text-red-800 border-red-300',
  mayor: 'bg-orange-100 text-orange-800 border-orange-300',
  menor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  // Risk levels
  bajo: 'bg-green-50 text-green-700 border-green-200',
  medio: 'bg-amber-50 text-amber-700 border-amber-200',
  alto: 'bg-orange-100 text-orange-800 border-orange-300',
  critico: 'bg-red-100 text-red-800 border-red-300',
  // PHVA phases
  P: 'bg-blue-600 text-white border-blue-700',
  H: 'bg-emerald-600 text-white border-emerald-700',
  V: 'bg-amber-600 text-white border-amber-700',
  A: 'bg-purple-600 text-white border-purple-700',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'slate', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium', VARIANT_MAP[variant], className)}>
      {children}
    </span>
  );
}
