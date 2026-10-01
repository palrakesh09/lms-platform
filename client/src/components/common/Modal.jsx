import { useEffect, useId, useRef } from 'react';
import Icon from './Icon.jsx';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

// Native <dialog> provides focus trapping, inert background,
// Escape handling, and focus restoration automatically.
export default function Modal({
  title,
  onClose,
  dismissible = true,
  size = 'md',
  children,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog.open) {
      dialog.showModal();
    }

    dialog.querySelector('[data-autofocus]')?.focus();

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();

        if (dismissible) {
          onClose();
        }
      }}
      onClick={(event) => {
        if (
          dismissible &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
      className={[
        'm-auto flex max-h-[90dvh]',
        'w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)]',
        SIZES[size] ?? SIZES.md,
        'flex-col overflow-hidden',
        'rounded-sm border border-[#2A2A2A]',
        'bg-[#111111] p-0 text-white',
        'shadow-[0_24px_80px_rgba(0,0,0,0.65)]',
        'backdrop:bg-black/75',
        'backdrop:backdrop-blur-sm',
        'open:flex',
      ].join(' ')}
    >
      {/* Header */}
      <div
        className={[
          'flex shrink-0 items-center justify-between gap-4',
          'border-b border-[#2A2A2A]',
          'bg-[#111111]',
          'px-4 py-3.5 sm:px-5',
        ].join(' ')}
      >
        <div className="min-w-0">
          <div className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#FF3E00]">
            Dialog
          </div>

          <h2
            id={titleId}
            className="min-w-0 wrap-break-word text-base font-semibold tracking-tight text-white sm:text-lg"
          >
            {title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={!dismissible}
          aria-label="Close dialog"
          className={[
            'flex size-9 shrink-0 items-center justify-center',
            'rounded-sm border border-[#2A2A2A]',
            'bg-[#171717] text-neutral-500',
            'transition-all duration-200',
            'hover:border-[#FF3E00]/60',
            'hover:bg-[#1D1D1D] hover:text-[#FF3E00]',
            'focus-visible:outline-2',
            'focus-visible:outline-offset-2',
            'focus-visible:outline-[#FF3E00]',
            'disabled:cursor-not-allowed disabled:opacity-40',
          ].join(' ')}
        >
          <Icon name="x" className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="p-4 sm:p-5">
          {children}
        </div>
      </div>
    </dialog>
  );
}

