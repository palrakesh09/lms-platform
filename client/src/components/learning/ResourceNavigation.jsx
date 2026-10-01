import { Link } from "react-router-dom";
import { Icon } from "../common/Icon";
import { ROUTES } from "../../utils/paths";

export default function ResourceNavigation({
  courseId,
  previousResource,
  nextResource,
}) {
  const previousId = previousResource?._id || previousResource?.id;
  const nextId = nextResource?._id || nextResource?.id;

  return (
    <div className="mt-10 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2">
      {previousResource ? (
        <Link
          to={ROUTES.learn(courseId, previousId)}
          className="group border border-[var(--border)] bg-[var(--surface)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20"
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
            <Icon name="arrow-left" size={12} />
            Previous
          </div>

          <div className="truncate text-sm font-semibold text-white">
            {previousResource.title}
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextResource ? (
        <Link
          to={ROUTES.learn(courseId, nextId)}
          className="group border border-[var(--border)] bg-[var(--surface)] p-4 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/40"
        >
          <div className="mb-3 flex items-center justify-end gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Next
            <Icon name="arrow-right" size={12} />
          </div>

          <div className="truncate text-sm font-semibold text-white">
            {nextResource.title}
          </div>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}