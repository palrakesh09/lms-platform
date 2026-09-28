import { RANGES } from '../../hooks/useAnalyticsRange.js';

export default function RangeSelector({ value, onChange }) {
  return (
    <div role="group" aria-label="Date range" className="inline-flex rounded-md border border-slate-300 bg-white p-0.5">
      {RANGES.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            value === option.value ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}