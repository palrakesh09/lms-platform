export default function FilterDropdown({
  id,
  label,
  value,
  options,
  onChange,
  allLabel = 'All',
}) {
  return (
    <div className="group w-full">
      <label
        htmlFor={id}
        className={[
          'mb-2 block',
          'font-mono text-[10px] font-semibold',
          'uppercase tracking-[0.15em]',
          'text-neutral-500',
        ].join(' ')}
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={[
            'min-h-11 w-full appearance-none',
            'rounded-sm border border-[#2A2A2A]',
            'bg-[#111111]',
            'px-3 pr-10',
            'text-sm text-neutral-300',
            'transition-all duration-200',
            'outline-none',
            'hover:border-[#3A3A3A]',
            'focus:border-[#FF3E00]',
            'focus:bg-[#151515]',
            'focus:ring-1 focus:ring-[#FF3E00]/20',
          ].join(' ')}
        >
          <option value="" className="bg-[#111111]">
            {allLabel}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#111111]"
            >
              {option.label}
            </option>
          ))}
        </select>

        <span
          aria-hidden="true"
          className={[
            'pointer-events-none absolute right-3 top-1/2',
            '-translate-y-1/2',
            'font-mono text-xs text-neutral-600',
            'transition-colors duration-200',
            'group-focus-within:text-[#FF3E00]',
          ].join(' ')}
        >
          ↓
        </span>
      </div>
    </div>
  );
}

