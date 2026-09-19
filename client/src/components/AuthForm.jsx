import { useState } from 'react';
import { getErrorMessage } from '../utils/getErrorMessage.js';
import { getFieldErrors } from '../utils/getFieldErrors.js';
import FormField from './FormField.jsx';

// Shared form for login and register. `fields` is a list of { name, label, type, autoComplete, required }.
// Validation is done by the API (noValidate turns off the browser's own checks), so the server is
// the single source of truth and its field errors are shown under each input.
export default function AuthForm({ fields, submitLabel, pendingLabel, onSubmit }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.name, ''])),
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError('');
    setIsSubmitting(true);

    try {
      await onSubmit(values);
      // On success the route guard redirects, so there is nothing to do here.
    } catch (error) {
      const errors = getFieldErrors(error);
      setFieldErrors(errors);
      setFormError(Object.keys(errors).length > 0 ? '' : getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <div
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200"
        >
          {formError}
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
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}