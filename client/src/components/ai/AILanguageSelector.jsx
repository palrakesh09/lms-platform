const OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'hinglish', label: 'Hinglish' },
];

export default function AILanguageSelector({
  value,
  onChange,
}) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">
        Response language
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Response language"
        className="
          min-h-8
          appearance-none
          border border-[#2A2A2A]
          bg-[#0A0A0A]
          py-1 pl-2 pr-7
          font-mono text-[9px] font-bold uppercase tracking-wider
          text-neutral-400
          transition-colors
          hover:border-[#3A3A3A]
          focus:border-[#FF3E00]
          focus:outline-none
          focus:ring-1
          focus:ring-[#FF3E00]
        "
      >
        {OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#111111] text-white"
          >
            {option.label}
          </option>
        ))}
      </select>

      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute right-2 top-1/2
          -translate-y-1/2 text-[8px] text-neutral-600
        "
      >
        ▼
      </span>
    </label>
  );
}

