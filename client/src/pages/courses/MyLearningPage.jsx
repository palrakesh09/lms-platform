import { Link } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { primaryButton } from '../../components/common/buttonClasses.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import LearningCourseCard from '../../components/courses/LearningCourseCard.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useMyLearning } from '../../hooks/useLearning.js';
import { ROUTES } from '../../utils/paths.js';

export default function MyLearningPage() {
  const { status, data, error, reload } = useMyLearning();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
        <p className="mt-1 text-sm text-slate-600">Pick up where you left off.</p>
      </div>

      {status === REQUEST_STATUS.LOADING && (
        <LoadingRegion label="Loading your courses…" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </LoadingRegion>
      )}
      {status === REQUEST_STATUS.ERROR && <ApiErrorState error={error} subject="your courses" onRetry={reload} />}
      {status === REQUEST_STATUS.SUCCESS &&
        (data.length === 0 ? (
          <EmptyState title="No learning activity yet" message="Once you start a course, it will show up here.">
            <Link to={ROUTES.courses} className={primaryButton}>
              Browse courses
            </Link>
          </EmptyState>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((entry) => (
              <li key={entry.course.id}>
                <LearningCourseCard entry={entry} />
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}