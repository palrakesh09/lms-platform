import { Link, useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import CourseMentorsPanel from '../../components/dashboard/courses/CourseMentorsPanel.jsx';
import ContentTree from '../../components/dashboard/content/ContentTree.jsx';
import {
  PageHeader,
  Panel,
} from '../../components/dashboard/DashboardUi.jsx';
import { useCourse } from '../../hooks/useCourse.js';
import { useCourseStructure } from '../../hooks/useCourseStructure.js';
import { dashboardPaths } from '../../utils/dashboardPaths.js';
import { secondaryButton } from '../../components/common/buttonClasses.js';
import Icon from '../../components/common/Icon.jsx';

export default function ManageCoursePage({ area }) {
  const { courseId } = useParams();

  const paths = dashboardPaths(area);

  const course = useCourse(courseId);
  const structure = useCourseStructure(courseId);

  if (
    course.status === 'loading' ||
    structure.status === 'loading'
  ) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (course.status === 'error') {
    return (
      <ApiErrorState
        error={course.error}
        subject="course"
        onRetry={course.reload}
      />
    );
  }

  if (structure.status === 'error') {
    return (
      <ApiErrorState
        error={structure.error}
        subject="course content"
        onRetry={structure.reload}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Course header */}
      <div className="border-b border-[var(--lms-border)] pb-6">
        <div className="mb-5">
          <Link
            to={paths.courses}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--lms-muted)] transition hover:text-white"
          >
            <Icon
              name="arrow-left"
              className="size-3.5"
            />
            Back to courses
          </Link>
        </div>

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="mono-label text-[var(--lms-accent)]">
              COURSE WORKSPACE / {area?.toUpperCase()}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
              {course.data.title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--lms-muted)]">
              {course.data.shortDescription ||
                'Manage course structure, learning resources and assignments.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={paths.editCourse(courseId)}
              className={secondaryButton}
            >
              <Icon
                name="pencil"
                className="size-4"
              />
              Edit details
            </Link>
          </div>
        </div>
      </div>

      {/* Workspace stats */}
      <div className="grid grid-cols-2 border border-[var(--lms-border)] bg-[var(--lms-surface)] md:grid-cols-4">
        {[
          {
            label: 'Modules',
            value: structure.data.modules?.length ?? 0,
          },
          {
            label: 'Topics',
            value:
              structure.data.modules?.reduce(
                (total, module) =>
                  total + (module.topics?.length ?? 0),
                0,
              ) ?? 0,
          },
          {
            label: 'Concepts',
            value:
              structure.data.modules?.reduce(
                (total, module) =>
                  total +
                  (module.topics ?? []).reduce(
                    (topicTotal, topic) =>
                      topicTotal +
                      (topic.concepts?.length ?? 0),
                    0,
                  ),
                0,
              ) ?? 0,
          },
          {
            label: 'Resources',
            value:
              structure.data.modules?.reduce(
                (total, module) =>
                  total +
                  (module.topics ?? []).reduce(
                    (topicTotal, topic) =>
                      topicTotal +
                      (topic.concepts ?? []).reduce(
                        (conceptTotal, concept) =>
                          conceptTotal +
                          (concept.resources?.length ?? 0),
                        0,
                      ),
                    0,
                  ),
                0,
              ) ?? 0,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="border-b border-[var(--lms-border)] p-4 last:border-r-0 md:border-b-0 md:border-r"
          >
            <p className="mono-label">
              {item.label}
            </p>

            <p className="mt-2 font-mono text-2xl font-bold text-white">
              {String(item.value).padStart(2, '0')}
            </p>
          </div>
        ))}
      </div>

      {/* Mentor assignment */}
      {area === 'admin' && (
        <CourseMentorsPanel courseId={courseId} />
      )}

      {/* Content */}
      <Panel
        title="Course content"
        description="Organize the complete learning architecture."
      >
        <ContentTree
          structure={structure.data}
          onChanged={structure.reload}
        />
      </Panel>
    </div>
  );
}