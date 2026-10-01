import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import FilterDropdown from '../components/common/FilterDropdown.jsx';
import Icon from '../components/common/Icon.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Skeleton, {
  LoadingRegion,
} from '../components/common/Skeleton.jsx';
import SearchResultGroup from '../components/search/SearchResultGroup.jsx';

import {
  REQUEST_STATUS,
  useApiResource,
} from '../hooks/useApiResource.js';

import { searchGlobal } from '../services/searchService.js';

import {
  GROUP_LABELS,
  MIN_QUERY,
  SEARCH_TYPES,
  groupByKind,
  normalizeQuery,
} from '../utils/searchUtils.js';

const TYPE_OPTIONS =
  SEARCH_TYPES.map((value) => ({
    value,
    label: GROUP_LABELS[value],
  }));

const SORT_OPTIONS = [
  {
    value: 'title',
    label: 'Title',
  },
  {
    value: 'updated',
    label: 'Recently updated',
  },
];

const PAGE_SIZE = 20;

export default function SearchPage() {
  const [params, setParams] =
    useSearchParams();

  const q = normalizeQuery(
    params.get('q'),
  );

  const type = SEARCH_TYPES.includes(
    params.get('type'),
  )
    ? params.get('type')
    : '';

  const sort = [
    'title',
    'updated',
  ].includes(params.get('sort'))
    ? params.get('sort')
    : '';

  const page = Math.min(
    100,
    Math.max(
      1,
      Number.parseInt(
        params.get('page') ?? '1',
        10,
      ) || 1,
    ),
  );

  const fetcher = useCallback(
    (signal) =>
      q.length < MIN_QUERY
        ? Promise.resolve(null)
        : searchGlobal(
            {
              q,
              type,
              sort,
              page,
              limit: PAGE_SIZE,
            },
            signal,
          ),
    [q, type, sort, page],
  );

  const {
    status,
    data,
    reload,
  } = useApiResource(fetcher);

  const update = (
    patch,
    keepPage = false,
  ) =>
    setParams((previous) => {
      const next =
        new URLSearchParams(previous);

      for (const [
        key,
        value,
      ] of Object.entries(patch)) {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      }

      if (!keepPage) {
        next.delete('page');
      }

      return next;
    });

  const submit = (event) => {
    event.preventDefault();

    update({
      q: normalizeQuery(
        new FormData(
          event.currentTarget,
        ).get('q'),
      ),
    });
  };

  const renderBody = () => {
    if (
      status === REQUEST_STATUS.LOADING
    ) {
      return (
        <LoadingRegion
          label="Searching…"
          className="space-y-3"
        >
          <div className="border border-neutral-800 bg-[#111111] p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              Searching...
            </p>
          </div>

          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </LoadingRegion>
      );
    }

    if (
      status === REQUEST_STATUS.ERROR
    ) {
      return (
        <ErrorState
          title="Search failed"
          message="Unable to search right now."
          onRetry={reload}
        />
      );
    }

    if (!data) {
      return (
        <EmptyState
          title="Search"
          message="Start typing to search courses and learning content."
          icon="search"
        />
      );
    }

    if (data.items.length === 0) {
      return (
        <EmptyState
          title="No results"
          message={`No results found for “${q}”.`}
          icon="search"
        >
          {(type || sort) && (
            <button
              type="button"
              onClick={() =>
                update({
                  type: '',
                  sort: '',
                })
              }
              className="min-h-10 border border-neutral-700 bg-transparent px-4 text-sm font-semibold text-white transition-colors hover:border-[#FF3E00] hover:text-[#FF3E00] focus-visible:outline-2 focus-visible:outline-[#FF3E00]"
            >
              Clear filters
            </button>
          )}
        </EmptyState>
      );
    }

    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <p
            role="status"
            className="font-mono text-[10px] uppercase tracking-wider text-neutral-500"
          >
            {data.pagination.total}{' '}
            result
            {data.pagination.total ===
            1
              ? ''
              : 's'}{' '}
            for "
            <span className="text-white">
              {q}
            </span>
            "
          </p>
        </div>

        <div className="mt-6 space-y-8">
          {groupByKind(
            data.items,
          ).map((group) => (
            <SearchResultGroup
              key={group.type}
              label={group.label}
              items={group.items}
            />
          ))}
        </div>

        <div className="mt-8">
          <Pagination
            page={data.pagination.page}
            totalPages={
              data.pagination.totalPages
            }
            onPageChange={(nextPage) =>
              update(
                {
                  page:
                    nextPage > 1
                      ? String(
                          nextPage,
                        )
                      : '',
                },
                true,
              )
            }
          />
        </div>
      </>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* HEADER */}
      <header className="border-b border-neutral-800 pb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[#FF3E00]" />

          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-600">
            Global search
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Search
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Find courses, modules,
          topics, concepts and
          learning content.
        </p>
      </header>

      {/* FILTERS */}
      <div className="border border-neutral-800 bg-[#111111] p-3 sm:p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <form
            key={q}
            role="search"
            onSubmit={submit}
          >
            <label
              htmlFor="search-page-input"
              className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500"
            >
              Search courses and content
            </label>

            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-600"
              />

              <input
                id="search-page-input"
                name="q"
                type="search"
                defaultValue={q}
                maxLength={100}
                placeholder='Try "html" or "react"'
                className="block min-h-11 w-full rounded-sm border border-neutral-800 bg-[#0A0A0A] py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 transition-colors focus:border-[#FF3E00] focus:outline-none focus:ring-1 focus:ring-[#FF3E00]"
              />
            </div>
          </form>

          <FilterDropdown
            id="search-type"
            label="Type"
            value={type}
            options={TYPE_OPTIONS}
            onChange={(value) =>
              update({
                type: value,
              })
            }
            allLabel="All types"
          />

          <FilterDropdown
            id="search-sort"
            label="Sort"
            value={sort}
            options={SORT_OPTIONS}
            onChange={(value) =>
              update({
                sort: value,
              })
            }
            allLabel="Relevance"
          />
        </div>
      </div>

      {renderBody()}
    </div>
  );
}