export default function QuizSummaryBar({
  attempts,
  averageScore,
  passRate,
}) {
  const stats = [
    {
      label: 'Attempts',
      value: attempts,
    },
    {
      label: 'Average score',
      value: `${averageScore}%`,
    },
    {
      label: 'Pass rate',
      value: `${passRate}%`,
    },
  ];

  return (
    <dl className="grid grid-cols-1 border border-neutral-800 bg-[#111111] sm:grid-cols-3">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={[
            'relative p-4 sm:p-5',
            index > 0
              ? 'border-t border-neutral-800 sm:border-l sm:border-t-0'
              : '',
          ].join(' ')}
        >
          <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
            {stat.label}
          </dt>

          <dd className="mt-2 font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {stat.value}
          </dd>

          <div className="absolute bottom-0 left-0 h-px w-0 bg-[#FF3E00] transition-all duration-300 hover:w-full" />
        </div>
      ))}
    </dl>
  );
}