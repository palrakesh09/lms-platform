import { useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import CourseForm from '../../components/dashboard/courses/CourseForm.jsx';
import { PageHeader } from '../../components/dashboard/DashboardUi.jsx';
import { useCourse } from '../../hooks/useCourse.js';
import { dashboardPaths } from '../../utils/dashboardPaths.js';

export default function CourseFormPage({ area, mode }) {
  const { courseId } = useParams();
  const isNew = mode === 'create';
  const resource = useCourse(courseId);
  const paths = dashboardPaths(area);

  if (isNew) {
    return (
      <>
        <PageHeader title="Create course" backTo={paths.courses} backLabel="Back to courses" />
        <CourseForm area={area} course={null} />
      </>
    );
  }
  if (resource.status === 'loading') return <Skeleton className="h-96 w-full" />;
  if (resource.status === 'error') return <ApiErrorState error={resource.error} subject="course" onRetry={resource.reload} />;

  return (
    <>
      <PageHeader title="Edit course" backTo={paths.course(courseId)} backLabel="Back to course" />
      <CourseForm area={area} course={resource.data} />
    </>
  );
}
