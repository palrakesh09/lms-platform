import ProgressBar from '../common/ProgressBar.jsx';
import StatusBadge from '../common/StatusBadge.jsx';

const th = 'px-4 py-3';

export default function CourseAnalyticsTable({ courses }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <caption className="sr-only">Course analytics</caption>
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className={th}>Course</th><th scope="col" className={th}>Status</th>
            <th scope="col" className={`${th} hidden md:table-cell`}>Concepts</th><th scope="col" className={`${th} hidden lg:table-cell`}>Quizzes</th>
            <th scope="col" className={th}>Active learners</th><th scope="col" className={th}>Avg. progress</th>
            <th scope="col" className={`${th} hidden lg:table-cell`}>Quiz attempts</th><th scope="col" className={th}>Quiz avg / pass</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {courses.map((course) => (
            <tr key={course.id}>
              <td className={th}><p className="wrap-break-word font-medium text-slate-900">{course.title}</p></td>
              <td className={th}><StatusBadge status={course.status} /></td>
              <td className={`${th} hidden text-slate-700 md:table-cell`}>{course.totalConcepts}</td>
              <td className={`${th} hidden text-slate-700 lg:table-cell`}>{course.totalQuizzes}</td>
              <td className={th}>{course.activeLearners}</td>
              <td className={`${th} min-w-[9rem]`}><ProgressBar completed={course.averageLearnerProgress} total={100} label="Average progress" size="sm" /></td>
              <td className={`${th} hidden text-slate-700 lg:table-cell`}>{course.quizAttempts}</td>
              <td className={th}>{course.averageQuizScore}% avg · {course.quizPassRate}% pass</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}