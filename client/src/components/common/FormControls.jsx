import { useId } from 'react';

const controlClass = (error) =>
  `mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 disabled:bg-slate-100 ${
    error ? 'border-red-400' : 'border-slate-300'
  }`;

// Label, hint and error wiring shared by every control. `children` receives the props the control needs.
function Field({ label, hint, error, required, children }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span aria-hidden="true" className="text-red-600">
            {' '}
            *
          </span>
        )}
      </label>
      {children({ id, required, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy })}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-slate-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({ label, hint, error, required, ...inputProps }) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(aria) => <input {...aria} {...inputProps} className={controlClass(error)} />}
    </Field>
  );
}

export function TextareaField({ label, hint, error, required, rows = 4, ...textareaProps }) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(aria) => <textarea {...aria} rows={rows} {...textareaProps} className={controlClass(error)} />}
    </Field>
  );
}

export function SelectField({ label, hint, error, required, options, ...selectProps }) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(aria) => (
        <select {...aria} {...selectProps} className={controlClass(error)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function CheckboxField({ label, hint, value, ...inputProps }) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="flex items-start gap-2">
      <input
        id={id}
        type="checkbox"
        checked={Boolean(value)}
        aria-describedby={hint ? hintId : undefined}
        {...inputProps}
        className="mt-0.5 size-4 rounded border-slate-300 text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {hint && (
          <p id={hintId} className="text-xs text-slate-600">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}