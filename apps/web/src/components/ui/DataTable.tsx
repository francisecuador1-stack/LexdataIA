interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns, data, onRowClick, emptyMessage = 'Sin datos',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-400">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col) => (
              <th key={col.key} className={`sticky top-0 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600 ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-slate-100 ${onRowClick ? 'cursor-pointer hover:bg-blue-50/50' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-3 py-2 text-slate-700 ${col.className ?? ''}`}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
