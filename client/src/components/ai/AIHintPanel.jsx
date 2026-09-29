// AIHintPanel.jsx
import { secondaryButton } from '../common/buttonClasses.js';

export default function AIHintPanel({ onHint, disabled }) {
  return (
    <div className="border-t border-slate-200 p-2">
      <button type="button" disabled={disabled} onClick={onHint} className={secondaryButton}>Give me a hint</button>
      <p className="mt-1 text-xs text-slate-600">Hints get more specific each time you ask — never the full answer right away.</p>
    </div>
  );
}