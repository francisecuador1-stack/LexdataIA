import { cn } from '@/lib/utils';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  badge?: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function TabBar({ tabs, activeKey, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-px" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeKey === tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition',
            activeKey === tab.key
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count != null && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
              {tab.count}
            </span>
          )}
          {tab.badge && (
            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
