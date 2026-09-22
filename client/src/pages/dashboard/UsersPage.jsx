import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import FilterDropdown from '../../components/common/FilterDropdown.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import UserActionDialog from '../../components/dashboard/users/UserActionDialog.jsx';
import UserTable from '../../components/dashboard/users/UserTable.jsx';
import { PageHeader } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useRefreshableResource } from '../../hooks/useRefreshableResource.js';
import { getUsers } from '../../services/userService.js';
import { ROLE_OPTIONS } from '../../utils/enums.js';
import { parseUserListParams } from '../../utils/listParams.js';

export default function UsersPage() {
  const [params, setParams] = useSearchParams();
  const values = useMemo(() => parseUserListParams(params), [params]);
  const [action, setAction] = useState(null);
  const fetcher = useCallback(
    (signal) => getUsers(values, signal),
    [values],
  );
  const resource = useRefreshableResource(fetcher);
  const update = (patch) => setParams((current) => {
    const next = new URLSearchParams(current);
    Object.entries(patch).forEach(([key, value]) => value === '' || value === undefined ? next.delete(key) : next.set(key, String(value)));
    next.delete('page');
    return next;
  });

  return (
    <>
      <PageHeader title="Manage users" description="Update student and mentor access." />
      <div className="mb-5 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <SearchInput id="user-search" label="Search" defaultValue={values.search} placeholder="Search users" onSearch={(value) => update({ search: value })} />
        <FilterDropdown id="user-role" label="Role" value={values.role} options={ROLE_OPTIONS.filter((option) => option.value !== 'admin')} onChange={(value) => update({ role: value })} />
        <FilterDropdown id="user-status" label="Status" value={values.isActive === undefined ? '' : String(values.isActive)} options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} onChange={(value) => update({ isActive: value })} />
      </div>
      {resource.status === REQUEST_STATUS.LOADING && <Skeleton className="h-64 w-full" />}
      {resource.status === REQUEST_STATUS.ERROR && <ApiErrorState error={resource.error} subject="users" onRetry={resource.reload} />}
      {resource.status === REQUEST_STATUS.SUCCESS && (
        <>
          <UserTable users={resource.data.items} onAction={setAction} />
          <Pagination page={resource.data.pagination.page} totalPages={resource.data.pagination.totalPages} onPageChange={(page) => setParams({ page: String(page) })} />
        </>
      )}
      {action && <UserActionDialog action={action.type} user={action.user} onClose={() => setAction(null)} onDone={() => { setAction(null); resource.refresh(); }} />}
    </>
  );
}
