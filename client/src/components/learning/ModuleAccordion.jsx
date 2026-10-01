import { useState } from "react";
import { Icon } from "../common/Icon";
import TopicAccordion from "./TopicAccordion";

export default function ModuleAccordion({
  module,
  index = 0,
  expanded = false,
  onToggle,
  activeResourceId,
  progressMap,
}) {
  const [isOpen, setIsOpen] = useState(expanded);

  const topics = module?.topics || [];

  const completedTopics = topics.filter((topic) => {
    const concepts = topic?.concepts || [];

    if (!concepts.length) return false;

    return concepts.every((concept) => {
      const resources = concept?.resources || [];

      if (!resources.length) return false;

      return resources.every(
        (resource) => progressMap?.[resource._id || resource.id]?.completed
      );
    });
  }).length;

  const handleToggle = () => {
    setIsOpen((value) => !value);
    onToggle?.(module);
  };

  return (
    <section className="border-b border-[var(--border)] last:border-b-0">
      <button
        type="button"
        onClick={handleToggle}
        className={[
          "group flex w-full items-center gap-3 px-4 py-4 text-left",
          "transition-colors duration-200",
          "hover:bg-white/[0.03]",
          isOpen ? "bg-white/[0.025]" : "",
        ].join(" ")}
      >
        <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[var(--accent)]">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1">
          <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Module
          </span>

          <span className="block truncate text-sm font-semibold text-white">
            {module?.title || "Untitled Module"}
          </span>
        </span>

        {topics.length > 0 && (
          <span className="hidden font-mono text-[10px] text-[var(--muted)] sm:block">
            {completedTopics}/{topics.length}
          </span>
        )}

        <Icon
          name="chevron-down"
          size={15}
          className={[
            "shrink-0 text-[var(--muted)] transition-transform duration-200",
            isOpen ? "rotate-180 text-white" : "",
          ].join(" ")}
        />
      </button>

      <div
        className={[
          "grid transition-[grid-template-rows] duration-250 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ].join(" ")}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-[var(--border)] bg-black/20 px-2 py-2">
            {topics.length > 0 ? (
              topics.map((topic, topicIndex) => (
                <TopicAccordion
                  key={topic?._id || topic?.id || topicIndex}
                  topic={topic}
                  index={topicIndex}
                  activeResourceId={activeResourceId}
                  progressMap={progressMap}
                />
              ))
            ) : (
              <div className="px-3 py-4 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                No topics available
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}