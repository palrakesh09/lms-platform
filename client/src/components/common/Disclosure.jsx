import { useId } from 'react';
import Icon from './Icon.jsx';

const LEVEL_STYLES = {
  module: {
    button: 'py-3 pl-4 pr-4',
    eyebrow: 'text-[11px] font-semibold uppercase tracking-wider text-slate-500',
    title: 'text-sm font-semibold text-slate-900',
  },
  topic: {
    button: 'py-2 pl-8 pr-4',
    eyebrow: 'text-[11px] font-medium uppercase tracking-wider text-slate-500',
    title: 'text-sm font-medium text-slate-800',
  },
};

// Controlled accordion section. It is a real <button> with aria-expanded, so Enter and Space work natively.
// Closed content is not rendered, and aria-controls is only set while the panel exists.
export default function Disclosure({ open, onToggle, eyebrow, title, level = 'module', children }) {
  const panelId = useId();
  const styles = LEVEL_STYLES[level];

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={`flex w-full items-start gap-2 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 ${styles.button}`}
      >
        <Icon
          name="chevron-right"
          className={`mt-0.5 size-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`}
        />
        <span className="min-w-0">
          {eyebrow && <span className={`block ${styles.eyebrow}`}>{eyebrow}</span>}
          <span className={`block wrap-break-word leading-snug ${styles.title}`}>{title}</span>
        </span>
      </button>
      {open && <div id={panelId}>{children}</div>}
    </div>
  );
}