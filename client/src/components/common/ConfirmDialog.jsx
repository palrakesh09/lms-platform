import { useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { getMutationError } from '../../utils/getMutationError.js';
import { dangerButton, primaryButton, secondaryButton } from './buttonClasses.js';
import Modal from './Modal.jsx';

// Confirmation for any status-changing or destructive action.
//   onConfirm()  performs the request and throws on failure. On failure the dialog stays open and shows the
//                reason (for example the API's "cannot delete because it contains topics" 409 message).
//   onClose()    called on Cancel, and automatically after a successful confirm.
// Focus starts on Cancel, so pressing Enter by reflex never destroys anything.
export default function ConfirmDialog({
  title,
  children,
  confirmLabel = 'Confirm',
  pendingLabel = 'Working…',
  tone = 'primary',
  onConfirm,
  onClose,
}) {
  const { expireSession } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);

  const handleConfirm = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError('');

    try {
      await onConfirm();
      onClose();
    } catch (failure) {
      const info = getMutationError(failure);
      if (info.kind === 'unauthorized') expireSession();
      setError(info.message);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} dismissible={!pending} size="sm">
      <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
        {children}
        {error && (
          <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-red-700 ring-1 ring-inset ring-red-200">
            {error}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
        <button type="button" data-autofocus onClick={onClose} disabled={pending} className={secondaryButton}>
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={pending}
          className={tone === 'danger' ? dangerButton : primaryButton}
        >
          {pending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}