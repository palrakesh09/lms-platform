import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { secondaryButton } from '../../components/common/buttonClasses.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import FilterDropdown from '../../components/common/FilterDropdown.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import { PageHeader } from '../../components/dashboard/DashboardUi.jsx';
import UserActionDialog from '../../components/dashboard/users/UserActionDialog.jsx';
import UserTable from '../../components/dashboard/users/UserTable.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useRefreshableResource } from '../../hooks/useRefreshableResource.js';
import { getUsers } from '../../services/userService.js';
import { pluralize } from '../../utils/formatters.js';
import { parseUserListParams } from '../../utils/listParams.js';
import { ROLE_OPTIONS } from '../../utils/enums.js';

const PAGE_SIZE = 10;
const ACTIVE_OPTIONS = [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }];

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, search, role, isActive } = useMemo(() => parseUserListParams(searchParams), [searchParams]);
  const [resetKey, setResetKey] = useState(0);
  const [action, setAction] = useState(null);

  const fetcher = useCallback((signal) => getUsers({ page, limit: PAGE_SIZE, search, role, isActive }, signal), [page, search, role, isActive]);
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

  const hasFilters = Boolean(search || role || isActive !== undefined);
  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setResetKey((current) => current + 1);
  };

  const renderResults = () => {
    if (status === REQUEST_STATUS.LOADING) {
      return (
        <LoadingRegion label="Loading users…" className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </LoadingRegion>
      );
    }
    if (status === REQUEST_STATUS.ERROR) {
      return <ApiErrorState error={error} subject="users" onRetry={reload} />;
    }

    const { items, pagination } = data;

    if (items.length === 0) {
      return hasFilters ? (
        <EmptyState title="No users found" message="No users match your filters.">
          <button type="button" onClick={clearFilters} className={secondaryButton}>
            Clear filters
          </button>
        </EmptyState>
      ) : (
        <EmptyState title="No users yet" message="No users are registered yet." />
      );
    }

    return (
      <>
        <UserTable users={items} onAction={setAction} />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(next) => updateParams({ page: next > 1 ? String(next) : '' }, { keepPage: true })} />
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Users"
        description={status === REQUEST_STATUS.SUCCESS ? `${pluralize(data.pagination.total, 'user')}${isRefreshing ? ' · Refreshing…' : ''}` : undefined}
      />

      <div key={resetKey} className="mb-4 grid gap-3 sm:grid-cols-3">
        <SearchInput id="user-search" label="Search" defaultValue={search} placeholder="Name or email" onSearch={(value) => updateParams({ search: value })} />
        <FilterDropdown id="role-filter" label="Role" value={role} options={ROLE_OPTIONS} onChange={(value) => updateParams({ role: value })} />
        <FilterDropdown id="active-filter" label="Status" value={isActive === undefined ? '' : String(isActive)} options={ACTIVE_OPTIONS} onChange={(value) => updateParams({ isActive: value })} />
      </div>

      {hasFilters && (
        <button type="button" onClick={clearFilters} className="mb-4 text-sm font-medium text-indigo-700 underline">
          Clear all filters
        </button>
      )}

      {renderResults()}

      {action && <UserActionDialog action={action.type} user={action.user} onClose={() => setAction(null)} onDone={refresh} />}
    </>
  );
}