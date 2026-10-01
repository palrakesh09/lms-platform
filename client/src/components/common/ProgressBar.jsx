export default function ProgressBar({
  value = 0,
  max = 100,
  showLabel = false,
  className = '',
}) {
  const percentage =
    max > 0
      ? Math.min(100, Math.max(0, (value / max) * 100))
      : 0;

  const roundedPercentage = Math.round(percentage);

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Progress
          </span>

          <span className="font-mono text-[10px] font-semibold text-[#FF3E00]">
            {roundedPercentage}%
          </span>
        </div>
      )}

      <div
        className="relative h-1.5 w-full overflow-hidden rounded-none bg-[#2A2A2A]"
        role="progressbar"
        aria-valuenow={roundedPercentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className={[
            'h-full',
            'bg-[#FF3E00]',
            'transition-[width] duration-500 ease-out',
          ].join(' ')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

