import StatusBadge from '../common/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';

const th = 'px-4 py-3';

export default function QuizPerformanceTable({ quizzes }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <caption className="sr-only">Your quiz performance</caption>
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr><th scope="col" className={th}>Quiz</th><th scope="col" className={`${th} hidden sm:table-cell`}>Course</th><th scope="col" className={th}>Attempts</th><th scope="col" className={th}>Best</th><th scope="col" className={`${th} hidden md:table-cell`}>Latest</th><th scope="col" className={`${th} hidden md:table-cell`}>Average</th><th scope="col" className={th}>Status</th><th scope="col" className={`${th} hidden lg:table-cell`}>Last attempt</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {quizzes.map((quiz) => (
            <tr key={quiz.quizId}>
              <td className={th}>{quiz.quizTitle}</td>
              <td className={`${th} hidden text-slate-700 sm:table-cell`}>{quiz.courseTitle ?? '—'}</td>
              <td className={th}>{quiz.attempts}</td>
              <td className={th}>{quiz.bestScore}%</td>
              <td className={`${th} hidden md:table-cell`}>{quiz.latestScore}%</td>
              <td className={`${th} hidden md:table-cell`}>{quiz.averageScore}%</td>
              <td className={th}><StatusBadge status={quiz.passed ? 'active' : 'inactive'} label={quiz.passed ? 'Passed' : 'Failed'} /></td>
              <td className={`${th} hidden whitespace-nowrap lg:table-cell`}>{formatDate(quiz.lastAttemptedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}