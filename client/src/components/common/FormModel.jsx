import { primaryButton, secondaryButton } from './buttonClasses.js';
import Modal from './Modal.jsx';

export default function FormModal({
  title,
  form,
  submitLabel,
  pendingLabel,
  onClose,
  size,
  children,
}) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      dismissible={!form.isSubmitting}
      size={size}
    >
      <form
        onSubmit={form.handleSubmit}
        noValidate
        className="bg-[#111111]"
      >
        <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
          {form.formError && (
            <div
              role="alert"
              className="border border-[#7F1D1D] bg-[#1A0B0B] p-3 text-sm text-[#F87171]"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 bg-[#EF4444]" />
                <p>{form.formError}</p>
              </div>
            </div>
          )}

          {children}
        </div>

        <div className="
          flex flex-col-reverse gap-2
          border-t border-[#2A2A2A]
          bg-[#0A0A0A]
          px-4 py-3
          sm:flex-row sm:justify-end
          sm:px-6
        ">
          <button
            type="button"
            onClick={onClose}
            disabled={form.isSubmitting}
            className={secondaryButton}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={form.isSubmitting}
            className={primaryButton}
          >
            {form.isSubmitting ? pendingLabel : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}