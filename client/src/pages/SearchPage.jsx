import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import FilterDropdown from '../components/common/FilterDropdown.jsx';
import Icon from '../components/common/Icon.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Skeleton, { LoadingRegion } from '../components/common/Skeleton.jsx';
import { secondaryButton } from '../components/common/buttonClasses.js';
import SearchResultGroup from '../components/search/SearchResultGroup.jsx';
import { REQUEST_STATUS, useApiResource } from '../hooks/useApiResource.js';
import { searchGlobal } from '../services/searchService.js';
import { GROUP_LABELS, MIN_QUERY, SEARCH_TYPES, groupByKind, normalizeQuery } from '../utils/searchUtils.js';

const TYPE_OPTIONS = SEARCH_TYPES.map((value) => ({ value, label: GROUP_LABELS[value] }));
const SORT_OPTIONS = [{ value: 'title', label: 'Title' }, { value: 'updated', label: 'Recently updated' }];
const PAGE_SIZE = 20;

// All state lives in the URL (?q, type, sort, page): back/forward, refresh and sharing just work.
// URL values are re-validated here; the API validates them again.
export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = normalizeQuery(params.get('q'));
  const type = SEARCH_TYPES.includes(params.get('type')) ? params.get('type') : '';
  const sort = ['title', 'updated'].includes(params.get('sort')) ? params.get('sort') : '';
  const page = Math.min(100, Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1));

  // Too-short queries never hit the API: the fetcher resolves to null (the "start typing" state).
  const fetcher = useCallback(
    (signal) => (q.length < MIN_QUERY ? Promise.resolve(null) : searchGlobal({ q, type, sort, page, limit: PAGE_SIZE }, signal)),
    [q, type, sort, page],
  );
  const { status, data, reload } = useApiResource(fetcher);

  const update = (patch, keepPage = false) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) (value ? next.set(key, value) : next.delete(key));
      if (!keepPage) next.delete('page');
      return next;
    });

  const submit = (event) => {
    event.preventDefault();
    update({ q: normalizeQuery(new FormData(event.currentTarget).get('q')) });
  };

  const renderBody = () => {
    if (status === REQUEST_STATUS.LOADING) {
      return (
        <LoadingRegion label="Searching…" className="space-y-2">
          <p className="text-sm text-slate-600">Searching…</p>
          <Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" />
        </LoadingRegion>
      );
    }
    if (status === REQUEST_STATUS.ERROR) return <ErrorState title="Search failed" message="Unable to search right now." onRetry={reload} />;
    if (!data) return <EmptyState title="Search" message="Start typing to search courses and learning content." />;
    if (data.items.length === 0) {
      return (
        <EmptyState title="No results" message={`No results found for “${q}”.`}>
          {(type || sort) && <button type="button" onClick={() => update({ type: '', sort: '' })} className={secondaryButton}>Clear filters</button>}
        </EmptyState>
      );
    }
    return (
      <>
        <p role="status" className="text-sm text-slate-600">{data.pagination.total} result{data.pagination.total === 1 ? '' : 's'} for “{q}”</p>
        <div className="mt-4 space-y-6">
          {groupByKind(data.items).map((group) => <SearchResultGroup key={group.type} label={group.label} items={group.items} />)}
        </div>
        <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={(p) => update({ page: p > 1 ? String(p) : '' }, true)} />
      </>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Search</h1>
      <div className="grid gap-3 sm:grid-cols-[1fr_10rem_10rem]">
        <form key={q} role="search" onSubmit={submit}>
          <label htmlFor="search-page-input" className="block text-xs font-medium text-slate-600">Search courses and content</label>
          <div className="relative mt-1">
            <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input id="search-page-input" name="q" type="search" defaultValue={q} maxLength={100} placeholder="Try “html” or “react”" className="block w-full rounded-md border border-slate-300 py-2 pl-8 pr-3 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600" />
          </div>
        </form>
        <FilterDropdown id="search-type" label="Type" value={type} options={TYPE_OPTIONS} onChange={(v) => update({ type: v })} allLabel="All types" />
        <FilterDropdown id="search-sort" label="Sort" value={sort} options={SORT_OPTIONS} onChange={(v) => update({ sort: v })} allLabel="Relevance" />
      </div>
      {renderBody()}
    </div>
  );
}