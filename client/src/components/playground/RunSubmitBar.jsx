import {
  primaryButton,
  secondaryButton,
} from '../common/buttonClasses.js';

export default function RunSubmitBar({
  onRun,
  onSubmit,
  onReset,
  running,
}) {
  const handleReset = () => {
    if (
      window.confirm(
        'Reset to the starter code? Your changes will be lost.'
      )
    ) {
      onReset();
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <button
        type="button"
        onClick={onRun}
        disabled={running}
        className={`${secondaryButton} w-full sm:w-auto`}
      >
        {running ? 'Running…' : 'Run'}
      </button>

      <button
        type="button"
        onClick={onSubmit}
        disabled={running}
        className={`${primaryButton} w-full sm:w-auto`}
      >
        Submit
      </button>

      <button
        type="button"
        onClick={handleReset}
        disabled={running}
        className={`${secondaryButton} w-full sm:w-auto`}
      >
        Reset
      </button>
    </div>
  );
}

