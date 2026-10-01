import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';

import { ROUTES } from '../../utils/paths.js';

import {
  MIN_QUERY,
  filterStructure,
  normalizeQuery,
} from '../../utils/searchUtils.js';

import Icon from '../common/Icon.jsx';
import ProgressBar from '../common/ProgressBar.jsx';

import SidebarQuizMatches from '../search/SidebarQuizMatches.jsx';

import ModuleAccordion from './ModuleAccordion.jsx';
import { SidebarContext } from './SidebarContext.js';

const initialExpanded = (
  modules,
  activeEntry,
) => {
  if (activeEntry) {
    return new Set([
      activeEntry.module.id,
      activeEntry.topic.id,
    ]);
  }

  return new Set(
    modules[0] ? [modules[0].id] : [],
  );
};

export default function CourseSidebar({
  structure,
  courseId,
  activeResourceId,
  activeEntry,
  onNavigate,
  progress,
}) {
  const [expanded, setExpanded] = useState(() =>
    initialExpanded(
      structure.modules ?? [],
      activeEntry,
    ),
  );

  const [syncedResourceId, setSyncedResourceId] =
    useState(activeResourceId);

  const [query, setQuery] = useState('');

  const debouncedQuery = useDebouncedValue(
    normalizeQuery(query),
    350,
  );

  if (syncedResourceId !== activeResourceId) {
    setSyncedResourceId(activeResourceId);

    if (activeEntry) {
      setExpanded((current) => {
        const next = new Set(current);

        next.add(activeEntry.module.id);
        next.add(activeEntry.topic.id);

        return next;
      });
    }
  }

  const toggle = useCallback((id) => {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const view = useMemo(
    () => filterStructure(structure, query),
    [structure, query],
  );

  const shownExpanded =
    view.expandedIds ?? expanded;

  const modules = view.structure.modules ?? [];

  const context = useMemo(
    () => ({
      courseId,
      activeResourceId,
      expanded: shownExpanded,
      toggle,
      onNavigate,
      progressMap: progress.map,
    }),
    [
      courseId,
      activeResourceId,
      shownExpanded,
      toggle,
      onNavigate,
      progress.map,
    ],
  );

  const summary = progress.summary;

  const isComplete =
    summary &&
    summary.totalConcepts > 0 &&
    summary.completedConcepts ===
      summary.totalConcepts;

  const searching = view.conceptCount !== null;

  return (
    <SidebarContext.Provider value={context}>
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Sidebar header */}
        <div className="shrink-0 border-b border-neutral-800 px-5 py-5">
          <Link
            to={ROUTES.course(courseId)}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-500 transition-colors hover:text-[#FF3E00]"
          >
            <Icon
              name="arrow-left"
              className="size-3.5"
            />

            Course Overview
          </Link>

          <h2 className="mt-4 line-clamp-2 text-lg font-bold leading-snug text-white">
            {structure.course.title}
          </h2>

          {/* Progress */}
          {summary &&
            summary.totalConcepts > 0 && (
              <div className="mt-5 border-t border-neutral-800 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="mono-label">
                    YOUR PROGRESS
                  </span>

                  <span className="font-mono text-xs text-[#FF3E00]">
                    {summary.percentage ?? 0}%
                  </span>
                </div>

                <ProgressBar
                  completed={summary.completedConcepts}
                  total={summary.totalConcepts}
                  label=""
                  size="sm"
                />

                <div className="mt-2 flex justify-between text-[11px] text-neutral-600">
                  <span>
                    {summary.completedConcepts} completed
                  </span>

                  <span>
                    {summary.totalConcepts} total
                  </span>
                </div>

                {isComplete && (
                  <div className="mt-3 flex items-center gap-2 border border-emerald-900/50 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-400">
                    <Icon
                      name="check"
                      className="size-3.5"
                    />
                    Course completed
                  </div>
                )}
              </div>
            )}

          {/* Search */}
          <div className="relative mt-5">
            <label
              htmlFor="sidebar-search"
              className="sr-only"
            >
              Search in course
            </label>

            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-600"
            />

            <input
              id="sidebar-search"
              type="search"
              value={query}
              maxLength={100}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search course..."
              className="block w-full border border-neutral-800 bg-[#111111] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors focus:border-[#FF3E00]"
            />
          </div>

          <p
            role="status"
            className="sr-only"
          >
            {searching
              ? `${view.conceptCount} matching concepts`
              : ''}
          </p>
        </div>

        {/* Tree */}
        <nav
          aria-label="Course content"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {modules.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mx-auto flex size-10 items-center justify-center border border-neutral-800 bg-neutral-900">
                <Icon
                  name="search"
                  className="size-4 text-neutral-600"
                />
              </div>

              <p className="mt-3 text-sm text-neutral-500">
                {searching
                  ? 'No matches found.'
                  : 'No modules available yet.'}
              </p>
            </div>
          ) : (
            <ul>
              {modules.map((module, index) => (
                <li
                  key={module.id}
                  className="border-b border-neutral-900"
                >
                  <ModuleAccordion
                    module={module}
                    index={index}
                  />
                </li>
              ))}
            </ul>
          )}

          {searching &&
            debouncedQuery.length >= MIN_QUERY && (
              <SidebarQuizMatches
                courseId={courseId}
                query={debouncedQuery}
                onNavigate={onNavigate}
              />
            )}
        </nav>

        {/* Sidebar footer */}
        <div className="hidden shrink-0 border-t border-neutral-800 px-5 py-4 lg:block">
          <div className="flex items-center justify-between">
            <span className="mono-label">
              LEARNING MODE
            </span>

            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-500">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}