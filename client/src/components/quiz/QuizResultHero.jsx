import { Icon } from "../common/Icon";

export default function QuizResultHero({
  score = 0,
  total = 0,
  passed = false,
  title = "Quiz Complete",
}) {
  const percentage =
    total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <section className="border border-[var(--border)] bg-[#111] p-6 sm:p-10">
      <div className="grid gap-8 md:grid-cols-[1fr_220px] md:items-center">
        <div>
          <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--accent)]">
            Assessment Result
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Your assessment has been evaluated. Review your performance
            and continue your learning journey.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 border border-[var(--border)] px-3 py-2 font-mono text-[9px] uppercase tracking-wider">
            <span
              className={
                passed
                  ? "text-[var(--success)]"
                  : "text-[var(--warning)]"
              }
            >
              {passed ? "Passed" : "Needs Review"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border border-[var(--border)] bg-[#0A0A0A] p-8">
          <div className="font-mono text-5xl font-bold text-white">
            {percentage}%
          </div>

          <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
            {score} / {total} correct
          </div>

          <div className="mt-5 h-[2px] w-full bg-[#222]">
            <div
              className="h-full bg-[var(--accent)]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}