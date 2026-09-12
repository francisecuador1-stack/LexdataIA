import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface HashChipProps {
  hash: string;
  label?: string;
}

export function HashChip({ hash, label }: HashChipProps) {
  const [copied, setCopied] = useState(false);
  const short = hash.length > 16 ? `${hash.slice(0, 8)}…${hash.slice(-8)}` : hash;

  const copy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 transition hover:bg-slate-200"
      title={`sha256:${hash}`}
    >
      {label && <span className="font-sans font-medium">{label}</span>}
      <span>sha256:{short}</span>
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}
