import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import Icon from '../../components/common/Icon.jsx';
import { LoadingRegion } from '../../components/common/Skeleton.jsx';
import CourseCard from '../../components/courses/CourseCard.jsx';

import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useCourses } from '../../hooks/useCourses.js';
import { useAuth } from '../../hooks/useAuth.js';

import { getEnrollmentStatuses } from '../../services/courseService.js';

import { ROUTES } from '../../utils/paths.js';
import { hasRole, ROLES } from '../../utils/roles.js';

const MAX_SEARCH_LENGTH = 100;
const MAX_PAGE = 10000;

const parsePage = (value) => {
  const page = Number.parseInt(value ?? '', 10);

  return Number.isInteger(page) && page >= 1 && page <= MAX_PAGE
    ? page
    : 1;
};

/* -------------------------------------------------------------------------- */
/* Section Label                                                              */
/* -------------------------------------------------------------------------- */

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-[#FF3E00]" />

      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF3E00]">
        {children}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function CourseSkeleton() {
  return (
    <article className="overflow-hidden border border-[#2A2A2A] bg-[#111111]">
      <div className="aspect-video animate-pulse bg-[#171717]" />

      <div className="space-y-4 p-5 sm:p-6">
        <div className="h-3 w-24 animate-pulse bg-[#242424]" />

        <div className="h-6 w-3/4 animate-pulse bg-[#242424]" />

        <div className="h-4 w-full animate-pulse bg-[#242424]" />

        <div className="h-4 w-5/6 animate-pulse bg-[#242424]" />

        <div className="mt-6 h-10 w-full animate-pulse bg-[#242424]" />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({ search, clearSearch }) {
  return (
    <div className="border border-[#2A2A2A] bg-[#111111] px-5 py-16 text-center sm:px-8 sm:py-20">
      <div className="mx-auto flex size-14 items-center justify-center border border-[#2A2A2A] bg-[#0D0D0D]">
        <Icon
          name="search"
          className="size-5 text-[#555555]"
        />
      </div>

      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {search ? 'No courses found' : 'No courses available'}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#666666]">
        {search
          ? `Nothing matches "${search}". Try another search term.`
          : 'Courses will appear here when they become available.'}
      </p>

      {search && (
        <button
          type="button"
          onClick={clearSearch}
          className="
            mt-6
            border border-[#3A3A3A]
            px-5 py-3
            font-mono text-[10px] font-semibold
            uppercase tracking-[0.15em]
            text-white
            transition-all duration-200
            hover:border-[#FF3E00]
            hover:text-[#FF3E00]
          "
        >
          Clear Search
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className="
        mt-10 flex flex-col gap-4
        border-t border-[#2A2A2A]
        pt-6
        sm:flex-row sm:items-center sm:justify-between
      "
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="
          inline-flex items-center justify-center gap-2
          border border-[#2A2A2A]
          px-4 py-3
          font-mono text-[10px]
          uppercase tracking-[0.15em]
          text-[#777777]
          transition-all duration-200
          hover:border-[#555555]
          hover:text-white
          disabled:cursor-not-allowed
          disabled:opacity-30
        "
      >
        <Icon name="arrow-left" className="size-4" />
        Previous
      </button>

      <div className="order-first text-center sm:order-none">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#555555]">
          Page {page} / {totalPages}
        </span>
      </div>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="
          inline-flex items-center justify-center gap-2
          border border-[#2A2A2A]
          px-4 py-3
          font-mono text-[10px]
          uppercase tracking-[0.15em]
          text-[#777777]
          transition-all duration-200
          hover:border-[#555555]
          hover:text-white
          disabled:cursor-not-allowed
          disabled:opacity-30
        "
      >
        Next
        <Icon name="arrow-right" className="size-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parsePage(searchParams.get('page'));

  const search = (searchParams.get('search') ?? '')
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);

  const {
    status,
    data,
    error,
    reload,
  } = useCourses({
    page,
    search,
  });

  const { user } = useAuth();

  const isStudent = hasRole(user, [ROLES.STUDENT]);

  const [enrollmentMap, setEnrollmentMap] = useState({});

  /* ---------------------------------------------------------------------- */
  /* Enrollment Status                                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (
      !isStudent ||
      status !== REQUEST_STATUS.SUCCESS ||
      !data?.items?.length
    ) {
      return;
    }

    const ids = data.items.map((course) => course.id);

    getEnrollmentStatuses(ids)
      .then((result) => {
        setEnrollmentMap(result || {});
      })
      .catch(() => {
        setEnrollmentMap({});
      });
  }, [isStudent, status, data]);

  /* ---------------------------------------------------------------------- */
  /* Navigation                                                              */
  /* ---------------------------------------------------------------------- */

  const goTo = (nextPage, nextSearch = search) => {
    const next = new URLSearchParams();

    if (nextSearch) {
      next.set('search', nextSearch);
    }

    if (nextPage > 1) {
      next.set('page', String(nextPage));
    }

    setSearchParams(next);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const value = String(
      formData.get('search') ?? '',
    ).trim();

    goTo(1, value);
  };

  const clearSearch = () => {
    goTo(1, '');
  };

  const courses = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">

      {/* ================================================================== */}
      {/* HERO                                                               */}
      {/* ================================================================== */}

      <section className="border-b border-[#242424]">
        <div className="lms-container py-12 sm:py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">

            <div>
              <SectionLabel>
                Learning Library
              </SectionLabel>

              <h1
                className="
                  mt-5
                  max-w-4xl
                  text-4xl font-semibold
                  leading-[0.95]
                  tracking-[-0.05em]
                  sm:text-6xl
                  lg:text-7xl
                "
              >
                CHOOSE WHAT
                <br />
                <span className="text-[#555555]">
                  TO BUILD NEXT.
                </span>
              </h1>

              <p
                className="
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-7
                  text-[#777777]
                  sm:mt-6
                  sm:text-base
                "
              >
                Explore structured courses designed to take you
                from fundamentals to practical implementation.
              </p>
            </div>

            <div
              className="
                flex items-center gap-3
                font-mono text-[10px]
                uppercase tracking-[0.15em]
                text-[#555555]
              "
            >
              <span className="size-1.5 bg-[#FF3E00]" />

              {status === REQUEST_STATUS.SUCCESS
                ? `${pagination?.total ?? 0} courses`
                : 'Loading library'}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEARCH                                                              */}
      {/* ================================================================== */}

      <section className="border-b border-[#242424] bg-[#0D0D0D]">
        <div className="lms-container py-4 sm:py-5">
          <form
            key={search}
            onSubmit={handleSearch}
            role="search"
            className="
              flex flex-col gap-2.5
              sm:flex-row
            "
          >
            <div className="relative min-w-0 flex-1">
              <Icon
                name="search"
                className="
                  pointer-events-none
                  absolute left-4 top-1/2
                  size-4
                  -translate-y-1/2
                  text-[#555555]
                "
              />

              <label
                htmlFor="course-search"
                className="sr-only"
              >
                Search courses
              </label>

              <input
                id="course-search"
                name="search"
                type="search"
                defaultValue={search}
                maxLength={MAX_SEARCH_LENGTH}
                placeholder="Search courses..."
                className="
                  h-12 w-full
                  border border-[#292929]
                  bg-[#111111]
                  pl-11 pr-4
                  font-mono text-xs
                  text-white
                  outline-none
                  transition-colors
                  placeholder:text-[#444444]
                  focus:border-[#FF3E00]
                "
              />
            </div>

            <button
              type="submit"
              className="
                h-12
                bg-[#FF3E00]
                px-6
                font-mono text-[10px]
                font-bold uppercase
                tracking-[0.15em]
                text-white
                transition-colors
                hover:bg-[#FF5420]
                sm:px-8
              "
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CONTENT                                                             */}
      {/* ================================================================== */}

      <section className="lms-container py-10 sm:py-14 lg:py-16">

        {/* Loading */}
        {status === REQUEST_STATUS.LOADING && (
          <LoadingRegion
            label="Loading courses..."
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              xl:grid-cols-3
              2xl:grid-cols-4
            "
          >
            {Array.from({ length: 8 }, (_, index) => (
              <CourseSkeleton key={index} />
            ))}
          </LoadingRegion>
        )}

        {/* Error */}
        {status === REQUEST_STATUS.ERROR && (
          <ApiErrorState
            error={error}
            subject="courses"
            onRetry={reload}
          />
        )}

        {/* Empty */}
        {status === REQUEST_STATUS.SUCCESS &&
          courses.length === 0 && (
            <EmptyState
              search={search}
              clearSearch={clearSearch}
            />
          )}

        {/* Courses */}
        {status === REQUEST_STATUS.SUCCESS &&
          courses.length > 0 && (
            <>
              {/* Results header */}
              <div
                className="
                  mb-6
                  flex flex-col gap-2
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div
                  className="
                    min-w-0
                    truncate
                    font-mono text-[10px]
                    uppercase tracking-[0.15em]
                    text-[#555555]
                  "
                >
                  {search
                    ? `Results for "${search}"`
                    : 'All available courses'}
                </div>

                <div
                  className="
                    font-mono text-[10px]
                    uppercase tracking-[0.15em]
                    text-[#444444]
                  "
                >
                  {courses.length} shown
                </div>
              </div>

              {/* Responsive Grid */}
              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  xl:grid-cols-3
                  2xl:grid-cols-4
                "
              >
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    enrollmentStatus={
                      enrollmentMap[course.id]
                    }
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && (
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onChange={(nextPage) =>
                    goTo(nextPage)
                  }
                />
              )}
            </>
          )}
      </section>

      {/* ================================================================== */}
      {/* BOTTOM CTA                                                         */}
      {/* ================================================================== */}

      <section className="border-t border-[#242424] bg-[#0D0D0D]">
        <div className="lms-container py-16 sm:py-20">
          <div
            className="
              flex flex-col
              justify-between
              gap-8
              sm:flex-row
              sm:items-end
            "
          >
            <div>
              <SectionLabel>
                Keep Building
              </SectionLabel>

              <h2
                className="
                  mt-4
                  max-w-2xl
                  text-3xl font-semibold
                  tracking-tight
                  sm:text-5xl
                "
              >
                One course can become
                <br />
                <span className="text-[#555555]">
                  your next project.
                </span>
              </h2>
            </div>

            <Link
              to={ROUTES.home || '/'}
              className="
                inline-flex
                items-center gap-2
                font-mono text-[10px]
                font-semibold uppercase
                tracking-[0.15em]
                text-[#777777]
                transition-colors
                hover:text-[#FF3E00]
              "
            >
              Back home
              <Icon
                name="arrow-right"
                className="size-4"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}