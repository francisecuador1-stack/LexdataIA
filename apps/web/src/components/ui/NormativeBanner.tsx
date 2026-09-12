import { cn } from '@/lib/utils';
import { Info, AlertTriangle, Scale } from 'lucide-react';

const TONES = {
  info: { bg: 'bg-blue-50 border-blue-200', icon: Info, color: 'text-blue-700' },
  warning: { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, color: 'text-amber-700' },
  legal: { bg: 'bg-slate-50 border-slate-200', icon: Scale, color: 'text-slate-700' },
} as const;

interface NormativeBannerProps {
  tone?: keyof typeof TONES;
  children: React.ReactNode;
}

export function NormativeBanner({ tone = 'legal', children }: NormativeBannerProps) {
  const t = TONES[tone];
  const Icon = t.icon;
  return (
    <div className={cn('mb-4 flex gap-3 rounded-lg border p-3', t.bg)}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', t.color)} />
      <div className={cn('text-xs leading-relaxed', t.color)}>{children}</div>
    </div>
  );
}
