import { formatPercentage } from '../../utils/progress.js';

// Accessible progress indicator. Completion is never conveyed by color alone: the percentage and the
// "X / Y completed" fraction are always shown as text next to the bar.
export default function ProgressBar({ completed, total, label = 'Course progress', size = 'md' }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-medium text-slate-900">{formatPercentage(percentage)}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={`mt-1 w-full overflow-hidden rounded-full bg-slate-200 ${height}`}
      >
        <div className={`${height} rounded-full bg-indigo-600 transition-all`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-600">
        {completed} / {total} concept{total === 1 ? '' : 's'} completed
      </p>
    </div>
  );
}