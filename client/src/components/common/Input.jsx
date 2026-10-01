import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    id,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500"
        >
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          error
            ? `${id}-error`
            : hint
              ? `${id}-hint`
              : undefined
        }
        className={[
          'w-full min-h-11 rounded-sm border',
          'bg-[#111111] px-3.5 py-2.5 sm:py-3',
          'text-sm text-white',
          'placeholder:text-neutral-700',
          'transition-all duration-200',
          'focus:bg-[#151515] focus:outline-none',
          'focus:ring-1 focus:ring-[#FF3E00]/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
            : 'border-[#2A2A2A] focus:border-[#FF3E00]',
          className,
        ].join(' ')}
        {...props}
      />

      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 flex items-start gap-2 text-xs leading-5 text-red-400"
        >
          <span
            aria-hidden="true"
            className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"
          />
          <span>{error}</span>
        </p>
      )}

      {!error && hint && (
        <p
          id={`${id}-hint`}
          className="mt-2 text-xs leading-5 text-neutral-600"
        >
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;