// TestResultsPanel.jsx — never color-only: an explicit ✓/✗ glyph plus text label.
export default function TestResultsPanel({ results }) {
  if (!results) return null;
  return (
    <ul className="space-y-1 text-sm">
      {results.map((r, i) => (
        <li key={i} className={`flex items-center gap-2 ${r.passed ? 'text-emerald-700' : 'text-red-700'}`}>
          <span aria-hidden="true">{r.passed ? '✓' : '✗'}</span>
          <span>{r.name}</span>
          <span className="sr-only">{r.passed ? 'Passed' : 'Failed'}</span>
        </li>
      ))}
    </ul>
  );
}