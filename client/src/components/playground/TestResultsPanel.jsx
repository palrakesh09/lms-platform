export default function TestResultsPanel({
  results,
}) {
  if (!results) {
    return null;
  }

  return (
    <div className="border border-[#2A2A2A] bg-[#111111]">
      <div className="border-b border-[#2A2A2A] px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          Test Results
        </span>
      </div>

      <ul className="space-y-1 p-3 text-sm">
        {results.map((result, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 ${
              result.passed
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            <span
              aria-hidden="true"
              className="font-mono"
            >
              {result.passed ? '✓' : '✗'}
            </span>

            <span className="break-words">
              {result.name}
            </span>

            <span className="sr-only">
              {result.passed
                ? 'Passed'
                : 'Failed'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

