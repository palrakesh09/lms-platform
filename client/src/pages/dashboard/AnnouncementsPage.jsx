import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';
import AnnouncementFormModal from '../../components/annoucements/AnnouncementFormModal.jsx';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { dangerLinkButton, linkButton, primaryButton } from '../../components/common/buttonClasses.js';
import Icon from '../../components/common/Icon.jsx';
import { PageHeader } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useRefreshableResource } from '../../hooks/useRefreshableResource.js';
import { useToast } from '../../hooks/useToast.js';
import { deleteAnnouncement, getAnnouncements, publishAnnouncement } from '../../services/announcementService.js';
import { formatDate } from '../../utils/formatters.js';
import { AUDIENCE_LABELS } from '../../utils/notificationUtils.js';

// /admin/announcements and /mentor/announcements. The API decides what each role sees and may change.
export default function AnnouncementsPage({ area }) {
  const isAdmin = area === 'admin';
  const [params, setParams] = useSearchParams();
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1));
  const { notify } = useToast();
  const [modal, setModal] = useState(null);
  const [action, setAction] = useState(null);

  const { status, data, error, refresh, reload } = useRefreshableResource(useCallback((signal) => getAnnouncements({ page, limit: 10 }, signal), [page]));

  return (
    <>
      <PageHeader
        title="Announcements"
        description={isAdmin ? 'Message students across the platform or a course.' : 'Message students in the courses you manage.'}
        actions={<button type="button" onClick={() => setModal({ kind: 'create' })} className={primaryButton}><Icon name="plus" className="size-4" />New announcement</button>}
      />

      {status === REQUEST_STATUS.LOADING && <LoadingRegion label="Loading announcements…" className="space-y-2"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></LoadingRegion>}
      {status === REQUEST_STATUS.ERROR && <ApiErrorState error={error} subject="announcements" onRetry={reload} />}
      {status === REQUEST_STATUS.SUCCESS && (data.items.length === 0 ? (
        <EmptyState title="No announcements yet" message="Create one to notify your students." icon="bell" />
      ) : (
        <>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
            {data.items.map((a) => (
              <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 wrap-break-word text-sm font-medium text-slate-900">{a.title}<StatusBadge status={a.status === 'published' ? 'published' : 'draft'} /></p>
                  <p className="mt-0.5 line-clamp-2 wrap-break-word text-sm text-slate-700">{a.message}</p>
                  <p className="mt-1 text-xs text-slate-600">{AUDIENCE_LABELS[a.audienceType]}{a.courseTitle ? ` · ${a.courseTitle}` : ''} · {formatDate(a.publishedAt ?? a.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {a.status === 'draft' && (
                    <>
                      <button type="button" onClick={() => setModal({ kind: 'edit', announcement: a })} className={linkButton}>Edit<span className="sr-only"> {a.title}</span></button>
                      <button type="button" onClick={() => setAction({ type: 'publish', a })} className={linkButton}>Publish<span className="sr-only"> {a.title}</span></button>
                    </>
                  )}
                  <button type="button" onClick={() => setAction({ type: 'delete', a })} className={dangerLinkButton}>Delete<span className="sr-only"> {a.title}</span></button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={(p) => setParams(p > 1 ? { page: String(p) } : {})} />
        </>
      ))}

      {modal && <AnnouncementFormModal mode={modal.kind} announcement={modal.announcement} isAdmin={isAdmin} onClose={() => setModal(null)} onSaved={() => { notify('Announcement saved as a draft.'); setModal(null); refresh(); }} />}

      {action?.type === 'publish' && (
        <ConfirmDialog title="Publish this announcement?" confirmLabel="Publish" pendingLabel="Publishing…" onClose={() => setAction(null)}
          onConfirm={async () => { const r = await publishAnnouncement(action.a.id); notify(`Published to ${r.recipients} student${r.recipients === 1 ? '' : 's'}.`); refresh(); }}>
          <p>“{action.a.title}” will be sent as a notification to: {AUDIENCE_LABELS[action.a.audienceType].toLowerCase()}{action.a.courseTitle ? ` (${action.a.courseTitle})` : ''}. This can&apos;t be undone or edited afterwards.</p>
        </ConfirmDialog>
      )}
      {action?.type === 'delete' && (
        <ConfirmDialog title="Delete this announcement?" confirmLabel="Delete" pendingLabel="Deleting…" tone="danger" onClose={() => setAction(null)}
          onConfirm={async () => { await deleteAnnouncement(action.a.id); notify('Announcement deleted.'); refresh(); }}>
          <p>“{action.a.title}” will be deleted. Notifications already delivered stay with students.</p>
        </ConfirmDialog>
      )}
    </>
  );
}