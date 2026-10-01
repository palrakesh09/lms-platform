import { RANGES } from '../../hooks/useAnalyticsRange.js';

export default function RangeSelector({
  value,
  onChange,
}) {
  return (
    <div
      role="group"
      aria-label="Date range"
      className="grid w-full grid-cols-2 border border-neutral-800 bg-[#0A0A0A] p-1 sm:inline-flex sm:w-auto sm:grid-cols-none"
    >
      {RANGES.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={[
              'min-h-9 px-3 py-2',
              'font-mono text-[10px] font-bold uppercase tracking-wider',
              'transition-all duration-200',
              'focus-visible:outline-2 focus-visible:outline-offset-2',
              'focus-visible:outline-[#FF3E00]',
              'touch-manipulation',
              isActive
                ? 'bg-[#FF3E00] text-white'
                : 'text-neutral-500 hover:bg-[#171717] hover:text-white',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

