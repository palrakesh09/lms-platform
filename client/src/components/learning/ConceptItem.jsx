import { isConceptComplete } from '../../utils/progress.js';
import { ROUTES } from '../../utils/paths.js';
import ResourceItem from './ResourceItem.jsx';
import { useSidebar } from './SidebarContext.js';

export default function ConceptItem({ concept }) {
  const { courseId, activeResourceId, onNavigate, progressMap } = useSidebar();
  const resources = concept.resources ?? [];
  const completed = isConceptComplete(progressMap, concept.id);

  return (
    <li className="py-1.5">
      <p className="flex items-start gap-1.5 wrap-break-word px-2 text-sm font-medium text-slate-800">
        <span aria-hidden="true" className={completed ? 'text-emerald-600' : 'text-slate-400'}>
          {completed ? '✓' : '○'}
        </span>
        <span>
          {concept.title}
          <span className="sr-only">{completed ? ' — Completed' : ' — Not completed'}</span>
        </span>
      </p>

      {resources.length === 0 ? (
        <p className="px-2 pt-0.5 text-xs text-slate-500">This concept has no learning resources yet.</p>
      ) : (
        <ul className="mt-0.5 space-y-0.5">
          {resources.map((resource) => (
            <li key={resource.id}>
              <ResourceItem
                resource={resource}
                to={ROUTES.learn(courseId, resource.id)}
                isActive={resource.id === activeResourceId}
                onNavigate={onNavigate}
                autoScroll
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}