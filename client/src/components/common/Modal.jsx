import { useEffect, useId, useRef } from 'react';
import Icon from './Icon.jsx';

const SIZES = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

// Built on the native <dialog>: showModal() gives a focus trap, an inert background, Escape handling and
// focus restoration to the opener, without a library. Render it only while it should be open.
// Put data-autofocus on the element that should receive focus first (otherwise the close button does).
// `dismissible` is false while a request is running, so a click or Escape can't hide a pending action.
export default function Modal({ title, onClose, dismissible = true, size = 'md', children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('[data-autofocus]')?.focus();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault(); // Escape: let React decide by unmounting us
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> element itself, not on its content.
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      className={`m-auto max-h-[90dvh] w-[calc(100%-2rem)] ${SIZES[size]} flex-col overflow-hidden rounded-xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50 open:flex`}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
        <h2 id={titleId} className="min-w-0 wrap-break-word text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          disabled={!dismissible}
          aria-label="Close dialog"
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          <Icon name="x" className="size-5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </dialog>
  );
}