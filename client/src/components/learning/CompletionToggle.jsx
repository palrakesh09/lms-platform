import { useState } from 'react';

import { useAuth } from '../../hooks/useAuth.js';

import {
  markConceptComplete,
  markConceptIncomplete,
} from '../../services/progressService.js';

import { getMutationError } from '../../utils/getMutationError.js';

import Icon from '../common/Icon.jsx';

export default function CompletionToggle({
  conceptId,
  completed,
  onChanged,
}) {
  const { expireSession } = useAuth();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const toggle = async () => {
    if (pending) return;

    setPending(true);
    setError('');

    try {
      const updated = completed
        ? await markConceptIncomplete(conceptId)
        : await markConceptComplete(conceptId);

      onChanged(updated);
    } catch (failure) {
      const info = getMutationError(failure);

      if (info.kind === 'unauthorized') {
        expireSession();
      }

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
        className={`
          inline-flex items-center gap-2
          border px-4 py-2.5
          text-sm font-semibold
          transition-all duration-200
          disabled:cursor-not-allowed
          disabled:opacity-50

          ${
            completed
              ? 'border-emerald-900/60 bg-emerald-950/20 text-emerald-400 hover:border-red-900/60 hover:bg-red-950/20 hover:text-red-400'
              : 'border-[#FF3E00] bg-[#FF3E00] text-black hover:bg-[#ff5722]'
          }
        `}
      >
        {pending ? (
          <>
            <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Saving...
          </>
        ) : completed ? (
          <>
            <Icon
              name="check"
              className="size-4"
            />
            Completed
          </>
        ) : (
          <>
            <span className="flex size-4 items-center justify-center border border-current">
              <span className="size-1.5" />
            </span>

            Mark as Complete
          </>
        )}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-2 text-xs text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}