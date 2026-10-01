import { useAuth } from "../../hooks/useAuth.js";
import Icon from "../common/Icon.jsx";
import SearchBar from "../search/SearchBar.jsx";
import NotificationBell from "../notifications/NotificationBell.jsx";

export default function DashboardTopbar({
  area,
  drawerOpen,
  onMenu,
  menuRef,
}) {
  const { user, logout } = useAuth();

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="relative flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-neutral-800 bg-[#0D0D0D] px-3 sm:px-5 lg:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile / Tablet Menu */}
        <button
          ref={menuRef}
          type="button"
          onClick={onMenu}
          aria-expanded={drawerOpen}
          aria-controls="dashboard-sidebar"
          aria-label={
            drawerOpen
              ? "Close dashboard navigation"
              : "Open dashboard navigation"
          }
          className={`flex size-10 shrink-0 items-center justify-center border transition-colors xl:hidden ${
            drawerOpen
              ? "border-[#FF3E00] bg-[#FF3E00] text-white"
              : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white"
          }`}
        >
          <Icon
            name={drawerOpen ? "x" : "menu"}
            className="size-5"
          />
        </button>

        {/* Workspace */}
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#FF3E00] sm:text-[10px]">
            Workspace
          </p>

          <p className="truncate text-sm font-semibold capitalize text-white sm:text-[15px]">
            {area} dashboard
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex min-w-0 items-center gap-2">
        {/* Search */}
        <div className="hidden w-48 lg:block xl:w-64 2xl:w-72">
          <SearchBar />
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* User */}
        <div className="hidden items-center gap-2 border-l border-neutral-800 pl-3 md:flex">
          <div className="flex size-8 shrink-0 items-center justify-center bg-neutral-800 font-mono text-xs font-bold text-neutral-300">
            {userInitial}
          </div>

          <div className="hidden max-w-32 min-w-0 lg:block xl:max-w-40">
            <p className="truncate text-xs font-medium text-neutral-300">
              {user?.name}
            </p>

            <p className="truncate font-mono text-[9px] uppercase tracking-wider text-neutral-600">
              {area}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="hidden border border-neutral-800 px-3 py-2 text-[10px] font-semibold tracking-wider text-neutral-400 transition-colors hover:border-[#FF3E00] hover:bg-white/[0.03] hover:text-white sm:block"
        >
          LOG OUT
        </button>

        {/* Mobile User Avatar */}
        <div
          className="flex size-9 items-center justify-center bg-neutral-800 font-mono text-xs font-bold text-neutral-300 md:hidden"
          aria-label={user?.name || "User"}
          title={user?.name || "User"}
        >
          {userInitial}
        </div>
      </div>

      {/* Tablet Search */}
      <div className="absolute left-1/2 top-full z-20 hidden w-full -translate-x-1/2 border-b border-neutral-800 bg-[#0D0D0D] px-4 py-3 md:max-lg:block">
        <SearchBar />
      </div>
    </header>
  );
}