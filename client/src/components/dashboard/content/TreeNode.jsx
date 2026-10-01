import { useId } from 'react';
import Icon from '../../common/Icon.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import { useContentActions } from './ContentActionsContext.js';

const LEVEL_STYLES = {
  module: {
    wrapper:
      'border border-[var(--lms-border)] bg-[var(--lms-surface)]',
    accent: 'bg-[var(--lms-accent)]',
    eyebrow: 'text-[var(--lms-accent)]',
  },

  topic: {
    wrapper:
      'border border-[var(--lms-border)] bg-[#0D0D0D]',
    accent: 'bg-white/30',
    eyebrow: 'text-white/60',
  },

  concept: {
    wrapper:
      'border border-[var(--lms-border)] bg-[#0B0B0B]',
    accent: 'bg-white/15',
    eyebrow: 'text-white/50',
  },
};

export default function TreeNode({
  id,
  level,
  eyebrow,
  title,
  status,
  order,
  count,
  actions,
  children,
}) {
  const { expanded, toggle } = useContentActions();

  const panelId = useId();
  const open = expanded.has(id);

  const styles = LEVEL_STYLES[level] ?? LEVEL_STYLES.concept;

  return (
    <li className={`${styles.wrapper} overflow-hidden`}>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        {/* Accent */}
        <span
          aria-hidden="true"
          className={`h-10 w-0.5 shrink-0 ${styles.accent}`}
        />

        {/* Toggle */}
        <button
          type="button"
          onClick={() => toggle(id)}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          className="flex min-w-0 flex-1 basis-64 items-start gap-3 text-left"
        >
          <span className="mt-1 flex size-6 shrink-0 items-center justify-center border border-[var(--lms-border)]">
            <Icon
              name="chevron-right"
              className={`size-3 transition-transform ${
                open ? 'rotate-90' : ''
              }`}
            />
          </span>

          <span className="min-w-0">
            <span
              className={`mono-label block ${styles.eyebrow}`}
            >
              {eyebrow}
            </span>

            <span className="mt-1 block break-words text-sm font-semibold text-white">
              {title}
            </span>

            <span className="mt-1 block font-mono text-[11px] text-[var(--lms-muted)]">
              {count} / ORDER {order}
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          {status && <StatusBadge status={status} />}
          {actions}
        </div>
      </div>

      {open && (
        <div
          id={panelId}
          className="border-t border-[var(--lms-border)] p-3"
        >
          {children}
        </div>
      )}
    </li>
  );
}