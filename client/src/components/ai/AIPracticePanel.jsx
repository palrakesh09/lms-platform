const OPTIONS = [
  { value: "mcq", label: "Multiple choice", short: "MCQ" },
  { value: "short-answer", label: "Short answer", short: "Short" },
  { value: "coding", label: "Coding exercise", short: "Code" },
];
export default function AIPracticePanel({ onGenerate, disabled }) {
  return (
    <div className="shrink-0 border-t border-[#2A2A2A] bg-[#111111] p-2.5">
      {" "}
      <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-600">
        {" "}
        Practice type{" "}
      </p>{" "}
      <div className="grid grid-cols-3 gap-1.5">
        {" "}
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onGenerate(option.value)}
            title={option.label}
            className=" min-h-9 border border-[#2A2A2A] bg-[#0A0A0A] px-2 font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-500 transition-all duration-200 hover:border-[#FF3E00] hover:text-[#FF3E00] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00] "
          >
            {" "}
            <span className="sm:hidden">{option.short}</span>{" "}
            <span className="hidden sm:inline">{option.label}</span>{" "}
          </button>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
