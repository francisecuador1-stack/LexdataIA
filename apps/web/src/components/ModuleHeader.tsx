import { cn } from '@/lib/utils';

interface Badge {
  label: string;
  variant?: 'blue' | 'red' | 'amber' | 'green' | 'slate';
}

interface ModuleHeaderProps {
  ciclo: string;
  fase?: number;
  title: string;
  subtitle: string;
  badges?: Badge[];
}

const VARIANT_CLASSES = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function ModuleHeader({ ciclo, fase, title, subtitle, badges = [] }: ModuleHeaderProps) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
          {ciclo}{fase != null ? ` · FASE ${fase}` : ''}
        </span>
        {badges.map((b) => (
          <span
            key={b.label}
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
              VARIANT_CLASSES[b.variant ?? 'slate'],
            )}
          >
            {b.label}
          </span>
        ))}
      </div>
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
