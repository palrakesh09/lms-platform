import { formatLabel } from '../../utils/formatters.js';

const pill = 'rounded-full px-2.5 py-0.5 text-xs font-medium';

// Staff can see unpublished courses, so a status badge appears for anything that is not published.
export default function CourseBadges({ course }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {course.level && <span className={`${pill} bg-indigo-50 text-indigo-800`}>{formatLabel(course.level)}</span>}
      {course.category && <span className={`${pill} bg-slate-100 text-slate-700`}>{formatLabel(course.category)}</span>}
      {course.status && course.status !== 'published' && (
        <span className={`${pill} bg-amber-50 text-amber-800`}>{formatLabel(course.status)}</span>
      )}
    </div>
  );
}