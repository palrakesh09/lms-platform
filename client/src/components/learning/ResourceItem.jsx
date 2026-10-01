import { Link } from "react-router-dom";
import { Icon } from "../common/Icon";
import { ROUTES } from "../../utils/paths";

const RESOURCE_ICONS = {
  video: "play",
  article: "file-text",
  document: "file",
  pdf: "file",
  code: "code",
  coding: "code",
  quiz: "clipboard",
  image: "image",
  link: "external-link",
};

function getResourceIcon(type) {
  return RESOURCE_ICONS[String(type || "").toLowerCase()] || "file";
}

export default function ResourceItem({
  resource,
  index = 0,
  isActive = false,
  isCompleted = false,
}) {
  const resourceId = resource?._id || resource?.id;
  const courseId = resource?.courseId;

  const resourceType =
    resource?.type ||
    resource?.resourceType ||
    resource?.contentType ||
    "resource";

  const target =
    courseId && resourceId
      ? ROUTES.learn(courseId, resourceId)
      : "#";

  return (
    <Link
      to={target}
      className={[
        "group relative flex min-h-10 items-center gap-2 px-3 py-2",
        "transition-all duration-200",
        isActive
          ? "bg-[var(--accent)]/[0.08] text-white"
          : "text-[var(--muted)] hover:bg-white/[0.03] hover:text-white",
      ].join(" ")}
    >
      {isActive && (
        <span className="absolute left-[-9px] top-0 h-full w-[2px] bg-[var(--accent)]" />
      )}

      <span
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center",
          isCompleted
            ? "text-[var(--success)]"
            : isActive
              ? "text-[var(--accent)]"
              : "text-[var(--muted)]",
        ].join(" ")}
      >
        {isCompleted ? (
          <Icon name="check-circle" size={13} />
        ) : (
          <Icon name={getResourceIcon(resourceType)} size={13} />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={[
            "block truncate text-[10px] leading-4",
            isActive ? "font-semibold text-white" : "font-medium",
          ].join(" ")}
        >
          {resource?.title || "Untitled Resource"}
        </span>

        <span className="block font-mono text-[8px] uppercase tracking-wider text-[var(--muted)]">
          {String(resourceType).replace(/[-_]/g, " ")}
        </span>
      </span>

      <span className="font-mono text-[8px] text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100">
        {String(index + 1).padStart(2, "0")}
      </span>
    </Link>
  );
}