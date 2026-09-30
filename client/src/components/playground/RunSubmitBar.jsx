// RunSubmitBar.jsx — Run and Submit are visually and semantically distinct, per §14.
import { primaryButton, secondaryButton } from '../common/buttonClasses.js';
export default function RunSubmitBar({ onRun, onSubmit, onReset, running }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onRun} disabled={running} className={secondaryButton}>{running ? 'Running…' : 'Run'}</button>
      <button type="button" onClick={onSubmit} disabled={running} className={primaryButton}>Submit</button>
      <button type="button" onClick={() => { if (window.confirm('Reset to the starter code? Your changes will be lost.')) onReset(); }} className={secondaryButton}>Reset</button>
    </div>
  );
}