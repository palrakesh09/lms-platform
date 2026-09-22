import { Link, useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { primaryButton } from '../../components/common/buttonClasses.js';
import Icon from '../../components/common/Icon.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import CourseBadges from '../../components/courses/CourseBadges.jsx';
import CourseOutline from '../../components/courses/CourseOutline.jsx';
import CourseThumbnail from '../../components/courses/CourseThumbnail.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCourse } from '../../hooks/useCourse.js';
import { useCourseProgress } from '../../hooks/useCourseProgress.js';
import { useCourseStructure } from '../../hooks/useCourseStructure.js';
import { countStructure } from '../../utils/courseStructure.js';
import { pluralize } from '../../utils/formatters.js';
import { ROUTES } from '../../utils/paths.js';
import { hasRole, ROLES } from '../../utils/roles.js';

function CourseDetailSkeleton() {
  return (
    <LoadingRegion label="Loading course…" className="space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
        <Skeleton className="aspect-video w-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-4 h-10 w-36" />
        </div>
      </div>
    </LoadingRegion>
  );
}

// Shown only to students: their own progress, and a Start/Resume/Review action driven entirely by
// server data. A fetch failure here does not block the rest of the page.
function StudentProgress({ courseId }) {
  const { status, data, error, reload } = useCourseProgress(courseId);

  if (status === REQUEST_STATUS.LOADING) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <LoadingRegion label="Loading your progress…" className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-2.5 w-full" />
        </LoadingRegion>
      </div>
    );
  }
  if (status === REQUEST_STATUS.ERROR) {
    return <ApiErrorState error={error} subject="your progress" onRetry={reload} />;
  }

  const hasStarted = data.conceptProgress.length > 0;
  const isComplete = data.summary.totalConcepts > 0 && data.summary.completedConcepts === data.summary.totalConcepts;
  const target = data.lastAccessed?.resourceId ? ROUTES.learn(courseId, data.lastAccessed.resourceId) : ROUTES.learn(courseId);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{isComplete ? 'Course completed' : 'Your progress'}</h2>
      <div className="mt-2">
        <ProgressBar completed={data.summary.completedConcepts} total={data.summary.totalConcepts} label="Your progress" />
      </div>
      <Link to={target} className={`${primaryButton} mt-4`}>
        {isComplete ? 'Review course' : hasStarted ? 'Continue Learning' : 'Start Learning'}
      </Link>
    </div>
  );
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const course = useCourse(courseId);
  const structure = useCourseStructure(courseId);
  const isStudent = hasRole(user, [ROLES.STUDENT]);

  if (course.status === REQUEST_STATUS.LOADING) {
    return <CourseDetailSkeleton />;
  }
  if (course.status === REQUEST_STATUS.ERROR) {
    return <ApiErrorState error={course.error} subject="course" onRetry={course.reload} backTo={ROUTES.courses} backLabel="Back to courses" />;
  }

  const { data: courseData } = course;
  const counts = structure.status === REQUEST_STATUS.SUCCESS ? countStructure(structure.data) : null;

  return (
    <div className="space-y-10">
      <div>
        <Link
          to={ROUTES.courses}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Icon name="arrow-left" className="size-4" />
          All courses
        </Link>

        <div className="mt-4 grid gap-6 md:grid-cols-[18rem_1fr]">
          <CourseThumbnail src={courseData.thumbnail} className="rounded-xl border border-slate-200" />

          <div>
            <CourseBadges course={courseData} />
            <h1 className="mt-3 wrap-break-word text-3xl font-bold tracking-tight">{courseData.title}</h1>

            {courseData.description || courseData.shortDescription ? (
              <p className="mt-3 max-w-2xl whitespace-pre-line wrap-break-word leading-relaxed text-slate-700">
                {courseData.description || courseData.shortDescription}
              </p>
            ) : (
              <p className="mt-3 text-sm italic text-slate-600">No description available yet.</p>
            )}

            {counts && (
              <p className="mt-3 text-sm text-slate-600">
                {[pluralize(counts.modules, 'module'), pluralize(counts.topics, 'topic'), pluralize(counts.concepts, 'concept'), pluralize(counts.resources, 'resource')].join(' · ')}
              </p>
            )}

            <div className="mt-6 max-w-xs">
              {isStudent ? (
                <StudentProgress courseId={courseData.id} />
              ) : (
                <Link to={ROUTES.learn(courseData.id)} className={primaryButton}>
                  Start Learning
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="course-content-heading">
        <h2 id="course-content-heading" className="mb-4 text-xl font-semibold">
          Course content
        </h2>

        {structure.status === REQUEST_STATUS.LOADING && (
          <LoadingRegion label="Loading course content…" className="space-y-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </LoadingRegion>
        )}
        {structure.status === REQUEST_STATUS.ERROR && <ApiErrorState error={structure.error} subject="course content" onRetry={structure.reload} />}
        {structure.status === REQUEST_STATUS.SUCCESS && <CourseOutline modules={structure.data.modules ?? []} />}
      </section>
    </div>
  );
}