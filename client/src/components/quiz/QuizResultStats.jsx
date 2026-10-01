export default function QuizResultStats({
  score = 0,
  total = 0,
  correct = 0,
  incorrect = 0,
}) {
  const stats = [
    {
      label: "Score",
      value: `${score}%`,
    },
    {
      label: "Correct",
      value: correct,
    },
    {
      label: "Incorrect",
      value: incorrect,
    },
    {
      label: "Questions",
      value: total,
    },
  ];

  return (
    <div className="grid grid-cols-2 border-l border-t border-[var(--border)] sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="border-b border-r border-[var(--border)] bg-[#111] p-5"
        >
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
            {stat.label}
          </div>

          <div className="mt-2 text-2xl font-bold text-white">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}