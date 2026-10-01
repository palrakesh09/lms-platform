export default function LearningProgressBar({
  completed = 0,
  total = 0,
}) {
  const percentage =
    total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div className="border-b border-[var(--border)] bg-[#0A0A0A]">
      <div className="flex h-8 items-center gap-3 px-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Progress
        </span>

        <div className="h-[2px] flex-1 overflow-hidden bg-[#222]">
          <div
            className="h-full bg-[var(--accent)] transition-[width] duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <span className="min-w-[36px] text-right font-mono text-[9px] font-semibold text-white">
          {percentage}%
        </span>
      </div>
    </div>
  );
}