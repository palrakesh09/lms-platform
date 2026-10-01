import { Icon } from "../common/Icon";

export default function QuizHeader({
  title,
  currentQuestion = 1,
  totalQuestions = 1,
  timeLeft,
  onExit,
}) {
  const formatTime = (seconds) => {
    if (seconds == null) return "--:--";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const isLowTime = typeof timeLeft === "number" && timeLeft <= 60;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[#0A0A0A]/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onExit}
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-white/20 hover:text-white"
          aria-label="Exit quiz"
        >
          <Icon name="arrow-left" size={15} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--accent)]">
            Assessment
          </div>

          <div className="truncate text-sm font-semibold text-white">
            {title || "Quiz"}
          </div>
        </div>

        <div className="hidden items-center gap-2 font-mono text-[10px] text-[var(--muted)] sm:flex">
          <span>QUESTION</span>
          <span className="text-white">
            {String(currentQuestion).padStart(2, "0")}
          </span>
          <span>/</span>
          <span>{String(totalQuestions).padStart(2, "0")}</span>
        </div>

        {timeLeft != null && (
          <div
            className={[
              "flex h-9 items-center gap-2 border px-3 font-mono text-xs font-bold",
              isLowTime
                ? "border-[var(--danger)]/50 text-[var(--danger)]"
                : "border-[var(--border)] text-white",
            ].join(" ")}
          >
            <Icon name="clock" size={13} />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="h-[2px] bg-[#1A1A1A]">
        <div
          className="h-full bg-[var(--accent)] transition-[width] duration-300"
          style={{
            width: `${
              totalQuestions
                ? (currentQuestion / totalQuestions) * 100
                : 0
            }%`,
          }}
        />
      </div>
    </header>
  );
}