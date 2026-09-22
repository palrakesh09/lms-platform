import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { getResourceTypeMeta } from '../../utils/resourceTypes.js';
import Icon from '../common/Icon.jsx';

// One selectable resource. The active state comes from the route (via `isActive`), not from local state.
// `autoScroll` keeps the active item visible inside a long, scrollable sidebar.
export default function ResourceItem({ resource, to, isActive, onNavigate, autoScroll = false }) {
  const ref = useRef(null);
  const meta = getResourceTypeMeta(resource.type);

  useEffect(() => {
    if (autoScroll && isActive) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [autoScroll, isActive]);

  return (
    <Link
      ref={ref}
      to={to}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 ${
        isActive
          ? 'bg-indigo-50 font-medium text-indigo-900 ring-1 ring-inset ring-indigo-200'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <Icon name={meta.icon} className={`mt-0.5 size-4 shrink-0 ${meta.iconClass}`} />
      <span className="min-w-0">
        <span className="block wrap-break-word leading-snug">{resource.title}</span>
        <span className="block text-xs font-normal text-slate-600">{meta.label}</span>
      </span>
    </Link>
  );
}