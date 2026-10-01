import { formatLabel } from '../../utils/formatters.js';

const STYLES = {
  draft:
    'border-[#f59e0b]/30 bg-[#17130a] text-[#f59e0b]',

  published:
    'border-[#22c55e]/30 bg-[#0d1a12] text-[#22c55e]',

  archived:
    'border-[#404040] bg-[#171717] text-[#888]',

  active:
    'border-[#22c55e]/30 bg-[#0d1a12] text-[#22c55e]',

  inactive:
    'border-[#ef4444]/30 bg-[#1a0d0d] text-[#ef4444]',
};

export default function StatusBadge({ status, label }) {
  const style =
    STYLES[status] ??
    'border-[#404040] bg-[#171717] text-[#888]';

  return (
    <span
      className={`inline-flex max-w-full items-center border px-2 py-1 font-mono text-[8px] font-semibold uppercase tracking-[0.12em] leading-none sm:px-2.5 sm:text-[9px] sm:tracking-[0.15em] ${style}`}
    >
      <span
        className={`mr-1.5 size-1.5 shrink-0 rounded-full ${
          status === 'published' || status === 'active'
            ? 'bg-[#22c55e]'
            : status === 'draft'
              ? 'bg-[#f59e0b]'
              : status === 'inactive'
                ? 'bg-[#ef4444]'
                : 'bg-[#666]'
        }`}
      />

      <span className="truncate">
        {label ?? formatLabel(status)}
      </span>
    </span>
  );
}