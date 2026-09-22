import { pluralize } from '../../utils/formatters.js';
import EmptyState from '../common/EmptyState.jsx';
import Icon from '../common/Icon.jsx';

// Read-only overview of the course tree using native <details>, which is keyboard accessible with no JavaScript.
export default function CourseOutline({ modules }) {
  if (modules.length === 0) {
    return <EmptyState title="Nothing here yet" message="This course has no modules yet." />;
  }

  return (
    <ol className="space-y-2">
      {modules.map((module, index) => {
        const topics = module.topics ?? [];

        return (
          <li key={module.id}>
            <details open={index === 0} className="group rounded-lg border border-slate-200 bg-white">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 [&::-webkit-details-marker]:hidden">
                <Icon
                  name="chevron-right"
                  className="size-4 shrink-0 text-slate-500 transition-transform group-open:rotate-90"
                />
                <span className="min-w-0 flex-1 wrap-break-word font-medium text-slate-900">{module.title}</span>
                <span className="shrink-0 text-xs text-slate-500">{pluralize(topics.length, 'topic')}</span>
              </summary>

              {topics.length === 0 ? (
                <p className="px-4 pb-3 pl-10 text-sm text-slate-500">This module has no topics yet.</p>
              ) : (
                <ul className="space-y-1 px-4 pb-3 pl-10">
                  {topics.map((topic) => (
                    <li key={topic.id} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 wrap-break-word text-slate-700">{topic.title}</span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {pluralize((topic.concepts ?? []).length, 'concept')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          </li>
        );
      })}
    </ol>
  );
}