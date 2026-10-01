export default function ConsolePanel({
  lines,
  onClear,
}) {
  return (
    <div className="overflow-hidden border border-[#2A2A2A] bg-[#0D0D0D]">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] bg-[#111111] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-[#22C55E]" />

          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            Console
          </span>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 transition hover:text-[#FF3E00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00]"
        >
          Clear
        </button>
      </div>

      <pre
        role="log"
        aria-live="polite"
        className="max-h-40 min-h-20 overflow-x-auto overflow-y-auto p-3 font-mono text-xs leading-6 text-neutral-300"
      >
        {lines.join('\n') || 'No output yet.'}
      </pre>
    </div>
  );
}

