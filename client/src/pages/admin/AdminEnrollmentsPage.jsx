import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import FilterDropdown from '../../components/common/FilterDropdown.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { dangerLinkButton } from '../../components/common/buttonClasses.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { PageHeader } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useRefreshableResource } from '../../hooks/useRefreshableResource.js';
import { useToast } from '../../hooks/useToast.js';
import { apiClient } from '../../services/apiClient.js';
import { formatDate } from '../../utils/formatters.js';
import { useState } from 'react';

const STATUS_OPTIONS = [{ value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }];

const getAdminEnrollments = async (params, signal) => {
  const { data } = await apiClient.get('/enrollments/admin/all', { params, signal });
  return { items: data.data, pagination: data.pagination };
};

export default function AdminEnrollmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const { notify } = useToast();
  const [cancelling, setCancelling] = useState(null);

  const { status: reqStatus, data, error, refresh, reload } = useRefreshableResource(
    useCallback((signal) => getAdminEnrollments({ page, limit: 10, ...(search ? { search } : {}), ...(status ? { status } : {}) }, signal), [page, search, status]),
  );

  return (
    <>
      <PageHeader title="Enrollments" description="All student enrollments across the platform." />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <SearchInput id="enrollment-search" label="Search student" placeholder="Name or email" defaultValue={search} onSearch={(v) => setSearchParams((p) => { const n = new URLSearchParams(p); v ? n.set('search', v) : n.delete('search'); n.delete('page'); return n; })} />
        <FilterDropdown id="enrollment-status" label="Status" value={status} options={STATUS_OPTIONS} onChange={(v) => setSearchParams((p) => { const n = new URLSearchParams(p); v ? n.set('status', v) : n.delete('status'); n.delete('page'); return n; })} />
      </div>

      {reqStatus === REQUEST_STATUS.LOADING && <LoadingRegion label="Loading enrollments…" className="space-y-2"><Skeleton className="h-14 w-full" /></LoadingRegion>}
      {reqStatus === REQUEST_STATUS.ERROR && <ApiErrorState error={error} subject="enrollments" onRetry={reload} />}
      {reqStatus === REQUEST_STATUS.SUCCESS && (
        data.items.length === 0 ? <EmptyState title="No enrollments found" message="No enrollments match your filters." /> : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 hidden md:table-cell">Enrolled</th><th className="px-4 py-3">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3">{row.student.name}<p className="text-xs text-slate-600">{row.student.email}</p></td>
                      <td className="px-4 py-3">{row.course.title}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status === 'cancelled' ? 'inactive' : row.status === 'completed' ? 'active' : 'draft'} label={row.status} /></td>
                      <td className="px-4 py-3 hidden text-slate-700 md:table-cell">{formatDate(row.enrolledAt)}</td>
                      <td className="px-4 py-3">
                        {row.status !== 'cancelled' && <button type="button" onClick={() => setCancelling(row)} className={dangerLinkButton}>Cancel</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={(p) => setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n; })} />
          </>
        )
      )}

      {cancelling && (
        <ConfirmDialog title="Cancel this enrollment?" confirmLabel="Cancel enrollment" pendingLabel="Cancelling…" tone="danger" onClose={() => setCancelling(null)}
          onConfirm={async () => { await apiClient.delete(`/enrollments/admin/${cancelling.id}`); notify('Enrollment cancelled.'); refresh(); }}>
          <p>{cancelling.student.name} will lose access to “{cancelling.course.title}”.</p>
        </ConfirmDialog>
      )}
    </>
  );
}