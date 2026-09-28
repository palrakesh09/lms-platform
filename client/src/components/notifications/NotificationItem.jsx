import { Link } from 'react-router';
import { formatRelativeTime, safeLink } from '../../utils/notificationUtils.js';
import { smallButton, smallDangerButton } from '../common/buttonClasses.js';

// Unread is shown by a visible "New" label, bold title and screen-reader text, never by color alone.
function Body({ n }) {
  return (
    <>
      <span className="flex items-center gap-2">
        {!n.isRead && (
          <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
            New<span className="sr-only"> (unread)</span>
          </span>
        )}
        <span className={`break-words text-sm text-slate-900 ${n.isRead ? 'font-normal' : 'font-semibold'}`}>{n.title}</span>
      </span>
      {n.message && <span className="mt-0.5 line-clamp-2 block break-words text-sm text-slate-700">{n.message}</span>}
      <time dateTime={n.createdAt} className="mt-0.5 block text-xs text-slate-600">{formatRelativeTime(n.createdAt)}</time>
    </>
  );
}

const focus = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600';

// onOpen(n) marks it read; the page variant also gets explicit mark-read/delete buttons.
export default function NotificationItem({ notification: n, onOpen, onMarkRead, onDelete }) {
  const to = safeLink(n.link);
  const rowClass = `block w-full px-3 py-2 text-left hover:bg-slate-50 ${focus}`;

  return (
    <li className={`flex flex-wrap items-start gap-x-3 border-b border-slate-100 last:border-b-0 ${n.isRead ? '' : 'bg-indigo-50/60'}`}>
      <div className="min-w-0 flex-1">
        {to ? (
          <Link to={to} onClick={() => onOpen(n)} className={rowClass}><Body n={n} /></Link>
        ) : (
          <button type="button" onClick={() => onOpen(n)} className={rowClass}><Body n={n} /></button>
        )}
      </div>
      {(onMarkRead || onDelete) && (
        <div className="flex gap-2 px-3 py-2">
          {onMarkRead && !n.isRead && <button type="button" onClick={() => onMarkRead(n)} className={smallButton}>Mark as read<span className="sr-only">: {n.title}</span></button>}
          {onDelete && <button type="button" onClick={() => onDelete(n)} className={smallDangerButton}>Delete<span className="sr-only">: {n.title}</span></button>}
        </div>
      )}
    </li>
  );
}