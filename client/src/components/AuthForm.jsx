import { useState } from 'react';
import { getErrorMessage } from '../utils/getErrorMessage.js';
import { getFieldErrors } from '../utils/getFieldErrors.js';
import FormField from './FormField.jsx';

export default function AuthForm({
  fields,
  submitLabel,
  pendingLabel,
  onSubmit,
}) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.map((field) => [field.name, '']),
    ),
  );

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }

    if (formError) {
      setFormError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFieldErrors({});
    setFormError('');
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      const errors = getFieldErrors(error);

      setFieldErrors(errors);

      setFormError(
        Object.keys(errors).length > 0
          ? ''
          : getErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      {formError && (
        <div
          role="alert"
          className="border border-red-900 bg-red-950/30 px-4 py-3"
        >
          <p className="font-mono text-[10px] uppercase tracking-wider text-red-400">
            Authentication error
          </p>

          <p className="mt-1 text-sm text-red-300">
            {formError}
          </p>
        </div>
      )}

      {fields.map((field) => (
        <FormField
          key={field.name}
          {...field}
          value={values[field.name]}
          onChange={handleChange}
          error={fieldErrors[field.name]}
          disabled={isSubmitting}
        />
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative flex h-12 w-full items-center justify-center overflow-hidden bg-[#FF3E00] px-4 text-sm font-bold text-black transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>
          {isSubmitting ? pendingLabel : submitLabel}
        </span>

        {!isSubmitting && (
          <span className="ml-3 transition-transform group-hover:translate-x-1">
            →
          </span>
        )}
      </button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-neutral-800" />

        <span className="font-mono text-[9px] text-neutral-700">
          AUTHORIZED ACCESS
        </span>

        <span className="h-px flex-1 bg-neutral-800" />
      </div>
    </form>
  );
}