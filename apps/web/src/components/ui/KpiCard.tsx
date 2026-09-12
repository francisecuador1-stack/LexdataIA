import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

const TONE_CLASSES = {
  default: 'border-slate-200 bg-white',
  warning: 'border-amber-200 bg-amber-50',
  danger: 'border-red-200 bg-red-50',
  success: 'border-green-200 bg-green-50',
} as const;

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  tone?: keyof typeof TONE_CLASSES;
  icon?: LucideIcon;
}

export function KpiCard({ label, value, sub, tone = 'default', icon: Icon }: KpiCardProps) {
  return (
    <div className={cn('rounded-xl border p-4', TONE_CLASSES[tone])}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
