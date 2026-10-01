import { Link } from "react-router";
import Icon from "../common/Icon.jsx";

export function PageHeader({
  title,
  description,
  actions,
  backTo,
  backLabel = "Back",
}) {
  return (
    <header className="mb-8">
      {backTo && (
        <Link
          to={backTo}
          className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-neutral-500 transition-colors hover:text-white"
        >
          <Icon name="arrow-left" className="size-4" />
          {backLabel}
        </Link>
      )}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-[#FF3E00]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FF3E00]">
              Dashboard
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  to,
}) {
  const content = (
    <div className="relative overflow-hidden border border-[#2A2A2A] bg-[#111111] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-600">
      <div className="absolute right-0 top-0 h-16 w-16 bg-[#FF3E00]/[0.035]" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
            {label}
          </p>

          <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white">
            {value}
          </p>

          {hint && (
            <p className="mt-2 text-xs text-neutral-600">
              {hint}
            </p>
          )}
        </div>

        {icon && (
          <div className="flex size-9 shrink-0 items-center justify-center border border-[#2A2A2A] text-[#FF3E00]">
            <Icon name={icon} className="size-4" />
          </div>
        )}
      </div>

      <div className="mt-5 h-px bg-[#2A2A2A]" />

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-700">
          LMS / DATA
        </span>

        {to && (
          <Icon
            name="arrow-right"
            className="size-3 text-neutral-600"
          />
        )}
      </div>
    </div>
  );

  if (!to) return <div>{content}</div>;

  return (
    <Link
      to={to}
      className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00]"
    >
      {content}
    </Link>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
}) {
  return (
    <section
      className={`overflow-hidden border border-[#2A2A2A] bg-[#111111] ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-[#2A2A2A] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 bg-[#FF3E00]" />

            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-white">
              {title}
            </h2>
          </div>

          {description && (
            <p className="mt-1.5 text-xs leading-5 text-neutral-600">
              {description}
            </p>
          )}
        </div>

        {actions}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}