import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useMatch, useParams } from 'react-router';
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

const EMPTY_PROGRESS = { conceptProgress: [], summary: null, lastAccessed: null };

// App shell: the sidebar and the content scroll independently.
// Structure and progress are fetched ONCE here. This layout stays mounted while :resourceId changes,
// so switching resources — and marking a concept complete/incomplete — never re-fetches either one.
export default function LearningLayout() {
  const { courseId } = useParams();
  const resourceMatch = useMatch('/learn/:courseId/resource/:resourceId');
  const activeResourceId = resourceMatch?.params.resourceId ?? null; // the URL decides what is selected

  const { status: structureStatus, data: structure, error: structureError, reload: reloadStructure } = useCourseStructure(courseId);
  const progressQuery = useCourseProgress(courseId);

  const entries = useMemo(() => flattenResources(structure), [structure]);
  const activeEntry = useMemo(() => findEntry(entries, activeResourceId), [entries, activeResourceId]);

  // A progress-fetch hiccup should never block reading: fall back to "no progress data" rather than
  // showing a full-page error when the structure itself loaded fine.
  const progressData = progressQuery.status === REQUEST_STATUS.SUCCESS ? progressQuery.data : EMPTY_PROGRESS;
  const progressMap = useMemo(() => toProgressMap(progressData.conceptProgress), [progressData]);

  const setConceptCompletion = useCallback(
    (updatedRow) => {
      progressQuery.mutate((current) => {
        if (!current) return current;
        const conceptProgress = [...current.conceptProgress.filter((row) => row.conceptId !== updatedRow.conceptId), updatedRow];
        const totalConcepts = current.summary.totalConcepts;
        const completedConcepts = conceptProgress.filter((row) => row.completed).length;

        return {
          ...current,
          conceptProgress,
          summary: {
            totalConcepts,
            completedConcepts,
            remainingConcepts: totalConcepts - completedConcepts,
            percentage: totalConcepts === 0 ? 0 : Math.round((completedConcepts / totalConcepts) * 1000) / 10,
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
      progress: { map: progressMap, summary: progressData.summary, lastAccessed: progressData.lastAccessed },
      setConceptCompletion,
    }),
    [courseId, structure, entries, progressMap, progressData, setConceptCompletion],
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
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const handleNavigate = useCallback(() => {
    if (drawerOpen) {
      setDrawerOpen(false);
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [drawerOpen]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [activeResourceId]);

  // Ready once the structure has loaded AND the progress request has settled (success or error) — a
  // progress hiccup is never a permanent block, but the resume redirect below must not fire before
  // progress data is actually available.
  const ready = structureStatus === REQUEST_STATUS.SUCCESS && progressQuery.status !== REQUEST_STATUS.LOADING;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50 text-slate-900">
      <SkipLink />
      <Navbar fluid />

      <div className="flex shrink-0 items-center border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="course-sidebar"
          className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Icon name="menu" className="size-5" />
          Course Content
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {drawerOpen && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close course content"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-slate-900/40 lg:hidden"
          />
        )}

        <aside
          id="course-sidebar"
          className={`fixed inset-y-0 left-0 z-40 flex w-80 max-w-[85vw] flex-col border-r border-slate-200 bg-white transition-transform motion-reduce:transition-none lg:static lg:z-auto lg:visible lg:w-80 lg:max-w-none lg:shrink-0 lg:translate-x-0 ${
            drawerOpen ? 'translate-x-0' : 'invisible -translate-x-full'
          }`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 lg:hidden">
            <span className="text-sm font-semibold">Course content</span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close course content"
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Icon name="x" className="size-5" />
            </button>
          </div>

          {!ready && structureStatus !== REQUEST_STATUS.ERROR && <SidebarSkeleton />}
          {structureStatus === REQUEST_STATUS.ERROR && <p className="p-4 text-sm text-slate-600">Course content is unavailable right now.</p>}
          {ready && (
            <CourseSidebar
              key={courseId}
              structure={structure}
              courseId={courseId}
              activeResourceId={activeResourceId}
              activeEntry={activeEntry}
              onNavigate={handleNavigate}
              progress={{ map: progressMap, summary: progressData.summary }}
            />
          )}
        </aside>

        <main id="main-content" ref={mainRef} tabIndex={-1} className="min-w-0 flex-1 overflow-y-auto focus:outline-none">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
            <ErrorBoundary resetKey={activeResourceId}>
              {!ready && structureStatus !== REQUEST_STATUS.ERROR && <ContentSkeleton />}
              {structureStatus === REQUEST_STATUS.ERROR && (
                <ApiErrorState error={structureError} subject="course" onRetry={reloadStructure} backTo={ROUTES.courses} backLabel="Back to courses" />
              )}
              {ready && <Outlet context={outletContext} />}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}