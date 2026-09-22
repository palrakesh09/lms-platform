import { Link } from 'react-router';
import { ROUTES } from '../../utils/paths.js';
import { primaryButton } from '../common/buttonClasses.js';
import CourseBadges from './CourseBadges.jsx';
import CourseThumbnail from './CourseThumbnail.jsx';

// Only the id goes into the URL. The detail page fetches the real data.
export default function CourseCard({ course }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <CourseThumbnail src={course.thumbnail} />
      <div className="flex flex-1 flex-col p-4">
        <CourseBadges course={course} />
        <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-900">{course.title}</h2>
        <p className="mt-1 line-clamp-3 text-sm text-slate-600">
          {course.shortDescription || 'No description available yet.'}
        </p>
        <div className="mt-auto pt-4">
          <Link to={ROUTES.course(course.id)} className={primaryButton}>
            View Course<span className="sr-only">: {course.title}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}