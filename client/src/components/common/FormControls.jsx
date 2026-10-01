import { useId } from 'react';

const controlClass = (error) =>
  [
    'mt-1 block w-full min-h-11',
    'rounded-sm border bg-[#111111]',
    'px-3 py-2 text-sm text-white',
    'placeholder:text-neutral-600',
    'shadow-none transition-all duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-1',
    'focus-visible:outline-[#FF3E00]',
    'disabled:cursor-not-allowed disabled:opacity-50',
    error
      ? 'border-[#EF4444] focus-visible:outline-[#EF4444]'
      : 'border-[#2A2A2A] hover:border-[#3A3A3A]',
  ].join(' ');

function Field({
  label,
  hint,
  error,
  required,
  children,
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint && hintId, error && errorId]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400"
      >
        {label}

        {required && (
          <span
            aria-hidden="true"
            className="ml-1 text-[#FF3E00]"
          >
            *
          </span>
        )}
      </label>

      {children({
        id,
        required,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': describedBy,
      })}

      {hint && (
        <p
          id={hintId}
          className="mt-1.5 text-xs leading-5 text-neutral-500"
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="mt-1.5 text-xs leading-5 text-[#F87171]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  required,
  ...inputProps
}) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      {(aria) => (
        <input
          {...aria}
          {...inputProps}
          className={controlClass(error)}
        />
      )}
    </Field>
  );
}

export function TextareaField({
  label,
  hint,
  error,
  required,
  rows = 4,
  ...textareaProps
}) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      {(aria) => (
        <textarea
          {...aria}
          rows={rows}
          {...textareaProps}
          className={`${controlClass(error)} min-h-0 resize-y`}
        />
      )}
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  options,
  ...selectProps
}) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      {(aria) => (
        <select
          {...aria}
          {...selectProps}
          className={controlClass(error)}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#111111] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function CheckboxField({
  label,
  hint,
  value,
  ...inputProps
}) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={Boolean(value)}
        aria-describedby={hint ? hintId : undefined}
        {...inputProps}
        className="
          mt-0.5 size-4 shrink-0
          rounded-sm border-[#3A3A3A]
          bg-[#111111]
          text-[#FF3E00]
          accent-[#FF3E00]
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[#FF3E00]
        "
      />

      <div className="min-w-0">
        <label
          htmlFor={id}
          className="text-sm font-medium text-neutral-300"
        >
          {label}
        </label>

        {hint && (
          <p
            id={hintId}
            className="mt-1 text-xs leading-5 text-neutral-500"
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}