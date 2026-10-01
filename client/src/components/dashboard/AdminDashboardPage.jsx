import { Link } from "react-router";

import ApiErrorState from "../../components/common/ApiErrorState.jsx";
import Skeleton, {
  LoadingRegion,
} from "../../components/common/Skeleton.jsx";

import {
  PageHeader,
  Panel,
  StatCard,
} from "./DashboardUi.jsx";

import { REQUEST_STATUS, useApiResource } from "../../hooks/useApiResource.js";
import { getAdminStats } from "../../services/adminService.js";
import { dashboardPaths } from "../../utils/dashboardPaths.js";
import {
  primaryButton,
  secondaryButton,
} from "../../components/common/buttonClasses.js";

const paths = dashboardPaths("admin");

const statItems = [
  {
    key: "courses",
    label: "Total courses",
    icon: "book",
    getValue: (data) => data.courses.total,
    to: paths.courses,
  },
  {
    key: "published",
    label: "Published",
    icon: "check",
    getValue: (data) => data.courses.published,
    to: `${paths.courses}?status=published`,
  },
  {
    key: "draft",
    label: "Draft",
    icon: "edit",
    getValue: (data) => data.courses.draft,
    to: `${paths.courses}?status=draft`,
  },
  {
    key: "users",
    label: "Total users",
    icon: "users",
    getValue: (data) => data.users.total,
    to: paths.users,
  },
  {
    key: "mentors",
    label: "Mentors",
    icon: "user",
    getValue: (data) => data.users.mentors,
    to: `${paths.users}?role=mentor`,
  },
];

export default function AdminDashboardPage() {
  const {
    status,
    data,
    error,
    reload,
  } = useApiResource(getAdminStats);

  return (
    <div className="animate-page-in">
      <PageHeader
        title="Command Center"
        description="Monitor the LMS platform, courses and users from one place."
        actions={
          <Link
            to={paths.newCourse}
            className={primaryButton}
          >
            + New course
          </Link>
        }
      />

      {status === REQUEST_STATUS.LOADING && (
        <LoadingRegion
          label="Loading dashboard statistics..."
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-32 w-full"
            />
          ))}
        </LoadingRegion>
      )}

      {status === REQUEST_STATUS.ERROR && (
        <ApiErrorState
          error={error}
          subject="dashboard statistics"
          onRetry={reload}
        />
      )}

      {status === REQUEST_STATUS.SUCCESS && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {statItems.map((item) => (
              <StatCard
                key={item.key}
                label={item.label}
                value={item.getValue(data)}
                icon={item.icon}
                to={item.to}
              />
            ))}
          </div>

          {/* Quick actions */}
          <Panel
            title="Quick Actions"
            description="Common administrative operations."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to={paths.newCourse}
                className="group border border-[#2A2A2A] bg-[#171717] p-5 transition-all hover:border-[#FF3E00]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-neutral-500">
                    Create
                  </span>

                  <span className="text-[#FF3E00] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <h3 className="mt-6 font-display text-lg font-semibold text-white">
                  New Course
                </h3>

                <p className="mt-1 text-xs text-neutral-600">
                  Create and publish a new learning course.
                </p>
              </Link>

              <Link
                to={paths.courses}
                className="group border border-[#2A2A2A] bg-[#171717] p-5 transition-all hover:border-[#FF3E00]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-neutral-500">
                    Manage
                  </span>

                  <span className="text-[#FF3E00] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <h3 className="mt-6 font-display text-lg font-semibold text-white">
                  Course Library
                </h3>

                <p className="mt-1 text-xs text-neutral-600">
                  Search, filter and manage all courses.
                </p>
              </Link>

              <Link
                to={paths.users}
                className="group border border-[#2A2A2A] bg-[#171717] p-5 transition-all hover:border-[#FF3E00]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-neutral-500">
                    Manage
                  </span>

                  <span className="text-[#FF3E00] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <h3 className="mt-6 font-display text-lg font-semibold text-white">
                  User Management
                </h3>

                <p className="mt-1 text-xs text-neutral-600">
                  Manage students, mentors and access.
                </p>
              </Link>
            </div>
          </Panel>

          {/* System status */}
          <Panel
            title="System Overview"
            description="Current platform data."
          >
            <div className="grid gap-px overflow-hidden border border-[#2A2A2A] bg-[#2A2A2A] sm:grid-cols-3">
              <OverviewItem
                label="Courses"
                value={data.courses.total}
              />

              <OverviewItem
                label="Users"
                value={data.users.total}
              />

              <OverviewItem
                label="Mentors"
                value={data.users.mentors}
              />
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

function OverviewItem({ label, value }) {
  return (
    <div className="bg-[#111111] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
        {label}
      </p>

      <p className="mt-2 font-display text-2xl font-bold text-white">
        {value}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span className="size-1.5 bg-[#22C55E]" />
        <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
          Connected
        </span>
      </div>
    </div>
  );
}