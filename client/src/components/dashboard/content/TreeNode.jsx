import { useId } from 'react';
import Icon from '../../common/Icon.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import { useContentActions } from './ContentActionsContext.js';

const LEVELS = {
  module: 'rounded-lg border border-slate-200 bg-white shadow-sm',
  topic: 'rounded-md border border-slate-200 bg-slate-50/60',
  concept: 'rounded-md border border-slate-100 bg-white',
};

// One expandable row of the content tree. The header is a real button with aria-expanded, and the
// actions sit beside it (not inside it), so keyboard and screen-reader users can reach every control.
export default function TreeNode({ id, level, eyebrow, title, status, order, count, actions, children }) {
  const { expanded, toggle } = useContentActions();
  const panelId = useId();
  const open = expanded.has(id);

  return (
    <li className={LEVELS[level]}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
        <button
          type="button"
          onClick={() => toggle(id)}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          className="flex min-w-0 flex-1 basis-56 items-start gap-2 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Icon name="chevron-right" className={`mt-1 size-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`} />
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">{eyebrow}</span>
            <span className="block wrap-break-word font-medium leading-snug text-slate-900">{title}</span>
            <span className="block text-xs text-slate-600">
              {count} · Order {order}
            </span>
          </span>
        </button>
        <StatusBadge status={status} />
        {actions}
      </div>
      {open && (
        <div id={panelId} className="border-t border-slate-100 px-3 py-2">
          {children}
        </div>
      )}
    </li>
  );
}