export default function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const buttonBase = [
    'inline-flex min-h-10 items-center justify-center',
    'rounded-sm border px-3 sm:px-4',
    'text-xs sm:text-sm font-semibold',
    'transition-all duration-200',
    'focus-visible:outline-2',
    'focus-visible:outline-offset-2',
    'focus-visible:outline-[#FF3E00]',
    'disabled:cursor-not-allowed',
    'disabled:opacity-30',
  ].join(' ');

  return (
    <nav
      aria-label="Pagination"
      className={[
        'mt-8 flex items-center justify-between gap-3',
        'border-t border-[#2A2A2A] pt-5',
        'sm:gap-4',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={[
          buttonBase,
          'border-[#3A3A3A] bg-transparent text-neutral-300',
          'hover:border-[#FF3E00] hover:text-[#FF3E00]',
        ].join(' ')}
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>

      <p
        className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-600 sm:text-xs"
        aria-live="polite"
      >
        <span className="text-neutral-300">{page}</span>
        <span className="mx-1.5">/</span>
        <span>{totalPages}</span>
      </p>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={[
          buttonBase,
          'border-[#3A3A3A] bg-transparent text-neutral-300',
          'hover:border-[#FF3E00] hover:text-[#FF3E00]',
        ].join(' ')}
      >
        Next
      </button>
    </nav>
  );
}

