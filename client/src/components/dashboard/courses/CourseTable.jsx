import { Link } from 'react-router';
import { dashboardPaths } from '../../../utils/dashboardPaths.js';
import { formatDate, formatLabel } from '../../../utils/formatters.js';
import { ROUTES } from '../../../utils/paths.js';
import { dangerLinkButton, linkButton } from '../../common/buttonClasses.js';
import StatusBadge from '../../common/StatusBadge.jsx';
import CourseThumbnail from '../../courses/CourseThumbnail.jsx';

const th = 'px-4 py-3';

// `onAction({ type, course })` is only ever called for admin-only actions when area === 'admin'.
// Hiding the buttons for mentors is UX. The API rejects those calls for anyone else regardless.
export default function CourseTable({ courses, area, onAction }) {
  const isAdmin = area === 'admin';
  const paths = dashboardPaths(area);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <caption className="sr-only">Courses</caption>
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className={th}>Course</th>
            <th scope="col" className={`${th} hidden md:table-cell`}>Category</th>
            <th scope="col" className={`${th} hidden lg:table-cell`}>Level</th>
            <th scope="col" className={th}>Status</th>
            <th scope="col" className={`${th} hidden lg:table-cell`}>Created</th>
            <th scope="col" className={th}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {courses.map((course) => (
            <tr key={course.id} className="align-top">
              <td className={th}>
                <div className="flex items-start gap-3">
                  <CourseThumbnail src={course.thumbnail} className="hidden w-20 shrink-0 rounded sm:block" />
                  <div className="min-w-0">
                    <p className="wrap-break-word font-medium text-slate-900">{course.title}</p>
                    <p className="break-all text-xs text-slate-600">{course.slug}</p>
                  </div>
                </div>
              </td>
              <td className={`${th} hidden text-slate-700 md:table-cell`}>{formatLabel(course.category)}</td>
              <td className={`${th} hidden text-slate-700 lg:table-cell`}>{formatLabel(course.level)}</td>
              <td className={th}>
                <StatusBadge status={course.status} />
              </td>
              <td className={`${th} hidden whitespace-nowrap text-slate-700 lg:table-cell`}>{formatDate(course.createdAt)}</td>
              <td className={`${th} min-w-[11rem]`}>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <Link to={ROUTES.course(course.id)} className={linkButton}>
                    View<span className="sr-only"> {course.title}</span>
                  </Link>
                  <Link to={paths.editCourse(course.id)} className={linkButton}>
                    Edit<span className="sr-only"> {course.title}</span>
                  </Link>
                  <Link to={paths.course(course.id)} className={linkButton}>
                    Manage content<span className="sr-only"> of {course.title}</span>
                  </Link>
                  {isAdmin && (
                    <>
                      {course.status !== 'published' && (
                        <button type="button" onClick={() => onAction({ type: 'publish', course })} className={linkButton}>
                          Publish<span className="sr-only"> {course.title}</span>
                        </button>
                      )}
                      {course.status !== 'archived' && (
                        <button type="button" onClick={() => onAction({ type: 'archive', course })} className={linkButton}>
                          Archive<span className="sr-only"> {course.title}</span>
                        </button>
                      )}
                      <button type="button" onClick={() => onAction({ type: 'delete', course })} className={dangerLinkButton}>
                        Delete<span className="sr-only"> {course.title}</span>
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}