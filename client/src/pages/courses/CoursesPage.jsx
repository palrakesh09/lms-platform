import { useSearchParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { primaryButton, secondaryButton } from '../../components/common/buttonClasses.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import Icon from '../../components/common/Icon.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { LoadingRegion } from '../../components/common/Skeleton.jsx';
import CourseCard from '../../components/courses/CourseCard.jsx';
import CourseCardSkeleton from '../../components/courses/CourseCardSkeleton.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useCourses } from '../../hooks/useCourses.js';
import { pluralize } from '../../utils/formatters.js';

const MAX_SEARCH_LENGTH = 100;
const MAX_PAGE = 10000;

const parsePage = (value) => {
  const page = Number.parseInt(value ?? '', 10);
  return Number.isInteger(page) && page >= 1 && page <= MAX_PAGE ? page : 1;
};

// The page number and search text live in the URL, so a filtered list can be bookmarked and back/forward work.
export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const search = (searchParams.get('search') ?? '').trim().slice(0, MAX_SEARCH_LENGTH);

  const { status, data, error, reload } = useCourses({ page, search });

  const goTo = (nextPage, nextSearch = search) => {
    const next = new URLSearchParams();
    if (nextSearch) next.set('search', nextSearch);
    if (nextPage > 1) next.set('page', String(nextPage));
    setSearchParams(next);
    window.scrollTo({ top: 0 });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    goTo(1, String(new FormData(event.currentTarget).get('search') ?? '').trim());
  };

  const renderResults = () => {
    if (status === REQUEST_STATUS.LOADING) {
      return (
        <LoadingRegion label="Loading courses…" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </LoadingRegion>
      );
    }

    if (status === REQUEST_STATUS.ERROR) {
      return <ApiErrorState error={error} subject="courses" onRetry={reload} />;
    }

    const { items, pagination } = data;

    if (items.length === 0) {
      if (pagination.total > 0) {
        return (
          <EmptyState title="This page is empty" message="There are no courses on this page.">
            <button type="button" onClick={() => goTo(1)} className={primaryButton}>
              Go to the first page
            </button>
          </EmptyState>
        );
      }
      if (search) {
        return (
          <EmptyState title="No matching courses" message={`No courses match "${search}".`}>
            <button type="button" onClick={() => goTo(1, '')} className={secondaryButton}>
              Clear search
            </button>
          </EmptyState>
        );
      }
      return <EmptyState title="No courses yet" message="No courses are available yet." />;
    }

    return (
      <>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((course) => (
            <li key={course.id}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={goTo} />
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="mt-1 text-sm text-slate-600">
            {status === REQUEST_STATUS.SUCCESS
              ? pluralize(data.pagination.total, 'course')
              : 'Pick a course to start learning.'}
          </p>
        </div>

        <form key={search} role="search" onSubmit={handleSearch} className="flex w-full gap-2 sm:w-auto">
          <label htmlFor="course-search" className="sr-only">
            Search courses
          </label>
          <input
            id="course-search"
            name="search"
            type="search"
            defaultValue={search}
            maxLength={MAX_SEARCH_LENGTH}
            placeholder="Search courses"
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 sm:w-64"
          />
          <button type="submit" className={secondaryButton}>
            <Icon name="search" className="size-4" />
            Search
          </button>
        </form>
      </div>

      {renderResults()}
    </div>
  );
}