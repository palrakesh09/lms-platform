import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { markConceptComplete, markConceptIncomplete } from '../../services/progressService.js';
import { getMutationError } from '../../utils/getMutationError.js';
import { primaryButton, secondaryButton } from '../common/buttonClasses.js';

// Completion is tracked at the CONCEPT level (the Progress model has no per-resource field), so this
// applies to the whole concept, whichever of its resources is currently open. It is always explicit —
// opening a resource never sets it (see ResourcePage's access-recording effect, which only ever
// touches lastAccessedAt) — and the button always reflects the server's last confirmed response: a
// failed request leaves it exactly as it was.
export default function CompletionToggle({ conceptId, completed, onChanged }) {
  const { expireSession } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const toggle = async () => {
    if (pending) return;
    setPending(true);
    setError('');

    try {
      const updated = completed ? await markConceptIncomplete(conceptId) : await markConceptComplete(conceptId);
      onChanged(updated);
    } catch (failure) {
      const info = getMutationError(failure);
      if (info.kind === 'unauthorized') expireSession();
      setError(info.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={completed}
        className={completed ? secondaryButton : primaryButton}
      >
        {pending ? 'Saving…' : completed ? '✓ Completed — click to undo' : 'Mark as Complete'}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}