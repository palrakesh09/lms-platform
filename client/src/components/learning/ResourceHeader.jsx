import { Icon } from "../common/Icon";

export default function ResourceHeader({
  resource,
  moduleTitle,
  topicTitle,
}) {
  return (
    <header className="mb-8">
      <div className="mb-5 flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">
        <span>Learning</span>

        <Icon name="chevron-right" size={11} />

        {moduleTitle && (
          <>
            <span>{moduleTitle}</span>
            <Icon name="chevron-right" size={11} />
          </>
        )}

        {topicTitle && (
          <>
            <span>{topicTitle}</span>
            <Icon name="chevron-right" size={11} />
          </>
        )}

        <span className="text-[var(--accent)]">
          {resource?.type || "Resource"}
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div className="mt-1 hidden h-10 w-[3px] bg-[var(--accent)] sm:block" />

        <div className="min-w-0">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Resource
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {resource?.title || "Untitled Resource"}
          </h1>

          {resource?.description && (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              {resource.description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}