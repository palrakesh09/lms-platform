import { useAuth } from '../../hooks/useAuth.js';
import { smallButton } from '../common/buttonClasses.js';
import Icon from '../common/Icon.jsx';

export default function DashboardTopbar({ area, drawerOpen, onMenu, menuRef }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <button
          ref={menuRef}
          type="button"
          onClick={onMenu}
          aria-expanded={drawerOpen}
          aria-controls="dashboard-sidebar"
          className="rounded-md p-1.5 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:hidden"
        >
          <Icon name="menu" className="size-5" />
          <span className="sr-only">Open navigation</span>
        </button>
        <p className="text-sm font-semibold capitalize">{area} dashboard</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden max-w-\[12rem\] truncate text-sm text-slate-600 sm:inline">{user.name}</span>
        <button type="button" onClick={logout} className={smallButton}>
          Log out
        </button>
      </div>
    </header>
  );
}