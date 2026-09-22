import { Link, useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import CourseMentorsPanel from '../../components/dashboard/courses/CourseMentorsPanel.jsx';
import ContentTree from '../../components/dashboard/content/ContentTree.jsx';
import { PageHeader, Panel } from '../../components/dashboard/DashboardUi.jsx';
import { useCourse } from '../../hooks/useCourse.js';
import { useCourseStructure } from '../../hooks/useCourseStructure.js';
import { dashboardPaths } from '../../utils/dashboardPaths.js';
import { secondaryButton } from '../../components/common/buttonClasses.js';

export default function ManageCoursePage({ area }) {
  const { courseId } = useParams();
  const paths = dashboardPaths(area);
  const course = useCourse(courseId);
  const structure = useCourseStructure(courseId);

  if (course.status === 'loading' || structure.status === 'loading') return <Skeleton className="h-96 w-full" />;
  if (course.status === 'error') return <ApiErrorState error={course.error} subject="course" onRetry={course.reload} />;
  if (structure.status === 'error') return <ApiErrorState error={structure.error} subject="course content" onRetry={structure.reload} />;

  return (
    <>
      <PageHeader
        title={course.data.title}
        description={course.data.shortDescription || 'Manage course content and settings.'}
        backTo={paths.courses}
        backLabel="Back to courses"
        actions={<Link to={paths.editCourse(courseId)} className={secondaryButton}>Edit details</Link>}
      />
      <div className="space-y-6">
        {area === 'admin' && <CourseMentorsPanel courseId={courseId} />}
        <Panel title="Course content" description="Organize modules, topics and learning resources.">
          <ContentTree structure={structure.data} onChanged={structure.reload} />
        </Panel>
      </div>
    </>
  );
}
