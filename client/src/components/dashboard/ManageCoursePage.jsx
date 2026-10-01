import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

import ApiErrorState from "../../components/common/ApiErrorState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import FilterDropdown from "../../components/common/FilterDropdown.jsx";
import Icon from "../../components/common/Icon.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import SearchInput from "../../components/common/SearchInput.jsx";
import Skeleton, {
  LoadingRegion,
} from "../../components/common/Skeleton.jsx";

import CourseActionDialog from "./courses/CourseActionDialog.jsx";
import CourseTable from "./courses/CourseTable.jsx";

import {
  PageHeader,
  Panel,
} from "./DashboardUi.jsx";

import {
  REQUEST_STATUS,
} from "../../hooks/useApiResource.js";

import {
  useRefreshableResource,
} from "../../hooks/useRefreshableResource.js";

import { getCourses } from "../../services/courseService.js";
import { dashboardPaths } from "../../utils/dashboardPaths.js";

import {
  CONTENT_STATUS_OPTIONS,
  LEVEL_OPTIONS,
} from "../../utils/enums.js";

import { pluralize } from "../../utils/formatters.js";
import { parseCourseListParams } from "../../utils/listParams.js";

import {
  primaryButton,
  secondaryButton,
} from "../../components/common/buttonClasses.js";

const PAGE_SIZE = 10;

export default function ManageCoursesPage({
  area,
}) {
  const isAdmin = area === "admin";
  const paths = dashboardPaths(area);

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const {
    page,
    search,
    category,
    level,
    status: courseStatus,
  } = useMemo(
    () =>
      parseCourseListParams(searchParams),
    [searchParams],
  );

  const [resetKey, setResetKey] = useState(0);
  const [action, setAction] = useState(null);

  const fetcher = useCallback(
    (signal) =>
      getCourses(
        {
          page,
          limit: PAGE_SIZE,
          search,
          category,
          level,
          status: courseStatus,
        },
        signal,
      ),
    [
      page,
      search,
      category,
      level,
      courseStatus,
    ],
  );

  const {
    status,
    data,
    error,
    isRefreshing,
    refresh,
    reload,
  } = useRefreshableResource(fetcher);

  const updateParams = (
    patch,
    { keepPage = false } = {},
  ) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(
        previous,
      );

      Object.entries(patch).forEach(
        ([key, value]) => {
          if (
            value !== "" &&
            value !== undefined &&
            value !== null
          ) {
            next.set(key, String(value));
          } else {
            next.delete(key);
          }
        },
      );

      if (!keepPage) {
        next.delete("page");
      }

      return next;
    });
  };

  const hasFilters = Boolean(
    search ||
      category ||
      level ||
      courseStatus,
  );

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setResetKey((value) => value + 1);
  };

  return (
    <div className="animate-page-in">
      <PageHeader
        title={isAdmin ? "Course Library" : "My Courses"}
        description={
          status === REQUEST_STATUS.SUCCESS
            ? `${pluralize(
                data.pagination.total,
                "course",
              )}${isRefreshing ? " · Refreshing..." : ""}`
            : "Search, filter and manage learning content."
        }
        actions={
          isAdmin && (
            <Link
              to={paths.newCourse}
              className={primaryButton}
            >
              <Icon
                name="plus"
                className="size-4"
              />
              New course
            </Link>
          )
        }
      />

      <Panel
        title="Course Directory"
        description="Server-side search and filtering."
        className="mb-5"
      >
        <div
          key={resetKey}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <SearchInput
            id="course-search"
            label="Search"
            defaultValue={search}
            placeholder="Search courses..."
            onSearch={(value) =>
              updateParams({
                search: value,
              })
            }
          />

          <SearchInput
            id="category-filter"
            label="Category"
            defaultValue={category}
            placeholder="web-development"
            onSearch={(value) =>
              updateParams({
                category: value,
              })
            }
          />

          <FilterDropdown
            id="level-filter"
            label="Level"
            value={level}
            options={LEVEL_OPTIONS}
            onChange={(value) =>
              updateParams({
                level: value,
              })
            }
          />

          <FilterDropdown
            id="status-filter"
            label="Status"
            value={courseStatus}
            options={CONTENT_STATUS_OPTIONS}
            onChange={(value) =>
              updateParams({
                status: value,
              })
            }
          />
        </div>

        {hasFilters && (
          <div className="mt-5 flex items-center justify-between border-t border-[#2A2A2A] pt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-700">
              Filters active
            </span>

            <button
              type="button"
              onClick={clearFilters}
              className={secondaryButton}
            >
              Clear filters
            </button>
          </div>
        )}
      </Panel>

      {status === REQUEST_STATUS.LOADING && (
        <LoadingRegion
          label="Loading courses..."
          className="space-y-2"
        >
          {Array.from(
            { length: 5 },
            (_, index) => (
              <Skeleton
                key={index}
                className="h-20 w-full"
              />
            ),
          )}
        </LoadingRegion>
      )}

      {status === REQUEST_STATUS.ERROR && (
        <ApiErrorState
          error={error}
          subject="courses"
          onRetry={reload}
        />
      )}

      {status === REQUEST_STATUS.SUCCESS && (
        <>
          {data.items.length === 0 ? (
            <EmptyState
              title={
                hasFilters
                  ? "No matching courses"
                  : "No courses yet"
              }
              message={
                hasFilters
                  ? "Try changing your search or filters."
                  : isAdmin
                    ? "Create your first course to get started."
                    : "You have not been assigned any courses yet."
              }
            >
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={secondaryButton}
                >
                  Clear filters
                </button>
              ) : (
                isAdmin && (
                  <Link
                    to={paths.newCourse}
                    className={primaryButton}
                  >
                    <Icon
                      name="plus"
                      className="size-4"
                    />
                    New course
                  </Link>
                )
              )}
            </EmptyState>
          ) : (
            <>
              <CourseTable
                courses={data.items}
                area={area}
                onAction={setAction}
              />

              <div className="mt-5">
                <Pagination
                  page={data.pagination.page}
                  totalPages={
                    data.pagination.totalPages
                  }
                  onPageChange={(next) =>
                    updateParams(
                      {
                        page:
                          next > 1
                            ? String(next)
                            : "",
                      },
                      {
                        keepPage: true,
                      },
                    )
                  }
                />
              </div>
            </>
          )}
        </>
      )}

      {action && (
        <CourseActionDialog
          action={action.type}
          course={action.course}
          onClose={() =>
            setAction(null)
          }
          onDone={() => {
            setAction(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}