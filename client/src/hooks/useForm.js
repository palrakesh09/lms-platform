import { useCallback, useRef, useState } from 'react';
import { getMutationError } from '../utils/getMutationError.js';
import { useAuth } from './useAuth.js';

const focusFirstInvalid = (form) => {
  setTimeout(() => form?.querySelector('[aria-invalid="true"]')?.focus(), 0);
};

// Form state and submission for every create/edit form.
//   validate(values) -> { field: message }   client-side checks. The server stays authoritative.
//   onSubmit(values)                          performs the request; throw to report a failure
// Guarantees: no double submission (ref guard, not just a disabled button), server field errors shown
// under the right input, other failures shown as one message, and a 401 drops the session.
export function useForm({ initialValues, validate, onSubmit }) {
  const { expireSession } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inFlight = useRef(false);

  const setValue = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!(name in current)) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  // Props for a control: <TextField {...form.field('title')} />
  const field = (name) => ({
    name,
    value: values[name],
    error: fieldErrors[name],
    disabled: isSubmitting,
    onChange: (event) => setValue(name, event.target.type === 'checkbox' ? event.target.checked : event.target.value),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;

    const formElement = event.currentTarget;
    const problems = validate ? validate(values) : {};

    if (Object.keys(problems).length > 0) {
      setFieldErrors(problems);
      setFormError('Please fix the highlighted fields.');
      focusFirstInvalid(formElement);
      return;
    }

    inFlight.current = true;
    setIsSubmitting(true);
    setFieldErrors({});
    setFormError('');

    try {
      await onSubmit(values);
    } catch (error) {
      const info = getMutationError(error);
      if (info.kind === 'unauthorized') expireSession();

      // Field errors are only useful if this form has that field. Otherwise show the message instead.
      const hasVisibleFieldError = Object.keys(info.fieldErrors).some((name) => name in initialValues);
      setFieldErrors(info.fieldErrors);
      setFormError(hasVisibleFieldError ? 'Please fix the highlighted fields.' : info.message);
      focusFirstInvalid(formElement);
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return { values, field, setValue, fieldErrors, formError, isSubmitting, handleSubmit };
}