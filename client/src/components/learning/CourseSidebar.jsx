import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { ROUTES } from '../../utils/paths.js';
import { MIN_QUERY, filterStructure, normalizeQuery } from '../../utils/searchUtils.js';
import Icon from '../common/Icon.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import SidebarQuizMatches from '../search/SidebarQuizMatches.jsx';
import ModuleAccordion from './ModuleAccordion.jsx';
import { SidebarContext } from './SidebarContext.js';

const initialExpanded = (modules, activeEntry) => {
  if (activeEntry) return new Set([activeEntry.module.id, activeEntry.topic.id]);
  return new Set(modules[0] ? [modules[0].id] : []);
};

// The tree renders from the structure ALREADY loaded. "Search in course" filters it in memory (instant, no
// request per keystroke). While a search is active the matching path is shown expanded; clearing it
// restores the student's own expand/collapse state untouched. Quizzes come from the course search API.
export default function CourseSidebar({ structure, courseId, activeResourceId, activeEntry, onNavigate, progress }) {
  const [expanded, setExpanded] = useState(() => initialExpanded(structure.modules ?? [], activeEntry));
  const [syncedResourceId, setSyncedResourceId] = useState(activeResourceId);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(normalizeQuery(query), 350);

  if (syncedResourceId !== activeResourceId) {
    setSyncedResourceId(activeResourceId);
    if (activeEntry) setExpanded((current) => new Set(current).add(activeEntry.module.id).add(activeEntry.topic.id));
  }

  const toggle = useCallback((id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const view = useMemo(() => filterStructure(structure, query), [structure, query]);
  const shownExpanded = view.expandedIds ?? expanded;
  const modules = view.structure.modules ?? [];

  const context = useMemo(
    () => ({ courseId, activeResourceId, expanded: shownExpanded, toggle, onNavigate, progressMap: progress.map }),
    [courseId, activeResourceId, shownExpanded, toggle, onNavigate, progress.map],
  );

  const summary = progress.summary;
  const isComplete = summary && summary.totalConcepts > 0 && summary.completedConcepts === summary.totalConcepts;
  const searching = view.conceptCount !== null;

  return (
    <SidebarContext.Provider value={context}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-slate-200 px-4 py-4">
          <Link to={ROUTES.course(courseId)} className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <Icon name="arrow-left" className="size-3.5" />
            Course overview
          </Link>
          <h2 className="mt-2 wrap-break-word text-base font-semibold leading-snug text-slate-900">{structure.course.title}</h2>

          {summary && summary.totalConcepts > 0 && (
            <div className="mt-3">
              <ProgressBar completed={summary.completedConcepts} total={summary.totalConcepts} label={isComplete ? 'Course completed' : 'Your progress'} size="sm" />
              {isComplete && <p className="mt-1 text-xs font-medium text-emerald-700">🎉 Course completed!</p>}
            </div>
          )}

          <div className="relative mt-3">
            <label htmlFor="sidebar-search" className="sr-only">Search in course</label>
            <Icon name="search" className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              id="sidebar-search"
              type="search"
              value={query}
              maxLength={100}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in course"
              className="block w-full rounded-md border border-slate-300 py-1.5 pl-7 pr-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600"
            />
          </div>
          <p role="status" className="sr-only">{searching ? `${view.conceptCount} matching concepts` : ''}</p>
        </div>

        <nav aria-label="Course content" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {modules.length === 0 ? (
            <p className="p-4 text-sm text-slate-600">{searching ? 'No matches in this course.' : 'This course has no modules yet.'}</p>
          ) : (
            <ul>
              {modules.map((module, index) => (
                <ModuleAccordion key={module.id} module={module} index={index} />
              ))}
            </ul>
          )}
          {searching && debouncedQuery.length >= MIN_QUERY && (
            <SidebarQuizMatches courseId={courseId} query={debouncedQuery} onNavigate={onNavigate} />
          )}
        </nav>
      </div>
    </SidebarContext.Provider>
  );
}