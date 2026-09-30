// ConsolePanel.jsx
import { secondaryButton } from '../common/buttonClasses.js';
export default function ConsolePanel({ lines, onClear }) {
  return (
    <div className="rounded-md border border-slate-300 bg-slate-900 p-2">
      <div className="mb-1 flex justify-end"><button type="button" onClick={onClear} className="text-xs text-slate-300 underline">Clear</button></div>
      <pre role="log" aria-live="polite" className="max-h-32 overflow-y-auto font-mono text-xs text-slate-100">{lines.join('\n') || 'No output yet.'}</pre>
    </div>
  );
}