import { Link } from 'react-router';
import {
  formatRelativeTime,
  safeLink,
} from '../../utils/notificationUtils.js';
import {
  smallButton,
  smallDangerButton,
} from '../common/buttonClasses.js';

function Body({ notification }) {
  return (
    <>
      <span className="flex items-start gap-2">
        {!notification.isRead && (
          <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-[#FF3E00]">
            <span className="sr-only">
              New, unread
            </span>
          </span>
        )}

        <span
          className={[
            'break-words text-sm',
            notification.isRead
              ? 'font-normal text-neutral-400'
              : 'font-semibold text-white',
          ].join(' ')}
        >
          {notification.title}
        </span>
      </span>

      {notification.message && (
        <span className="mt-1 block line-clamp-2 break-words text-xs leading-5 text-neutral-500">
          {notification.message}
        </span>
      )}

      <time
        dateTime={notification.createdAt}
        className="mt-2 block font-mono text-[9px] uppercase tracking-wider text-neutral-700"
      >
        {formatRelativeTime(
          notification.createdAt,
        )}
      </time>
    </>
  );
}

const focus =
  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF3E00]';

export default function NotificationItem({
  notification,
  onOpen,
  onMarkRead,
  onDelete,
}) {
  const to = safeLink(
    notification.link,
  );

  const rowClass = [
    'block w-full px-4 py-3 text-left transition-colors',
    'hover:bg-[#171717]',
    focus,
  ].join(' ');

  return (
    <li
      className={[
        'flex flex-wrap items-start gap-x-3 border-b border-neutral-800 last:border-b-0',
        notification.isRead
          ? 'bg-[#111111]'
          : 'border-l-2 border-l-[#FF3E00] bg-[#171717]',
      ].join(' ')}
    >
      <div className="min-w-0 flex-1">
        {to ? (
          <Link
            to={to}
            onClick={() =>
              onOpen(notification)
            }
            className={rowClass}
          >
            <Body
              notification={notification}
            />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() =>
              onOpen(notification)
            }
            className={rowClass}
          >
            <Body
              notification={notification}
            />
          </button>
        )}
      </div>

      {(onMarkRead || onDelete) && (
        <div className="flex w-full gap-2 border-t border-neutral-800 px-4 py-2 sm:w-auto sm:border-t-0 sm:px-3">
          {onMarkRead &&
            !notification.isRead && (
              <button
                type="button"
                onClick={() =>
                  onMarkRead(
                    notification,
                  )
                }
                className={smallButton}
              >
                Mark read
                <span className="sr-only">
                  : {notification.title}
                </span>
              </button>
            )}

          {onDelete && (
            <button
              type="button"
              onClick={() =>
                onDelete(notification)
              }
              className={smallDangerButton}
            >
              Delete
              <span className="sr-only">
                : {notification.title}
              </span>
            </button>
          )}
        </div>
      )}
    </li>
  );
}