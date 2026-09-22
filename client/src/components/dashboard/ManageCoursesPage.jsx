import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { primaryButton, secondaryButton } from '../../components/common/buttonClasses.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import FilterDropdown from '../../components/common/FilterDropdown.jsx';
import Icon from '../../components/common/Icon.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import CourseActionDialog from '../../components/dashboard/courses/CourseActionDialog.jsx';
import CourseTable from '../../components/dashboard/courses/CourseTable.jsx';
import { PageHeader } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useRefreshableResource } from '../../hooks/useRefreshableResource.js';
import { getCourses } from '../../services/courseService.js';
import { dashboardPaths } from '../../utils/dashboardPaths.js';
import { CONTENT_STATUS_OPTIONS, LEVEL_OPTIONS } from '../../utils/enums.js';
import { pluralize } from '../../utils/formatters.js';
import { parseCourseListParams } from '../../utils/listParams.js';

const PAGE_SIZE = 10;

// Used for /admin/courses and /mentor/courses. Filtering, searching and paging all happen on the server
// (GET /api/courses), which also decides which courses this user may see at all.
export default function ManageCoursesPage({ area }) {
  const isAdmin = area === 'admin';
  const paths = dashboardPaths(area);
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, search, category, level, status: courseStatus } = useMemo(
    () => parseCourseListParams(searchParams),
    [searchParams],
  );
  const [resetKey, setResetKey] = useState(0);
  const [action, setAction] = useState(null);

  const fetcher = useCallback(
    (signal) => getCourses({ page, limit: PAGE_SIZE, search, category, level, status: courseStatus }, signal),
    [page, search, category, level, courseStatus],
  );
  const { status, data, error, isRefreshing, refresh, reload } = useRefreshableResource(fetcher);

  const updateParams = (patch, { keepPage = false } = {}) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      if (!keepPage) next.delete('page');
      return next;
    });
  };

  const hasFilters = Boolean(search || category || level || courseStatus);
  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setResetKey((current) => current + 1); // remounts the search boxes so they empty
  };

  const renderResults = () => {
    if (status === REQUEST_STATUS.LOADING) {
      return (
        <LoadingRegion label="Loading courses…" className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </LoadingRegion>
      );
    }
    if (status === REQUEST_STATUS.ERROR) {
      return <ApiErrorState error={error} subject="courses" onRetry={reload} />;
    }

    const { items, pagination } = data;

    if (items.length === 0 && pagination.total > 0) {
      return (
        <EmptyState title="This page is empty" message="There are no courses on this page.">
          <button type="button" onClick={() => updateParams({ page: '' })} className={primaryButton}>
            Go to the first page
          </button>
        </EmptyState>
      );
    }
    if (items.length === 0) {
      return hasFilters ? (
        <EmptyState title="No courses found" message="No courses match your filters.">
          <button type="button" onClick={clearFilters} className={secondaryButton}>
            Clear filters
          </button>
        </EmptyState>
            ) : (
        <EmptyState title="No courses yet" message={isAdmin ? 'No courses are available yet.' : 'You have not been assigned to any courses yet.'}>
          {isAdmin && (
            <Link to={paths.newCourse} className={primaryButton}>
              <Icon name="plus" className="size-4" />
              New course
            </Link>
          )}
        </EmptyState>
      );
    }

    return (
      <>
        <CourseTable courses={items} area={area} onAction={setAction} />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(next) => updateParams({ page: next > 1 ? String(next) : '' }, { keepPage: true })} />
      </>
    );
  };

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Courses' : 'My Courses'}
        description={
          status === REQUEST_STATUS.SUCCESS
            ? `${pluralize(data.pagination.total, 'course')}${isRefreshing ? ' · Refreshing…' : ''}`
            : undefined
        }
        actions={
          isAdmin && (
            <Link to={paths.newCourse} className={primaryButton}>
              <Icon name="plus" className="size-4" />
              New course
            </Link>
          )
        }
      />

      <div key={resetKey} className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SearchInput
          id="course-search"
          label="Search"
          defaultValue={search}
          placeholder="Title or description"
          onSearch={(value) => updateParams({ search: value })}
        />
        <TextFilter label="Category" defaultValue={category} placeholder="web-development" onApply={(value) => updateParams({ category: value })} />
        <FilterDropdown id="level-filter" label="Level" value={level} options={LEVEL_OPTIONS} onChange={(value) => updateParams({ level: value })} />
        <FilterDropdown id="status-filter" label="Status" value={courseStatus} options={CONTENT_STATUS_OPTIONS} onChange={(value) => updateParams({ status: value })} />
      </div>

      {hasFilters && (
        <button type="button" onClick={clearFilters} className="mb-4 text-sm font-medium text-indigo-700 underline">
          Clear all filters
        </button>
      )}

      {renderResults()}

      {action && (
        <CourseActionDialog
          action={action.type}
          course={action.course}
          onClose={() => setAction(null)}
          onDone={refresh}
        />
      )}
    </>
  );
}

// A tiny text filter reusing SearchInput's debounce pattern, for the category field (free text, not an enum).
function TextFilter({ label, defaultValue, placeholder, onApply }) {
  return (
    <SearchInput
      id="category-filter"
      label={label}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onSearch={onApply}
    />
  );
}