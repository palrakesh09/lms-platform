import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useMatch, useParams } from 'react-router';

import ApiErrorState from '../components/common/ApiErrorState.jsx';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import Icon from '../components/common/Icon.jsx';
import SkipLink from '../components/common/SkipLink.jsx';

import ContentSkeleton from '../components/learning/ContentSkeleton.jsx';
import CourseSidebar from '../components/learning/CourseSidebar.jsx';
import SidebarSkeleton from '../components/learning/SidebarSkeleton.jsx';

import Navbar from '../components/Navbar.jsx';

import { REQUEST_STATUS } from '../hooks/useApiResource.js';
import { useCourseProgress } from '../hooks/useCourseProgress.js';
import { useCourseStructure } from '../hooks/useCourseStructure.js';

import { flattenResources, findEntry } from '../utils/courseStructure.js';
import { ROUTES } from '../utils/paths.js';
import { toProgressMap } from '../utils/progress.js';
import { getErrorInfo } from '../utils/getErrorInfo.js';

import EnrollButton from '../components/courses/EnrollButton.jsx';
import { secondaryButton } from '../components/common/buttonClasses.js';

const EMPTY_PROGRESS = {
  conceptProgress: [],
  summary: null,
  lastAccessed: null,
};

export default function LearningLayout() {
  const { courseId } = useParams();

  const resourceMatch = useMatch(
    '/learn/:courseId/resource/:resourceId',
  );

  const activeResourceId =
    resourceMatch?.params.resourceId ?? null;

  const {
    status: structureStatus,
    data: structure,
    error: structureError,
    reload: reloadStructure,
  } = useCourseStructure(courseId);

  const progressQuery = useCourseProgress(courseId);

  const entries = useMemo(
    () => flattenResources(structure),
    [structure],
  );

  const activeEntry = useMemo(
    () => findEntry(entries, activeResourceId),
    [entries, activeResourceId],
  );

  const progressData =
    progressQuery.status === REQUEST_STATUS.SUCCESS
      ? progressQuery.data
      : EMPTY_PROGRESS;

  const progressMap = useMemo(
    () => toProgressMap(progressData.conceptProgress),
    [progressData],
  );

  const setConceptCompletion = useCallback(
    (updatedRow) => {
      progressQuery.mutate((current) => {
        if (!current) return current;

        const conceptProgress = [
          ...current.conceptProgress.filter(
            (row) => row.conceptId !== updatedRow.conceptId,
          ),
          updatedRow,
        ];

        const totalConcepts = current.summary.totalConcepts;

        const completedConcepts =
          conceptProgress.filter(
            (row) => row.completed,
          ).length;

        return {
          ...current,
          conceptProgress,
          summary: {
            totalConcepts,
            completedConcepts,
            remainingConcepts:
              totalConcepts - completedConcepts,
            percentage:
              totalConcepts === 0
                ? 0
                : Math.round(
                    (completedConcepts / totalConcepts) *
                      1000,
                  ) / 10,
          },
        };
      });
    },
    [progressQuery],
  );

  const outletContext = useMemo(
    () => ({
      courseId,
      structure,
      entries,

      progress: {
        map: progressMap,
        summary: progressData.summary,
        lastAccessed: progressData.lastAccessed,
      },

      setConceptCompletion,
    }),
    [
      courseId,
      structure,
      entries,
      progressMap,
      progressData,
      setConceptCompletion,
    ],
  );

  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    if (!drawerOpen) return undefined;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () =>
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
  }, [drawerOpen]);

  const handleNavigate = useCallback(() => {
    if (!drawerOpen) return;

    setDrawerOpen(false);

    mainRef.current?.focus({
      preventScroll: true,
    });
  }, [drawerOpen]);

  useEffect(() => {
    mainRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [activeResourceId]);

  const ready =
    structureStatus === REQUEST_STATUS.SUCCESS &&
    progressQuery.status !== REQUEST_STATUS.LOADING;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#0A0A0A] text-white">
      <SkipLink />

      <Navbar fluid />

      {/* Mobile course navigation */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 bg-[#0A0A0A] px-4 py-3 lg:hidden">
        <div>
          <p className="mono-label text-[#FF3E00]">
            LEARNING MODE
          </p>

          <p className="mt-1 max-w-[220px] truncate text-sm font-medium text-white">
            {structure?.course?.title || 'Course Content'}
          </p>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="course-sidebar"
          className="flex items-center gap-2 border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-[#FF3E00] hover:text-white"
        >
          <Icon name="menu" className="size-4" />
          Content
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* Mobile backdrop */}
        {drawerOpen && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close course content"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          id="course-sidebar"
          className={`
            fixed inset-y-0 left-0 z-40 flex w-[330px]
            max-w-[88vw] flex-col border-r border-neutral-800
            bg-[#0D0D0D]

            transition-transform duration-300
            lg:static lg:z-auto lg:w-[340px]
            lg:max-w-none lg:shrink-0
            lg:translate-x-0

            ${
              drawerOpen
                ? 'translate-x-0'
                : '-translate-x-full'
            }
          `}
        >
          {/* Mobile sidebar header */}
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-5 py-4 lg:hidden">
            <div>
              <p className="mono-label text-[#FF3E00]">
                COURSE CONTENT
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                Navigation
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close course content"
              className="flex size-9 items-center justify-center border border-neutral-800 text-neutral-400 transition-colors hover:border-[#FF3E00] hover:text-white"
            >
              <Icon name="x" className="size-4" />
            </button>
          </div>

          {!ready &&
            structureStatus !== REQUEST_STATUS.ERROR && (
              <SidebarSkeleton />
            )}

          {structureStatus === REQUEST_STATUS.ERROR &&
            (getErrorInfo(
              structureError,
              'course',
            ).kind === 'forbidden' ? (
              <div className="m-5 border border-neutral-800 bg-[#111111] p-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center border border-neutral-800 bg-neutral-900">
                  <Icon
                    name="lock"
                    className="size-5 text-[#FF3E00]"
                  />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-white">
                  Enrollment Required
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Enroll in this course to access the
                  learning content.
                </p>

                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    to={ROUTES.course(courseId)}
                    className={`${secondaryButton} justify-center`}
                  >
                    Back to Course
                  </Link>

                  <EnrollButton
                    courseId={courseId}
                    status={null}
                    courseStatus="published"
                    onEnrolled={reloadStructure}
                  />
                </div>
              </div>
            ) : (
              <ApiErrorState
                error={structureError}
                subject="course"
                onRetry={reloadStructure}
                backTo={ROUTES.courses}
                backLabel="Back to courses"
              />
            ))}

          {ready && (
            <CourseSidebar
              key={courseId}
              structure={structure}
              courseId={courseId}
              activeResourceId={activeResourceId}
              activeEntry={activeEntry}
              onNavigate={handleNavigate}
              progress={{
                map: progressMap,
                summary: progressData.summary,
              }}
            />
          )}
        </aside>

        {/* Main learning area */}
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-y-auto overscroll-contain bg-[#0A0A0A] focus:outline-none"
        >
          <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-10">
            <ErrorBoundary resetKey={activeResourceId}>
              {!ready &&
                structureStatus !==
                  REQUEST_STATUS.ERROR && (
                  <ContentSkeleton />
                )}

              {structureStatus ===
                REQUEST_STATUS.ERROR && (
                <ApiErrorState
                  error={structureError}
                  subject="course"
                  onRetry={reloadStructure}
                  backTo={ROUTES.courses}
                  backLabel="Back to courses"
                />
              )}

              {ready && (
                <div className="learning-content">
                  <Outlet context={outletContext} />
                </div>
              )}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}