import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { secondaryButton } from '../../components/common/buttonClasses.js';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ContentTree from '../../components/dashboard/content/ContentTree.jsx';
import CourseActionDialog from '../../components/dashboard/courses/CourseActionDialog.jsx';
import CourseMentorsPanel from '../../components/dashboard/courses/CourseMentorsPanel.jsx';
import { PageHeader, Panel } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useCourse } from '../../hooks/useCourse.js';
import { useRefreshableResource } from '../../hooks/useRefreshableResource.js';
import { getCourseStructure } from '../../services/courseService.js';
import { dashboardPaths } from '../../utils/dashboardPaths.js';
import { ROUTES } from '../../utils/paths.js';
import { countStructure } from '../../utils/courseStructure.js';
import { pluralize } from '../../utils/formatters.js';

// Content management for one course. The course header uses useCourse (loaded once); the tree uses
// useRefreshableResource so create/edit/delete refresh it in place without a skeleton flash.
export default function ManageCoursePage({ area }) {
  const isAdmin = area === 'admin';
  const { courseId } = useParams();
  const paths = dashboardPaths(area);
  const [action, setAction] = useState(null);

  const course = useCourse(courseId);
  const structureFetcher = useCallback((signal) => getCourseStructure(courseId, signal), [courseId]);
  const structure = useRefreshableResource(structureFetcher);

  if (course.status === REQUEST_STATUS.LOADING) {
    return (
      <LoadingRegion label="Loading course…" className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </LoadingRegion>
    );
  }
  if (course.status === REQUEST_STATUS.ERROR) {
    return <ApiErrorState error={course.error} subject="course" onRetry={course.reload} backTo={paths.courses} backLabel="Back to courses" />;
  }

  const { data: courseData } = course;
  const counts = structure.status === REQUEST_STATUS.SUCCESS ? countStructure(structure.data) : null;

  return (
    <>
      <PageHeader
        title={courseData.title}
        backTo={paths.courses}
        backLabel="Back to courses"
        description={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={courseData.status} />
            {counts && (
              <span className="text-sm text-slate-600">
                {[pluralize(counts.modules, 'module'), pluralize(counts.topics, 'topic'), pluralize(counts.concepts, 'concept'), pluralize(counts.resources, 'resource')].join(' · ')}
              </span>
            )}
          </div>
        }
        actions={
          <>
            <Link to={ROUTES.course(courseData.id)} className={secondaryButton}>
              View public page
            </Link>
            <Link to={paths.editCourse(courseData.id)} className={secondaryButton}>
              Edit course
            </Link>
            {isAdmin && courseData.status !== 'published' && (
              <button type="button" onClick={() => setAction({ type: 'publish', course: courseData })} className={secondaryButton}>
                Publish
              </button>
            )}
            {isAdmin && courseData.status !== 'archived' && (
              <button type="button" onClick={() => setAction({ type: 'archive', course: courseData })} className={secondaryButton}>
                Archive
              </button>
            )}
          </>
        }
      />

      <div className="space-y-6">
        {isAdmin && <CourseMentorsPanel courseId={courseData.id} />}

        <Panel title="Course content" description="Modules, topics, concepts and resources, in the order students will see them.">
          {structure.status === REQUEST_STATUS.LOADING && (
            <LoadingRegion label="Loading course content…" className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </LoadingRegion>
          )}
          {structure.status === REQUEST_STATUS.ERROR && (
            <ApiErrorState error={structure.error} subject="course content" onRetry={structure.reload} />
          )}
          {structure.status === REQUEST_STATUS.SUCCESS && (
            <ContentTree structure={structure.data} onChanged={structure.refresh} />
          )}
        </Panel>
      </div>

      {action && <CourseActionDialog action={action.type} course={action.course} onClose={() => setAction(null)} onDone={() => course.reload()} />}
    </>
  );
}