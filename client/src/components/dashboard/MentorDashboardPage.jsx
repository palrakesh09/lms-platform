import { Link } from "react-router";

import ApiErrorState from "../../components/common/ApiErrorState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Skeleton, {
  LoadingRegion,
} from "../../components/common/Skeleton.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

import {
  PageHeader,
  Panel,
  StatCard,
} from "./DashboardUi.jsx";

import {
  REQUEST_STATUS,
  useApiResource,
} from "../../hooks/useApiResource.js";

import { getCourses } from "../../services/courseService.js";
import { dashboardPaths } from "../../utils/dashboardPaths.js";

import { linkButton } from "../../components/common/buttonClasses.js";

const paths = dashboardPaths("mentor");

const RECENT_COUNT = 5;

const fetchAssignedCourses = (signal) =>
  getCourses(
    {
      limit: RECENT_COUNT,
    },
    signal,
  );

export default function MentorDashboardPage() {
  const {
    status,
    data,
    error,
    reload,
  } = useApiResource(fetchAssignedCourses);

  return (
    <div className="animate-page-in">
      <PageHeader
        title="Mentor Workspace"
        description="Manage the courses assigned to you and keep your learning content moving."
        actions={
          <Link
            to={paths.courses}
            className={linkButton}
          >
            View all courses →
          </Link>
        }
      />

      {status === REQUEST_STATUS.LOADING && (
        <LoadingRegion
          label="Loading assigned courses..."
          className="space-y-5"
        >
          <Skeleton className="h-32 w-full sm:w-64" />
          <Skeleton className="h-64 w-full" />
        </LoadingRegion>
      )}

      {status === REQUEST_STATUS.ERROR && (
        <ApiErrorState
          error={error}
          subject="assigned courses"
          onRetry={reload}
        />
      )}

      {status === REQUEST_STATUS.SUCCESS &&
        (data.pagination.total === 0 ? (
          <EmptyState
            title="No assigned courses"
            message="You don't currently have any courses assigned to your account."
          />
        ) : (
          <div className="space-y-6">
            {/* Main stat */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Assigned Courses"
                value={data.pagination.total}
                icon="book"
                to={paths.courses}
              />
            </div>

            {/* Course list */}
            <Panel
              title="Your Courses"
              description="Recently assigned courses available to you."
              actions={
                <Link
                  to={paths.courses}
                  className={linkButton}
                >
                  View all →
                </Link>
              }
            >
              <div className="divide-y divide-[#2A2A2A]">
                {data.items.map((course, index) => (
                  <div
                    key={course.id}
                    className="group flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex size-9 shrink-0 items-center justify-center border border-[#2A2A2A] font-mono text-[10px] text-neutral-600">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-display text-sm font-semibold text-white">
                            {course.title}
                          </h3>

                          <StatusBadge status={course.status} />
                        </div>

                        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                          COURSE / CONTENT
                        </p>
                      </div>
                    </div>

                    <Link
                      to={paths.course(course.id)}
                      className={`${linkButton} shrink-0`}
                    >
                      Manage content →
                    </Link>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Workflow */}
            <Panel
              title="Mentor Workflow"
              description="Recommended content management flow."
            >
              <div className="grid gap-px overflow-hidden border border-[#2A2A2A] bg-[#2A2A2A] md:grid-cols-3">
                <WorkflowStep
                  number="01"
                  title="Select Course"
                  text="Open one of your assigned courses."
                />

                <WorkflowStep
                  number="02"
                  title="Build Content"
                  text="Manage modules, topics and resources."
                />

                <WorkflowStep
                  number="03"
                  title="Publish"
                  text="Keep course content accurate and updated."
                />
              </div>
            </Panel>
          </div>
        ))}
    </div>
  );
}

function WorkflowStep({ number, title, text }) {
  return (
    <div className="bg-[#111111] p-5">
      <span className="font-mono text-[10px] tracking-[0.18em] text-[#FF3E00]">
        {number}
      </span>

      <h3 className="mt-5 font-display text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-neutral-600">
        {text}
      </p>
    </div>
  );
}