import { useState } from "react";
import { Icon } from "../common/Icon";
import ConceptItem from "./ConceptItem";

export default function TopicAccordion({
  topic,
  index = 0,
  activeResourceId,
  progressMap,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const concepts = topic?.concepts || [];

  return (
    <div className="mb-1 last:mb-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={[
          "flex w-full items-center gap-3 px-3 py-3 text-left",
          "border border-transparent transition-all duration-200",
          "hover:border-[var(--border)] hover:bg-white/[0.025]",
          isOpen ? "border-[var(--border)] bg-white/[0.025]" : "",
        ].join(" ")}
      >
        <span className="font-mono text-[9px] text-[var(--muted)]">
          T{String(index + 1).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1 truncate text-xs font-medium text-white/90">
          {topic?.title || "Untitled Topic"}
        </span>

        <span className="font-mono text-[9px] text-[var(--muted)]">
          {concepts.length}
        </span>

        <Icon
          name="chevron-down"
          size={13}
          className={[
            "shrink-0 text-[var(--muted)] transition-transform duration-200",
            isOpen ? "rotate-180 text-white" : "",
          ].join(" ")}
        />
      </button>

      <div
        className={[
          "grid transition-[grid-template-rows] duration-200",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ].join(" ")}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="ml-3 border-l border-[var(--border)] py-1 pl-2">
            {concepts.map((concept, conceptIndex) => (
              <ConceptItem
                key={concept?._id || concept?.id || conceptIndex}
                concept={concept}
                index={conceptIndex}
                activeResourceId={activeResourceId}
                progressMap={progressMap}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}