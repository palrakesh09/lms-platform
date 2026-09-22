import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../utils/paths.js';
import Icon from '../common/Icon.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import ModuleAccordion from './ModuleAccordion.jsx';
import { SidebarContext } from './SidebarContext.js';

const initialExpanded = (modules, activeEntry) => {
  if (activeEntry) return new Set([activeEntry.module.id, activeEntry.topic.id]);
  return new Set(modules[0] ? [modules[0].id] : []);
};

// Renders the whole tree from the structure that is ALREADY loaded, plus completion state from the
// course progress that is ALREADY loaded. Expanding, collapsing, selecting and completing never touch
// the API from here — the parent layout owns both fetches and passes results down.
export default function CourseSidebar({ structure, courseId, activeResourceId, activeEntry, onNavigate, progress }) {
  const modules = structure.modules ?? [];
  const [expanded, setExpanded] = useState(() => initialExpanded(modules, activeEntry));
  const [syncedResourceId, setSyncedResourceId] = useState(activeResourceId);

  if (syncedResourceId !== activeResourceId) {
    setSyncedResourceId(activeResourceId);
    if (activeEntry) {
      setExpanded((current) => new Set(current).add(activeEntry.module.id).add(activeEntry.topic.id));
    }
  }

  const toggle = useCallback((id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const context = useMemo(
    () => ({ courseId, activeResourceId, expanded, toggle, onNavigate, progressMap: progress.map }),
    [courseId, activeResourceId, expanded, toggle, onNavigate, progress.map],
  );

  const summary = progress.summary;
  const isComplete = summary && summary.totalConcepts > 0 && summary.completedConcepts === summary.totalConcepts;

  return (
    <SidebarContext.Provider value={context}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-slate-200 px-4 py-4">
          <Link
            to={ROUTES.course(courseId)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Icon name="arrow-left" className="size-3.5" />
            Course overview
          </Link>
          <h2 className="mt-2 wrap-break-word text-base font-semibold leading-snug text-slate-900">
            {structure.course.title}
          </h2>

          {summary && summary.totalConcepts > 0 && (
            <div className="mt-3">
              <ProgressBar
                completed={summary.completedConcepts}
                total={summary.totalConcepts}
                label={isComplete ? 'Course completed' : 'Your progress'}
                size="sm"
              />
              {isComplete && <p className="mt-1 text-xs font-medium text-emerald-700">🎉 Course completed!</p>}
            </div>
          )}
        </div>

        <nav aria-label="Course content" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {modules.length === 0 ? (
            <p className="p-4 text-sm text-slate-600">This course has no modules yet.</p>
          ) : (
            <ul>
              {modules.map((module, index) => (
                <ModuleAccordion key={module.id} module={module} index={index} />
              ))}
            </ul>
          )}
        </nav>
      </div>
    </SidebarContext.Provider>
  );
}