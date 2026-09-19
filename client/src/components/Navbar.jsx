import { Link, NavLink } from 'react-router';
import { AUTH_STATUS } from '../context/AuthContext.js';
import { useAuth } from '../hooks/useAuth.js';

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function Navbar() {
  const { status, user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link to="/" className="text-lg font-semibold tracking-tight text-indigo-600">
          LMS Platform
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          {status === AUTH_STATUS.AUTHENTICATED && (
            <>
              <NavLink to="/account" className={navLinkClass}>
                <span className="inline-block max-w-\[10rem\] truncate align-bottom">{user.name}</span>
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Log out
              </button>
            </>
          )}

          {status === AUTH_STATUS.GUEST && (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Log in
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}