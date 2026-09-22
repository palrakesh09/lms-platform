import { Link } from 'react-router';
import { primaryButton } from '../common/buttonClasses.js';
import ProgressBar from '../common/ProgressBar.jsx';
import { ROUTES } from '../../utils/paths.js';
import CourseBadges from './CourseBadges.jsx';
import CourseThumbnail from './CourseThumbnail.jsx';

// One card in "My Learning". Unlike the generic CourseCard, this shows the student's own progress,
// computed once by GET /progress/my-learning — never re-derived on the frontend.
export default function LearningCourseCard({ entry }) {
  const { course, progress, lastAccessed } = entry;
  const isComplete = progress.totalConcepts > 0 && progress.completedConcepts === progress.totalConcepts;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <CourseThumbnail src={course.thumbnail} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <CourseBadges course={course} />
        <h2 className="text-lg font-semibold leading-snug text-slate-900">{course.title}</h2>

        <ProgressBar
          completed={progress.completedConcepts}
          total={progress.totalConcepts}
          label={isComplete ? 'Course completed' : 'Course progress'}
        />

        {lastAccessed && (
          <p className="text-xs text-slate-600">
            Last: <span className="font-medium text-slate-800">{lastAccessed.title}</span>
          </p>
        )}

        <div className="mt-auto pt-2">
          <Link to={ROUTES.learn(course.id, lastAccessed?.resourceId)} className={primaryButton}>
            {isComplete ? 'Review course' : 'Continue Learning'}
          </Link>
        </div>
      </div>
    </article>
  );
}