import { type LucideIcon, FileSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  titulo: string;
  descripcion?: string;
}

export function EmptyState({ icon: Icon = FileSearch, titulo, descripcion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="mb-3 h-10 w-10 text-slate-300" />
      <h3 className="text-sm font-medium text-slate-700">{titulo}</h3>
      {descripcion && <p className="mt-1 max-w-sm text-xs text-slate-400">{descripcion}</p>}
    </div>
  );
}
