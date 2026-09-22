import { secondaryButton } from './buttonClasses.js';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={secondaryButton}>
        Previous
      </button>
      <p className="text-sm text-slate-600" aria-live="polite">
        Page {page} of {totalPages}
      </p>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={secondaryButton}
      >
        Next
      </button>
    </nav>
  );
}