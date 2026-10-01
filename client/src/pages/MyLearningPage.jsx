import { Link } from 'react-router';

import ApiErrorState from '../components/common/ApiErrorState.jsx';
import {
  primaryButton,
} from '../components/common/buttonClasses.js';
import EmptyState from '../components/common/EmptyState.jsx';
import Skeleton, {
  LoadingRegion,
} from '../components/common/Skeleton.jsx';

import LearningCourseCard from '../components/courses/LearningCourseCard.jsx';

import { REQUEST_STATUS } from '../hooks/useApiResource.js';
import {
  useMyEnrollments,
} from '../hooks/useMyEnrollments.js';
import {
  useMyLearning,
} from '../hooks/useMyLearning.js';

import { ROUTES } from '../utils/paths.js';

export default function MyLearningPage() {
  const enrollments =
    useMyEnrollments();

  const progress =
    useMyLearning();

  const status =
    enrollments.status ===
      REQUEST_STATUS.SUCCESS &&
    progress.status ===
      REQUEST_STATUS.SUCCESS
      ? REQUEST_STATUS.SUCCESS
      : [
          enrollments.status,
          progress.status,
        ].includes(
          REQUEST_STATUS.ERROR
        )
      ? REQUEST_STATUS.ERROR
      : REQUEST_STATUS.LOADING;

  const error =
    enrollments.error ??
    progress.error;

  const reload = () => {
    enrollments.reload();
    progress.reload();
  };

  const progressByCourse =
    status === REQUEST_STATUS.SUCCESS
      ? new Map(
          progress.data.map(
            (entry) => [
              entry.course.id,
              entry,
            ]
          )
        )
      : new Map();

  const merged =
    status === REQUEST_STATUS.SUCCESS
      ? enrollments.data
          .filter(
            (enrollment) =>
              enrollment.course
          )
          .map((enrollment) => ({
            enrollmentStatus:
              enrollment.status,

            course: {
              id: enrollment.course,
              title:
                enrollment.courseTitle,
            },

            progress:
              progressByCourse.get(
                enrollment.course
              )?.progress ?? {
                totalConcepts: 0,
                completedConcepts: 0,
                percentage: 0,
              },

            lastAccessed:
              progressByCourse.get(
                enrollment.course
              )?.lastAccessed ?? null,
          }))
      : [];

  const inProgress =
    merged.filter(
      (entry) =>
        entry.enrollmentStatus ===
        'active'
    );

  const completed =
    merged.filter(
      (entry) =>
        entry.enrollmentStatus ===
        'completed'
    );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10">
      {/* Header */}
      <header className="border-b border-[#2A2A2A] pb-5 sm:pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF3E00]">
          Learning Hub
        </span>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          My Learning
        </h1>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Courses you are enrolled in and your current
          learning progress.
        </p>
      </header>

      {/* Loading */}
      {status === REQUEST_STATUS.LOADING && (
        <LoadingRegion
          label="Loading your courses…"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from(
            { length: 3 },
            (_, index) => (
              <Skeleton
                key={index}
                className="h-64 w-full"
              />
            )
          )}
        </LoadingRegion>
      )}

      {/* Error */}
      {status === REQUEST_STATUS.ERROR && (
        <ApiErrorState
          error={error}
          subject="your courses"
          onRetry={reload}
        />
      )}

      {/* Empty */}
      {status === REQUEST_STATUS.SUCCESS &&
        merged.length === 0 && (
          <EmptyState
            title="No enrolled courses yet"
            message="Once you enroll in a course, it will show up here."
          >
            <Link
              to={ROUTES.courses}
              className={primaryButton}
            >
              Browse courses
            </Link>
          </EmptyState>
        )}

      {/* In Progress */}
      {status === REQUEST_STATUS.SUCCESS &&
        inProgress.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3 border-b border-[#2A2A2A] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF3E00]">
                  Continue
                </span>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  In Progress
                </h2>
              </div>

              <span className="font-mono text-[10px] text-neutral-600">
                {inProgress.length}{' '}
                {inProgress.length === 1
                  ? 'course'
                  : 'courses'}
              </span>
            </div>

            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {inProgress.map(
                (entry) => (
                  <li
                    key={entry.course.id}
                    className="min-w-0"
                  >
                    <LearningCourseCard
                      entry={entry}
                    />
                  </li>
                )
              )}
            </ul>
          </section>
        )}

      {/* Completed */}
      {status === REQUEST_STATUS.SUCCESS &&
        completed.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3 border-b border-[#2A2A2A] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                  Finished
                </span>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Completed
                </h2>
              </div>

              <span className="font-mono text-[10px] text-neutral-600">
                {completed.length}{' '}
                {completed.length === 1
                  ? 'course'
                  : 'courses'}
              </span>
            </div>

            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {completed.map(
                (entry) => (
                  <li
                    key={entry.course.id}
                    className="min-w-0"
                  >
                    <LearningCourseCard
                      entry={entry}
                    />
                  </li>
                )
              )}
            </ul>
          </section>
        )}
    </div>
  );
}

