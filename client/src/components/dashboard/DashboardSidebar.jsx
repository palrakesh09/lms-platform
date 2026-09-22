import { Link, NavLink } from 'react-router';
import Icon from '../common/Icon.jsx';

// Only pages that exist. Add an entry here when a real page is added.
const NAV = {
  admin: [
    { label: 'Dashboard', to: '/admin', icon: 'layout', end: true },
    { label: 'Courses', to: '/admin/courses', icon: 'book' },
    { label: 'Users', to: '/admin/users', icon: 'users' },
  ],
  mentor: [
    { label: 'Dashboard', to: '/mentor', icon: 'layout', end: true },
    { label: 'My Courses', to: '/mentor/courses', icon: 'book' },
  ],
};

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'
  }`;

export default function DashboardSidebar({ area, onNavigate, onClose, closeRef }) {
  return (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div>
          <p className="text-sm font-semibold text-indigo-600">LMS Platform</p>
          <p className="text-xs capitalize text-slate-600">{area}</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:hidden"
        >
          <Icon name="x" className="size-5" />
        </button>
      </div>

      <nav aria-label="Dashboard" className="min-h-0 flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {NAV[area].map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} onClick={onNavigate} className={linkClass}>
                <Icon name={item.icon} className="size-4" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-3">
        <Link to="/courses" onClick={onNavigate} className={linkClass({ isActive: false })}>
          <Icon name="arrow-left" className="size-4" />
          Back to site
        </Link>
      </div>
    </>
  );
}