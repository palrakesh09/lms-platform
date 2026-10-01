import { useEffect } from 'react';
import { Link, useParams } from 'react-router';

import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import Icon from '../../components/common/Icon.jsx';
import Skeleton, {
  LoadingRegion,
} from '../../components/common/Skeleton.jsx';

import CourseOutline from '../../components/courses/CourseOutline.jsx';
import EnrollButton from '../../components/courses/EnrollButton.jsx';

import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCourse } from '../../hooks/useCourse.js';
import { useCourseProgress } from '../../hooks/useCourseProgress.js';
import { useCourseStructure } from '../../hooks/useCourseStructure.js';
import { useEnrollment } from '../../hooks/useEnrollment.js';
import { useAIAssistant } from '../../hooks/useAIAssistant.js';

import { countStructure } from '../../utils/courseStructure.js';
import { ROUTES } from '../../utils/paths.js';
import { hasRole, ROLES } from '../../utils/roles.js';

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-6 bg-[#ff3e00] sm:w-8" />

      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#ff3e00] sm:text-[10px] sm:tracking-[0.2em]">
        {children}
      </span>
    </div>
  );
}

function CourseSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-28" />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <Skeleton className="aspect-video w-full" />

        <div className="space-y-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-12 w-full max-w-sm" />
        </div>
      </div>
    </div>
  );
}

function CourseVisual({ src, title }) {
  return (
    <div className="group relative aspect-video overflow-hidden border border-[#292929] bg-[#111]">
      {src ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0 grayscale"
        />
      ) : (
        <div className="grid-background flex h-full items-center justify-center bg-[radial-gradient(circle_at_70%_30%,rgba(255,62,0,0.2),transparent_35%),#111]">
          <span className="font-mono text-6xl font-bold text-[#252525] sm:text-8xl">
            /
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <div className="absolute left-3 top-3 sm:left-5 sm:top-5">
        <span className="border border-white/10 bg-black/70 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white backdrop-blur-sm sm:text-[9px]">
          LMS / COURSE
        </span>
      </div>

      <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
        <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#999] sm:text-[9px] sm:tracking-[0.2em]">
          Course preview
        </div>

        <div className="mt-1 line-clamp-2 font-mono text-[10px] text-white sm:text-xs">
          {title}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="border-l border-[#333] pl-3 sm:pl-4">
      <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#555] sm:text-[9px] sm:tracking-widest">
        {label}
      </div>

      <div className="mt-1 text-sm font-medium text-white sm:text-base">
        {value}
      </div>
    </div>
  );
}

function StudentProgress({ courseId }) {
  const { status, data, error, reload } =
    useCourseProgress(courseId);

  if (status === REQUEST_STATUS.LOADING) {
    return (
      <div className="border border-[#292929] bg-[#111] p-4 sm:p-5">
        <div className="space-y-3">
          <div className="h-3 w-28 animate-pulse bg-[#252525]" />
          <div className="h-2 w-full animate-pulse bg-[#252525]" />
          <div className="h-10 w-full max-w-44 animate-pulse bg-[#252525]" />
        </div>
      </div>
    );
  }

  if (status === REQUEST_STATUS.ERROR) {
    return (
      <ApiErrorState
        error={error}
        subject="your progress"
        onRetry={reload}
      />
    );
  }

  const total = data.summary.totalConcepts;
  const completed = data.summary.completedConcepts;

  const percentage =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  const started = data.conceptProgress.length > 0;

  const complete =
    total > 0 && completed === total;

  const target = data.lastAccessed?.resourceId
    ? ROUTES.learn(
        courseId,
        data.lastAccessed.resourceId,
      )
    : ROUTES.learn(courseId);

  return (
    <div className="border border-[#292929] bg-[#111] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#555] sm:text-[9px] sm:tracking-widest">
          {complete
            ? 'Course completed'
            : 'Your progress'}
        </span>

        <span className="font-mono text-xs text-white sm:text-sm">
          {percentage}%
        </span>
      </div>

      <div className="mt-4 h-1 bg-[#292929]">
        <div
          className="h-full bg-[#ff3e00] transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="mt-3 font-mono text-[8px] uppercase tracking-[0.15em] text-[#555] sm:text-[9px] sm:tracking-widest">
        {completed} / {total} concepts complete
      </div>

      <Link
        to={target}
        className="mt-5 inline-flex h-11 w-full items-center justify-center bg-[#ff3e00] px-5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#ff5420] sm:w-auto sm:text-[10px] sm:tracking-widest"
      >
        {complete
          ? 'Review Course'
          : started
            ? 'Continue Learning'
            : 'Start Learning'}
      </Link>
    </div>
  );
}

function EnrollmentAction({
  course,
  enrollment,
  isStudent,
}) {
  if (!isStudent) {
    return (
      <EnrollButton
        courseId={course.id}
        status={null}
        courseStatus={course.status}
      />
    );
  }

  if (enrollment.status === REQUEST_STATUS.LOADING) {
    return (
      <div className="h-28 animate-pulse border border-[#292929] bg-[#111]" />
    );
  }

  if (
    enrollment.data?.status === 'active' ||
    enrollment.data?.status === 'completed'
  ) {
    return (
      <StudentProgress
        courseId={course.id}
      />
    );
  }

  return (
    <EnrollButton
      courseId={course.id}
      status={enrollment.data?.status ?? null}
      courseStatus={course.status}
      onEnrolled={enrollment.reload}
    />
  );
}

export default function CourseDetailPage() {
  const { courseId } = useParams();

  const { user } = useAuth();

  const course = useCourse(courseId);

  const structure =
    useCourseStructure(courseId);

  const enrollment =
    useEnrollment(courseId);

  const {
    setContext,
    clearContext,
  } = useAIAssistant();

  const isStudent = hasRole(user, [
    ROLES.STUDENT,
  ]);

  useEffect(() => {
    if (
      course.status !==
      REQUEST_STATUS.SUCCESS
    ) {
      return undefined;
    }

    setContext({
      type: 'course',
      id: course.data.id,
      title: course.data.title,
    });

    return clearContext;
  }, [
    course.status,
    course.data,
    setContext,
    clearContext,
  ]);

  if (course.status === REQUEST_STATUS.LOADING) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="lms-container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <CourseSkeleton />
        </div>
      </main>
    );
  }

  if (course.status === REQUEST_STATUS.ERROR) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="lms-container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <ApiErrorState
            error={course.error}
            subject="course"
            onRetry={course.reload}
            backTo={ROUTES.courses}
            backLabel="Back to courses"
          />
        </div>
      </main>
    );
  }

  const courseData = course.data;

  const counts =
    structure.status ===
    REQUEST_STATUS.SUCCESS
      ? countStructure(structure.data)
      : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="border-b border-[#242424]">
        <div className="lms-container px-4 py-7 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

          <Link
            to={ROUTES.courses}
            className="group inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[#666] transition-colors hover:text-white sm:text-[10px] sm:tracking-widest"
          >
            <Icon
              name="arrow-left"
              className="size-3.5 transition-transform group-hover:-translate-x-1 sm:size-4"
            />

            All Courses
          </Link>

          <div className="mt-7 grid gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 xl:gap-20">

            {/* COURSE IMAGE */}
            <CourseVisual
              src={courseData.thumbnail}
              title={courseData.title}
            />

            {/* COURSE INFO */}
            <div className="min-w-0">

              <SectionLabel>
                {courseData.category ||
                  'Development'}
              </SectionLabel>

              <div className="mt-4 flex flex-wrap gap-2">
                {courseData.level && (
                  <span className="border border-[#303030] bg-[#111] px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.15em] text-[#888] sm:px-3 sm:text-[9px] sm:tracking-widest">
                    {courseData.level}
                  </span>
                )}

                {courseData.status &&
                  courseData.status !==
                    'published' && (
                    <span className="border border-[#f59e0b]/30 bg-[#17130a] px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.15em] text-[#f59e0b] sm:px-3 sm:text-[9px] sm:tracking-widest">
                      {courseData.status}
                    </span>
                  )}
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.045em] sm:mt-6 sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
                {courseData.title}
              </h1>

              <p className="mt-5 max-w-xl whitespace-pre-line text-sm leading-6 text-[#777] sm:mt-6 sm:text-base sm:leading-7">
                {courseData.description ||
                  courseData.shortDescription ||
                  'No description available yet.'}
              </p>

              {/* COURSE STATS */}
              {counts && (
                <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 border-y border-[#292929] py-5 sm:mt-8 sm:grid-cols-4 sm:gap-6 sm:py-6">
                  <MetaItem
                    label="Modules"
                    value={counts.modules}
                  />

                  <MetaItem
                    label="Topics"
                    value={counts.topics}
                  />

                  <MetaItem
                    label="Concepts"
                    value={counts.concepts}
                  />

                  <MetaItem
                    label="Resources"
                    value={counts.resources}
                  />
                </div>
              )}

              {/* ENROLLMENT */}
              <div className="mt-6 max-w-md sm:mt-7">
                <EnrollmentAction
                  course={courseData}
                  enrollment={enrollment}
                  isStudent={isStudent}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          COURSE CONTENT
      ========================================================= */}
      <section className="lms-container px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-16">

          {/* CURRICULUM */}
          <div className="min-w-0">
            <SectionLabel>
              Course curriculum
            </SectionLabel>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:mt-5 sm:text-4xl">
              What you'll learn
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777] sm:mt-4 sm:leading-7">
              Work through the course structure step by
              step. Each module builds toward practical
              understanding and implementation.
            </p>

            <div className="mt-7 sm:mt-10">
              {structure.status ===
                REQUEST_STATUS.LOADING && (
                <LoadingRegion
                  label="Loading course content..."
                  className="space-y-3"
                >
                  {Array.from(
                    { length: 5 },
                    (_, index) => (
                      <Skeleton
                        key={index}
                        className="h-14 w-full"
                      />
                    ),
                  )}
                </LoadingRegion>
              )}

              {structure.status ===
                REQUEST_STATUS.ERROR && (
                <ApiErrorState
                  error={structure.error}
                  subject="course content"
                  onRetry={structure.reload}
                />
              )}

              {structure.status ===
                REQUEST_STATUS.SUCCESS && (
                <div className="course-detail-outline">
                  <CourseOutline
                    modules={
                      structure.data.modules ??
                      []
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* SIDE INFO */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">

            {/* WORKFLOW */}
            <div className="border border-[#292929] bg-[#111] p-5 sm:p-6">
              <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#555] sm:text-[9px] sm:tracking-widest">
                Learning workflow
              </div>

              <div className="mt-5 space-y-5 sm:mt-6">
                {[
                  ['01', 'Learn'],
                  ['02', 'Practice'],
                  ['03', 'Build'],
                  ['04', 'Complete'],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <span className="font-mono text-[9px] text-[#444] sm:text-[10px]">
                      {number}
                    </span>

                    <span className="h-px flex-1 bg-[#292929]" />

                    <span className="text-xs font-medium text-[#aaa] sm:text-sm">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI ASSISTANT */}
            <div className="border border-[#292929] bg-[#111] p-5 sm:p-6">
              <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#555] sm:text-[9px] sm:tracking-widest">
                Need help?
              </div>

              <p className="mt-3 text-xs leading-6 text-[#777] sm:mt-4 sm:text-sm">
                Use the learning assistant while working
                through course concepts.
              </p>

              <div className="mt-4 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.15em] text-[#ff3e00] sm:mt-5 sm:text-[9px] sm:tracking-widest">
                <span className="size-1.5 rounded-full bg-[#ff3e00]" />
                AI assistance available
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="border-t border-[#242424] bg-[#0d0d0d]">
        <div className="lms-container px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="max-w-4xl">

            <SectionLabel>
              Start building
            </SectionLabel>

            <h2 className="mt-4 text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:mt-5 sm:text-5xl md:text-6xl">
              DON'T JUST
              <br />
              <span className="text-[#555]">
                COMPLETE A COURSE.
              </span>
              <br />
              BUILD WITH IT.
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-6 text-[#777] sm:mt-7 sm:leading-7">
              The goal isn't finishing lessons. The goal
              is being able to use what you've learned.
            </p>

            <div className="mt-7 sm:mt-8">
              <Link
                to={ROUTES.courses}
                className="inline-flex min-h-11 w-full items-center justify-center border border-[#333] px-5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:border-[#ff3e00] hover:text-[#ff3e00] sm:w-auto sm:px-6 sm:text-[10px] sm:tracking-widest"
              >
                Explore More Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}