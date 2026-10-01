import { useMemo, useState } from "react";
import { Icon } from "../common/Icon";
import ResourceItem from "./ResourceItem";

export default function ConceptItem({
  concept,
  index = 0,
  activeResourceId,
  progressMap,
}) {
  const resources = concept?.resources || [];

  const [isOpen, setIsOpen] = useState(false);

  const completedCount = useMemo(() => {
    return resources.filter((resource) => {
      const id = resource?._id || resource?.id;
      return progressMap?.[id]?.completed;
    }).length;
  }, [resources, progressMap]);

  const isComplete =
    resources.length > 0 && completedCount === resources.length;

  const hasActiveResource = resources.some(
    (resource) =>
      (resource?._id || resource?.id) === activeResourceId
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={[
          "group relative flex w-full items-center gap-2 px-3 py-2.5 text-left",
          "transition-colors duration-200",
          hasActiveResource ? "bg-[var(--accent)]/[0.06]" : "",
          "hover:bg-white/[0.03]",
        ].join(" ")}
      >
        {hasActiveResource && (
          <span className="absolute left-[-9px] top-0 h-full w-[2px] bg-[var(--accent)]" />
        )}

        <span
          className={[
            "flex h-5 w-5 shrink-0 items-center justify-center border",
            isComplete
              ? "border-[var(--success)] bg-[var(--success)] text-black"
              : hasActiveResource
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)]",
          ].join(" ")}
        >
          {isComplete ? (
            <Icon name="check" size={11} />
          ) : (
            <span className="font-mono text-[8px]">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-medium text-white/90">
            {concept?.title || "Untitled Concept"}
          </span>

          {resources.length > 0 && (
            <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-wider text-[var(--muted)]">
              {completedCount}/{resources.length} complete
            </span>
          )}
        </span>

        {resources.length > 0 && (
          <Icon
            name="chevron-down"
            size={12}
            className={[
              "shrink-0 text-[var(--muted)] transition-transform duration-200",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
          />
        )}
      </button>

      {resources.length > 0 && (
        <div
          className={[
            "grid transition-[grid-template-rows] duration-200",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          ].join(" ")}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="ml-5 border-l border-dashed border-[var(--border)] py-1 pl-2">
              {resources.map((resource, resourceIndex) => (
                <ResourceItem
                  key={resource?._id || resource?.id || resourceIndex}
                  resource={resource}
                  index={resourceIndex}
                  isActive={
                    (resource?._id || resource?.id) === activeResourceId
                  }
                  isCompleted={
                    progressMap?.[resource?._id || resource?.id]?.completed
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}