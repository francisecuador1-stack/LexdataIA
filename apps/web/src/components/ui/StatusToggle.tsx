import { cn } from '@/lib/utils';

interface StatusToggleProps {
  options: Array<{ value: string; label: string; color?: string }>;
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function StatusToggle({ options, value, onChange, disabled }: StatusToggleProps) {
  const COLORS: Record<string, string> = {
    green: 'bg-green-600 text-white',
    amber: 'bg-amber-500 text-white',
    red: 'bg-red-500 text-white',
  };

  return (
    <div className="inline-flex gap-1 rounded-lg border border-slate-200 p-0.5" role="radiogroup">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => !disabled && onChange(opt.value)}
          disabled={disabled}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition',
            value === opt.value
              ? (opt.color ? COLORS[opt.color] ?? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
              : 'text-slate-600 hover:bg-slate-100',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
