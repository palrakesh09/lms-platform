import { useEffect, useId, useRef, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications.js';
import { formatBadgeCount } from '../../utils/notificationUtils.js';
import Icon from '../common/Icon.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); } };
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <Icon name="bell" className="size-5" />
        {unreadCount > 0 && (
          <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 min-w-[1.1rem] rounded-full bg-red-600 px-1 text-center text-[10px] font-bold leading-[1.1rem] text-white">
            {formatBadgeCount(unreadCount)}
          </span>
        )}
      </button>
      <span role="status" className="sr-only">{unreadCount > 0 ? `${unreadCount} unread notifications` : ''}</span>
      {open && <NotificationDropdown id={panelId} onClose={() => setOpen(false)} />}
    </div>
  );
}