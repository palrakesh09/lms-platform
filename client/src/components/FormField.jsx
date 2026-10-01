import { useId } from 'react';

export default function FormField({
  label,
  error,
  ...inputProps
}) {
  const id = useId();
  const errorId = `${id}-error`;

  const isPassword = inputProps.type === 'password';

  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`block h-12 w-full border bg-[#0A0A0A] px-3 text-sm text-white outline-none transition placeholder:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 ${
            isPassword ? 'pr-4' : ''
          } ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-neutral-800 focus:border-[#FF3E00]'
          }`}
          {...inputProps}
        />
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 font-mono text-[10px] text-red-400"
        >
          ERROR: {error}
        </p>
      )}
    </div>
  );
}