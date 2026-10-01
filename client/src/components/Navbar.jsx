import { useState } from "react";
import { Link, NavLink } from "react-router";

import { AUTH_STATUS } from "../context/AuthContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { getDashboardPath, hasRole, ROLES } from "../utils/roles.js";

import Icon from "./common/Icon.jsx";
import SearchBar from "./search/SearchBar.jsx";
import NotificationBell from "./notifications/NotificationBell.jsx";

const navLinkClass = ({ isActive }) =>
  `block border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "border-[#FF3E00] bg-white/[0.06] text-white"
      : "border-transparent text-neutral-400 hover:border-neutral-700 hover:bg-white/[0.03] hover:text-white"
  }`;

export default function Navbar({ fluid = false }) {
  const { status, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const authenticated = status === AUTH_STATUS.AUTHENTICATED;

  const dashboardPath = authenticated
    ? getDashboardPath(user)
    : null;

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-neutral-800 bg-[#0A0A0A]/95 backdrop-blur-xl">
      <nav
        aria-label="Main"
        className={`mx-auto flex min-h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 ${
          fluid ? "" : "max-w-7xl"
        }`}
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMobile}
          className="group flex shrink-0 items-center gap-2"
        >
          <span className="relative flex h-8 w-8 items-center justify-center bg-[#FF3E00] font-mono text-sm font-bold text-white transition-transform group-hover:scale-105">
            L
          </span>

          <span className="hidden font-semibold tracking-tight text-white sm:block">
            LMS<span className="text-[#FF3E00]">.</span>
          </span>
        </Link>

        {/* Desktop Search */}
        {authenticated && (
          <div className="hidden min-w-0 flex-1 justify-center px-4 md:flex">
            <div className="w-full max-w-md">
              <SearchBar />
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          {authenticated && (
            <>
              <NavLink to="/courses" className={navLinkClass}>
                Courses
              </NavLink>

              {hasRole(user, [ROLES.STUDENT]) && (
                <NavLink to="/my-learning" className={navLinkClass}>
                  My Learning
                </NavLink>
              )}

              {hasRole(user, [ROLES.STUDENT]) && (
                <NavLink to="/activity" className={navLinkClass}>
                  Activity
                </NavLink>
              )}

              {dashboardPath && (
                <NavLink to={dashboardPath} className={navLinkClass}>
                  Dashboard
                </NavLink>
              )}

              <NotificationBell />

              <NavLink
                to="/account"
                className="ml-1 flex max-w-40 items-center gap-2 border-l border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
              >
                <span className="flex size-7 shrink-0 items-center justify-center bg-neutral-800 font-mono text-[11px] font-bold text-neutral-300">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>

                <span className="truncate">
                  {user?.name}
                </span>
              </NavLink>

              <button
                type="button"
                onClick={logout}
                className="rounded-sm px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-white/5 hover:text-white"
              >
                Log out
              </button>
            </>
          )}

          {!authenticated && (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Log in
              </NavLink>

              <NavLink
                to="/register"
                className="ml-1 bg-[#FF3E00] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#FF5722]"
              >
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {authenticated && <NotificationBell />}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className={`flex size-10 items-center justify-center border transition-colors ${
              mobileOpen
                ? "border-[#FF3E00] bg-[#FF3E00] text-white"
                : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white"
            }`}
          >
            <Icon
              name={mobileOpen ? "x" : "menu"}
              className="size-5"
            />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-neutral-800 bg-[#0D0D0D] shadow-2xl lg:hidden"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
            {/* Mobile Search */}
            {authenticated && (
              <div className="mb-4 border-b border-neutral-800 pb-4">
                <p className="mono-label mb-2 text-neutral-600">
                  SEARCH
                </p>

                <SearchBar />
              </div>
            )}

            {/* Navigation Label */}
            <p className="mono-label mb-2 px-3 text-neutral-600">
              NAVIGATION
            </p>

            <div className="space-y-1">
              <NavLink
                to="/"
                end
                onClick={closeMobile}
                className={navLinkClass}
              >
                Home
              </NavLink>

              {authenticated && (
                <>
                  <NavLink
                    to="/courses"
                    onClick={closeMobile}
                    className={navLinkClass}
                  >
                    Courses
                  </NavLink>

                  {hasRole(user, [ROLES.STUDENT]) && (
                    <NavLink
                      to="/my-learning"
                      onClick={closeMobile}
                      className={navLinkClass}
                    >
                      My Learning
                    </NavLink>
                  )}

                  {hasRole(user, [ROLES.STUDENT]) && (
                    <NavLink
                      to="/activity"
                      onClick={closeMobile}
                      className={navLinkClass}
                    >
                      Activity
                    </NavLink>
                  )}

                  {dashboardPath && (
                    <NavLink
                      to={dashboardPath}
                      onClick={closeMobile}
                      className={navLinkClass}
                    >
                      Dashboard
                    </NavLink>
                  )}

                  <NavLink
                    to="/account"
                    onClick={closeMobile}
                    className={navLinkClass}
                  >
                    Account
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile Account */}
            {authenticated && (
              <div className="mt-4 border-t border-neutral-800 pt-4">
                <div className="mb-3 flex items-center gap-3 px-3">
                  <span className="flex size-9 items-center justify-center bg-neutral-800 font-mono text-xs font-bold text-neutral-300">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {user?.name}
                    </p>

                    <p className="truncate text-xs text-neutral-600">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    logout();
                  }}
                  className="w-full border border-neutral-800 px-3 py-3 text-left text-sm font-medium text-neutral-400 transition-colors hover:border-[#FF3E00] hover:bg-white/[0.03] hover:text-white"
                >
                  Log out
                </button>
              </div>
            )}

            {/* Guest Actions */}
            {!authenticated && (
              <div className="mt-4 border-t border-neutral-800 pt-4">
                <div className="space-y-2">
                  <NavLink
                    to="/login"
                    onClick={closeMobile}
                    className={navLinkClass}
                  >
                    Log in
                  </NavLink>

                  <NavLink
                    to="/register"
                    onClick={closeMobile}
                    className="block bg-[#FF3E00] px-3 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#FF5722]"
                  >
                    Register
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}