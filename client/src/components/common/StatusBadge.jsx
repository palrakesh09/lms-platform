import { formatLabel } from '../../utils/formatters.js';

const STYLES = {
  draft: 'bg-amber-50 text-amber-800 ring-amber-200',
  published: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  archived: 'bg-slate-100 text-slate-700 ring-slate-200',
  active: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  inactive: 'bg-red-50 text-red-800 ring-red-200',
};

export default function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        STYLES[status] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
      }`}
    >
      {label ?? formatLabel(status)}
    </span>
  );
}