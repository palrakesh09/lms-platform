import { Icon } from "../common/Icon";

export default function QuizNavigation({
  isFirst = false,
  isLast = false,
  canContinue = false,
  onPrevious,
  onNext,
  onSubmit,
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-6">
      <button
        type="button"
        disabled={isFirst}
        onClick={onPrevious}
        className="inline-flex h-11 items-center gap-2 border border-[var(--border)] px-4 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] transition-colors hover:border-white/20 hover:text-white disabled:pointer-events-none disabled:opacity-30"
      >
        <Icon name="arrow-left" size={13} />
        Previous
      </button>

      {isLast ? (
        <button
          type="button"
          disabled={!canContinue}
          onClick={onSubmit}
          className="inline-flex h-11 items-center gap-2 bg-[var(--accent)] px-5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-black transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
        >
          Submit Quiz
          <Icon name="check" size={13} />
        </button>
      ) : (
        <button
          type="button"
          disabled={!canContinue}
          onClick={onNext}
          className="inline-flex h-11 items-center gap-2 bg-[var(--accent)] px-5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-black transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
        >
          Next
          <Icon name="arrow-right" size={13} />
        </button>
      )}
    </div>
  );
}