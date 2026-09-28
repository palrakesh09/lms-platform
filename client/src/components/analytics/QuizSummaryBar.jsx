export default function QuizSummaryBar({ attempts, averageScore, passRate }) {
  return (
    <dl className="grid grid-cols-3 gap-4 rounded-lg border border-slate-200 bg-white p-4 text-center">
      <div><dt className="text-xs text-slate-600">Attempts</dt><dd className="mt-1 text-xl font-bold text-slate-900">{attempts}</dd></div>
      <div><dt className="text-xs text-slate-600">Average score</dt><dd className="mt-1 text-xl font-bold text-slate-900">{averageScore}%</dd></div>
      <div><dt className="text-xs text-slate-600">Pass rate</dt><dd className="mt-1 text-xl font-bold text-slate-900">{passRate}%</dd></div>
    </dl>
  );
}