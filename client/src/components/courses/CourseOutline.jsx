import { pluralize } from '../../utils/formatters.js';
import EmptyState from '../common/EmptyState.jsx';
import Icon from '../common/Icon.jsx';

// Read-only overview of the course tree using native <details>.
// Native details/summary keeps the outline keyboard accessible without JavaScript.
export default function CourseOutline({ modules }) {
  if (modules.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        message="This course has no modules yet."
      />
    );
  }

  return (
    <ol className="space-y-2 sm:space-y-3">
      {modules.map((module, index) => {
        const topics = module.topics ?? [];

        return (
          <li key={module.id}>
            <details
              open={index === 0}
              className="group overflow-hidden border border-[#292929] bg-[#111] transition-colors hover:border-[#3a3a3a]"
            >
              {/* MODULE HEADER */}
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-3.5 py-3.5 transition-colors hover:bg-[#151515] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#ff3e00] sm:gap-4 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">

                {/* CHEVRON */}
                <span className="flex size-7 shrink-0 items-center justify-center border border-[#292929] bg-[#0d0d0d] sm:size-8">
                  <Icon
                    name="chevron-right"
                    className="size-3.5 text-[#777] transition-transform duration-200 group-open:rotate-90 sm:size-4"
                  />
                </span>

                {/* MODULE NUMBER */}
                <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-widest text-[#444] sm:block">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* MODULE TITLE */}
                <span className="min-w-0 flex-1 wrap-break-word text-sm font-medium leading-5 text-white sm:text-[15px]">
                  {module.title}
                </span>

                {/* TOPIC COUNT */}
                <span className="shrink-0 border border-[#292929] bg-[#0d0d0d] px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-[#666] sm:px-2.5 sm:text-[9px]">
                  {pluralize(topics.length, 'topic')}
                </span>
              </summary>

              {/* TOPICS */}
              {topics.length === 0 ? (
                <div className="border-t border-[#242424] px-4 py-4 sm:px-5 sm:py-5">
                  <p className="text-xs leading-6 text-[#666] sm:text-sm">
                    This module has no topics yet.
                  </p>
                </div>
              ) : (
                <ul className="border-t border-[#242424] bg-[#0d0d0d] px-3 py-2 sm:px-5 sm:py-3">
                  {topics.map((topic, topicIndex) => (
                    <li
                      key={topic.id}
                      className="group/topic flex min-w-0 items-center gap-3 border-b border-[#1f1f1f] py-3 last:border-b-0 sm:gap-4 sm:py-3.5"
                    >
                      {/* TOPIC NUMBER */}
                      <span className="w-5 shrink-0 text-right font-mono text-[8px] text-[#444] sm:w-6 sm:text-[9px]">
                        {String(topicIndex + 1).padStart(2, '0')}
                      </span>

                      {/* INDICATOR */}
                      <span className="size-1.5 shrink-0 bg-[#444] transition-colors group-hover/topic:bg-[#ff3e00]" />

                      {/* TOPIC TITLE */}
                      <span className="min-w-0 flex-1 wrap-break-word text-xs leading-5 text-[#999] transition-colors group-hover/topic:text-white sm:text-sm">
                        {topic.title}
                      </span>

                      {/* CONCEPT COUNT */}
                      <span className="shrink-0 font-mono text-[8px] uppercase tracking-wider text-[#555] sm:text-[9px]">
                        {pluralize(
                          (topic.concepts ?? []).length,
                          'concept',
                        )}
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