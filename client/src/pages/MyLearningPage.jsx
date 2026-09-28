import { Link } from 'react-router';
import ApiErrorState from '../components/common/ApiErrorState.jsx';
import { primaryButton } from '../components/common/buttonClasses.js';
import EmptyState from '../components/common/EmptyState.jsx';
import Skeleton, { LoadingRegion } from '../components/common/Skeleton.jsx';
import LearningCourseCard from '../components/courses/LearningCourseCard.jsx';
import { REQUEST_STATUS } from '../hooks/useApiResource.js';
import { useMyEnrollments } from '../hooks/useMyEnrollments.js';
import { useMyLearning } from '../hooks/useMyLearning.js';
import { ROUTES } from '../utils/paths.js';

// The section (Continue Learning / Completed) comes from Enrollment.status, per your instruction that
// My Learning must be enrollment-based, not "every course with a stray progress row". Per-course
// progress numbers still come from the existing GET /progress/my-learning (Phase 8) — merged here by
// course id, not duplicated.
export default function MyLearningPage() {
  const enrollments = useMyEnrollments();
  const progress = useMyLearning();

  const status = enrollments.status === REQUEST_STATUS.SUCCESS && progress.status === REQUEST_STATUS.SUCCESS ? REQUEST_STATUS.SUCCESS
    : [enrollments.status, progress.status].includes(REQUEST_STATUS.ERROR) ? REQUEST_STATUS.ERROR : REQUEST_STATUS.LOADING;
  const error = enrollments.error ?? progress.error;
  const reload = () => { enrollments.reload(); progress.reload(); };

  const progressByCourse = status === REQUEST_STATUS.SUCCESS ? new Map(progress.data.map((entry) => [entry.course.id, entry])) : new Map();

  const merged = status === REQUEST_STATUS.SUCCESS
    ? enrollments.data
        .filter((enrollment) => enrollment.course) // course may have been deleted; skip defensively
        .map((enrollment) => ({
          enrollmentStatus: enrollment.status,
          course: { id: enrollment.course, title: enrollment.courseTitle },
          progress: progressByCourse.get(enrollment.course)?.progress ?? { totalConcepts: 0, completedConcepts: 0, percentage: 0 },
          lastAccessed: progressByCourse.get(enrollment.course)?.lastAccessed ?? null,
        }))
    : [];

  const inProgress = merged.filter((e) => e.enrollmentStatus === 'active');
  const completed = merged.filter((e) => e.enrollmentStatus === 'completed');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
        <p className="mt-1 text-sm text-slate-600">Courses you are enrolled in.</p>
      </div>

      {status === REQUEST_STATUS.LOADING && (
        <LoadingRegion label="Loading your courses…" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </LoadingRegion>
      )}
      {status === REQUEST_STATUS.ERROR && <ApiErrorState error={error} subject="your courses" onRetry={reload} />}
      {status === REQUEST_STATUS.SUCCESS && merged.length === 0 && (
        <EmptyState title="No enrolled courses yet" message="Once you enroll in a course, it will show up here.">
          <Link to={ROUTES.courses} className={primaryButton}>Browse courses</Link>
        </EmptyState>
      )}

      {status === REQUEST_STATUS.SUCCESS && inProgress.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">In Progress</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((entry) => <li key={entry.course.id}><LearningCourseCard entry={entry} /></li>)}
          </ul>
        </section>
      )}

      {status === REQUEST_STATUS.SUCCESS && completed.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Completed</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((entry) => <li key={entry.course.id}><LearningCourseCard entry={entry} /></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}