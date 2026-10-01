import { Icon } from "../common/Icon";

export default function CompletionBanner({
  completed = false,
  onComplete,
  loading = false,
}) {
  return (
    <div
      className={[
        "flex flex-col gap-4 border p-4 sm:flex-row sm:items-center sm:justify-between",
        completed
          ? "border-[var(--success)]/30 bg-[var(--success)]/[0.05]"
          : "border-[var(--border)] bg-[var(--surface)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-9 w-9 items-center justify-center border",
            completed
              ? "border-[var(--success)]/40 text-[var(--success)]"
              : "border-[var(--border)] text-[var(--muted)]",
          ].join(" ")}
        >
          <Icon
            name={completed ? "check" : "circle"}
            size={15}
          />
        </div>

        <div>
          <div className="text-sm font-semibold text-white">
            {completed ? "Resource completed" : "Mark resource complete"}
          </div>

          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-[var(--muted)]">
            {completed
              ? "Progress saved"
              : "Complete this resource to update your progress"}
          </div>
        </div>
      </div>

      {!completed && (
        <button
          type="button"
          disabled={loading}
          onClick={onComplete}
          className="inline-flex h-10 items-center justify-center gap-2 bg-[var(--accent)] px-5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-black transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="check" size={13} />

          {loading ? "Saving..." : "Complete"}
        </button>
      )}
    </div>
  );
}