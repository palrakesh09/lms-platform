import StatusBadge from '../common/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';

const th =
  'px-3 py-3 sm:px-4 sm:py-3';

export default function QuizPerformanceTable({ quizzes }) {
  return (
    <div className="w-full overflow-x-auto border border-neutral-800 bg-[#111111]">
      <table className="min-w-[720px] w-full text-left text-sm">
        <caption className="sr-only">
          Your quiz performance
        </caption>

        <thead className="border-b border-neutral-800 bg-[#171717]">
          <tr>
            <th
              scope="col"
              className={`${th} font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500`}
            >
              Quiz
            </th>

            <th
              scope="col"
              className={`${th} hidden font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 sm:table-cell`}
            >
              Course
            </th>

            <th
              scope="col"
              className={`${th} font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500`}
            >
              Attempts
            </th>

            <th
              scope="col"
              className={`${th} font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500`}
            >
              Best
            </th>

            <th
              scope="col"
              className={`${th} hidden font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 md:table-cell`}
            >
              Latest
            </th>

            <th
              scope="col"
              className={`${th} hidden font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 md:table-cell`}
            >
              Average
            </th>

            <th
              scope="col"
              className={`${th} font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500`}
            >
              Status
            </th>

            <th
              scope="col"
              className={`${th} hidden font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 lg:table-cell`}
            >
              Last attempt
            </th>
          </tr>
        </thead>

        <tbody>
          {quizzes.map((quiz) => (
            <tr
              key={quiz.quizId}
              className="border-b border-neutral-800/80 transition-colors last:border-b-0 hover:bg-[#171717]"
            >
              <td
                className={`${th} max-w-[220px]`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">
                    {quiz.quizTitle}
                  </p>

                  {/* Course shown on mobile where the course column is hidden */}
                  <p className="mt-1 truncate text-xs text-neutral-600 sm:hidden">
                    {quiz.courseTitle ?? '—'}
                  </p>
                </div>
              </td>

              <td
                className={`${th} hidden max-w-[220px] truncate text-neutral-400 sm:table-cell`}
              >
                {quiz.courseTitle ?? '—'}
              </td>

              <td
                className={`${th} font-mono text-xs text-neutral-400`}
              >
                {quiz.attempts}
              </td>

              <td
                className={`${th} font-mono text-xs font-semibold text-white`}
              >
                {quiz.bestScore}%
              </td>

              <td
                className={`${th} hidden font-mono text-xs text-neutral-400 md:table-cell`}
              >
                {quiz.latestScore}%
              </td>

              <td
                className={`${th} hidden font-mono text-xs text-neutral-400 md:table-cell`}
              >
                {quiz.averageScore}%
              </td>

              <td className={th}>
                <StatusBadge
                  status={
                    quiz.passed
                      ? 'active'
                      : 'inactive'
                  }
                  label={
                    quiz.passed
                      ? 'Passed'
                      : 'Failed'
                  }
                />
              </td>

              <td
                className={`${th} hidden whitespace-nowrap font-mono text-xs text-neutral-500 lg:table-cell`}
              >
                {formatDate(quiz.lastAttemptedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

