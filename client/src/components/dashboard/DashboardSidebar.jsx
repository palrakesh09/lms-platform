import { Link, NavLink } from "react-router";
import Icon from "../common/Icon.jsx";

const NAV = {
  admin: [
    {
      label: "Dashboard",
      to: "/admin",
      icon: "layout",
      end: true,
    },
    {
      label: "Courses",
      to: "/admin/courses",
      icon: "book",
    },
    {
      label: "Users",
      to: "/admin/users",
      icon: "users",
    },
    {
      label: "Analytics",
      to: "/admin/analytics",
      icon: "chart",
    },
    {
      label: "Enrollments",
      to: "/admin/enrollments",
      icon: "clipboard",
    },
    {
      label: "Announcements",
      to: "/admin/announcements",
      icon: "megaphone",
    },
    {
      label: "Notifications",
      to: "/admin/notifications",
      icon: "bell",
    },
    {
      label: "AI Assistant",
      to: "/admin/ai-settings",
      icon: "chart",
    },
  ],

  mentor: [
    {
      label: "Dashboard",
      to: "/mentor",
      icon: "layout",
      end: true,
    },
    {
      label: "My Courses",
      to: "/mentor/courses",
      icon: "book",
    },
    {
      label: "Analytics",
      to: "/mentor/analytics",
      icon: "chart",
    },
    {
      label: "Announcements",
      to: "/mentor/announcements",
      icon: "megaphone",
    },
    {
      label: "Notifications",
      to: "/mentor/notifications",
      icon: "bell",
    },
  ],

  student: [
    {
      label: "Dashboard",
      to: "/student",
      icon: "layout",
      end: true,
    },
    {
      label: "My Learning",
      to: "/my-learning",
      icon: "book",
    },
    {
      label: "Performance",
      to: "/student/performance",
      icon: "chart",
    },
    {
      label: "Activity",
      to: "/activity",
      icon: "clock",
    },
    {
      label: "Notifications",
      to: "/notifications",
      icon: "bell",
    },
  ],
};

const GROUPS = {
  admin: [
    {
      title: "Main",
      items: ["Dashboard", "Courses", "Users"],
    },
    {
      title: "Insights",
      items: ["Analytics", "Enrollments"],
    },
    {
      title: "System",
      items: ["Announcements", "Notifications", "AI Assistant"],
    },
  ],

  mentor: [
    {
      title: "Main",
      items: ["Dashboard", "My Courses"],
    },
    {
      title: "Insights",
      items: ["Analytics"],
    },
    {
      title: "System",
      items: ["Announcements", "Notifications"],
    },
  ],

  student: [
    {
      title: "Main",
      items: ["Dashboard", "My Learning"],
    },
    {
      title: "Insights",
      items: ["Performance"],
    },
    {
      title: "System",
      items: ["Activity", "Notifications"],
    },
  ],
};

const linkClass = ({ isActive }) =>
  `group relative flex items-center gap-3 border-l-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "border-[#FF3E00] bg-[#171717] text-white"
      : "border-transparent text-neutral-500 hover:border-[#3A3A3A] hover:bg-[#141414] hover:text-white"
  }`;

export default function DashboardSidebar({
  area,
  onNavigate,
  onClose,
  closeRef,
}) {
  const navigation = NAV[area] ?? [];
  const groups = GROUPS[area] ?? [];

  return (
    <>
      {/* Brand */}
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#2A2A2A] px-5">
        <Link
          to="/"
          onClick={onNavigate}
          className="group flex min-w-0 items-center gap-3"
        >
          <span className="flex size-8 shrink-0 items-center justify-center bg-[#FF3E00] font-display text-sm font-bold text-white transition-transform group-hover:scale-105">
            L
          </span>

          <div className="min-w-0">
            <p className="font-display text-sm font-semibold tracking-tight text-white">
              LMS<span className="text-[#FF3E00]">.</span>
            </p>

            <p className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-600">
              {area} system
            </p>
          </div>
        </Link>

        {/* Mobile / Tablet Close */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="flex size-9 shrink-0 items-center justify-center border border-neutral-800 text-neutral-500 transition-colors hover:border-[#FF3E00] hover:bg-[#171717] hover:text-white xl:hidden"
        >
          <Icon name="x" className="size-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav
        aria-label={`${area} dashboard`}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-6"
      >
        {groups.map((group) => (
          <div key={group.title} className="mb-7 last:mb-0">
            <p className="mb-2 px-4 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-700">
              {group.title}
            </p>

            <ul className="space-y-1">
              {group.items.map((label) => {
                const item = navigation.find(
                  (entry) => entry.label === label,
                );

                if (!item) return null;

                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={linkClass}
                    >
                      <Icon
                        name={item.icon}
                        className="size-[17px] shrink-0"
                      />

                      <span className="truncate">
                        {item.label}
                      </span>

                      <span className="ml-auto shrink-0 text-[10px] text-neutral-700 transition-colors group-hover:text-neutral-500">
                        →
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-[#2A2A2A] p-3">
        <Link
          to="/courses"
          onClick={onNavigate}
          className="group flex items-center gap-3 border border-transparent px-4 py-3 text-sm font-medium text-neutral-500 transition-colors hover:border-[#2A2A2A] hover:bg-[#141414] hover:text-white"
        >
          <Icon
            name="arrow-left"
            className="size-4 shrink-0 transition-transform group-hover:-translate-x-1"
          />

          <span>Back to platform</span>
        </Link>
      </div>
    </>
  );
}