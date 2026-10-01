import ProgressBar from '../common/ProgressBar.jsx';
import StatusBadge from '../common/StatusBadge.jsx';

const cell =
  'px-3 py-3 sm:px-4 sm:py-4';

export default function CourseAnalyticsTable({ courses }) {
  return (
    <div className="w-full overflow-x-auto border border-neutral-800 bg-[#111111]">
      <table className="min-w-[900px] w-full text-left text-sm">
        <caption className="sr-only">
          Course analytics
        </caption>

        <thead className="border-b border-neutral-800 bg-[#171717]">
          <tr>
            <th
              scope="col"
              className={`${cell} font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500`}
            >
              Course
            </th>

            <th
              scope="col"
              className={`${cell} font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500`}
            >
              Status
            </th>

            <th
              scope="col"
              className={`${cell} hidden font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 md:table-cell`}
            >
              Concepts
            </th>

            <th
              scope="col"
              className={`${cell} hidden font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 lg:table-cell`}
            >
              Quizzes
            </th>

            <th
              scope="col"
              className={`${cell} font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500`}
            >
              Active learners
            </th>

            <th
              scope="col"
              className={`${cell} font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500`}
            >
              Avg. progress
            </th>

            <th
              scope="col"
              className={`${cell} hidden font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 lg:table-cell`}
            >
              Quiz attempts
            </th>

            <th
              scope="col"
              className={`${cell} font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500`}
            >
              Quiz avg / pass
            </th>
          </tr>
        </thead>

        <tbody>
          {courses.map((course) => (
            <tr
              key={course.id}
              className="border-b border-neutral-800/80 transition-colors last:border-b-0 hover:bg-[#171717]"
            >
              <td className={`${cell} max-w-[260px]`}>
                <p className="break-words font-medium leading-5 text-white">
                  {course.title}
                </p>
              </td>

              <td className={cell}>
                <StatusBadge status={course.status} />
              </td>

              <td
                className={`${cell} hidden font-mono text-xs text-neutral-400 md:table-cell`}
              >
                {course.totalConcepts}
              </td>

              <td
                className={`${cell} hidden font-mono text-xs text-neutral-400 lg:table-cell`}
              >
                {course.totalQuizzes}
              </td>

              <td
                className={`${cell} font-mono text-xs text-neutral-300`}
              >
                {course.activeLearners}
              </td>

              <td className={`${cell} min-w-[12rem]`}>
                <ProgressBar
                  value={course.averageLearnerProgress}
                  max={100}
                  showLabel
                />
              </td>

              <td
                className={`${cell} hidden font-mono text-xs text-neutral-400 lg:table-cell`}
              >
                {course.quizAttempts}
              </td>

              <td className={`${cell} whitespace-nowrap`}>
                <span className="font-mono text-xs text-white">
                  {course.averageQuizScore}%
                </span>

                <span className="mx-1 text-neutral-700">
                  /
                </span>

                <span className="font-mono text-xs text-[#22C55E]">
                  {course.quizPassRate}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}