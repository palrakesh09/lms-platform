import { primaryButton, secondaryButton } from './buttonClasses.js';
import Modal from './Modal.jsx';

// A modal wrapping a form from useForm: error banner, Cancel and Submit. Fields are the children.
export default function FormModal({ title, form, submitLabel, pendingLabel, onClose, size, children }) {
  return (
    <Modal title={title} onClose={onClose} dismissible={!form.isSubmitting} size={size}>
      <form onSubmit={form.handleSubmit} noValidate>
        <div className="space-y-4 px-5 py-4">
          {form.formError && (
            <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
              {form.formError}
            </div>
          )}
          {children}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button type="button" onClick={onClose} disabled={form.isSubmitting} className={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={form.isSubmitting} className={primaryButton}>
            {form.isSubmitting ? pendingLabel : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}