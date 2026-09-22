import { useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import CourseForm from '../../components/dashboard/courses/CourseForm.jsx';
import { PageHeader } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useCourse } from '../../hooks/useCourse.js';
import { dashboardPaths } from '../../utils/dashboardPaths.js';

// mode="create": /admin/courses/new (mentors have no create route).
// mode="edit": /admin|mentor/courses/:courseId/edit. The API decides whether this mentor may edit it;
// a 403 or 404 here is shown by ApiErrorState, exactly like any other read.
export default function CourseFormPage({ area, mode }) {
  const { courseId } = useParams();
  const paths = dashboardPaths(area);

  if (mode === 'create') {
    return (
      <>
        <PageHeader title="New course" backTo={paths.courses} backLabel="Back to courses" />
        <CourseForm course={null} area={area} />
      </>
    );
  }

  return <EditCourseForm area={area} courseId={courseId} paths={paths} />;
}

function EditCourseForm({ area, courseId, paths }) {
  const { status, data, error, reload } = useCourse(courseId);

  return (
    <>
      <PageHeader title="Edit course" backTo={paths.course(courseId)} backLabel="Back to course" />

      {status === REQUEST_STATUS.LOADING && (
        <LoadingRegion label="Loading course…" className="max-w-2xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </LoadingRegion>
      )}
      {status === REQUEST_STATUS.ERROR && <ApiErrorState error={error} subject="course" onRetry={reload} backTo={paths.courses} backLabel="Back to courses" />}
      {status === REQUEST_STATUS.SUCCESS && <CourseForm course={data} area={area} />}
    </>
  );
}