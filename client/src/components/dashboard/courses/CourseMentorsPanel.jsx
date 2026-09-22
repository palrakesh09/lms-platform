import { useCallback, useState } from 'react';
import { REQUEST_STATUS } from '../../../hooks/useApiResource.js';
import { useRefreshableResource } from '../../../hooks/useRefreshableResource.js';
import { useToast } from '../../../hooks/useToast.js';
import { getCourseMentors, setCourseMentors } from '../../../services/courseService.js';
import ApiErrorState from '../../common/ApiErrorState.jsx';
import { secondaryButton, smallDangerButton } from '../../common/buttonClasses.js';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import Icon from '../../common/Icon.jsx';
import Skeleton, { LoadingRegion } from '../../common/Skeleton.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import { Panel } from '../DashboardUi.jsx';
import AssignMentorModal from './AssignMentorModal.jsx';

const MAX_MENTORS = 20; // the API's limit

// Admin only (the page renders it only for admins, and the API rejects everyone else).
// Every change sends the full new list and then shows the server's answer, not a local guess.
export default function CourseMentorsPanel({ courseId }) {
  const { notify } = useToast();
  const fetcher = useCallback((signal) => getCourseMentors(courseId, signal), [courseId]);
  const { status, data, error, reload, mutate } = useRefreshableResource(fetcher);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(null);

  const save = async (mentorIds) => {
    mutate(await setCourseMentors(courseId, mentorIds));
  };

  const mentors = data ?? [];
  const atLimit = mentors.length >= MAX_MENTORS;

  return (
    <Panel
      title="Assigned mentors"
      description="Mentors can manage the content of the courses they are assigned to, and nothing else."
      actions={
        status === REQUEST_STATUS.SUCCESS && (
          <button type="button" onClick={() => setAssigning(true)} disabled={atLimit} className={secondaryButton}>
            <Icon name="plus" className="size-4" />
            Assign Mentor
          </button>
        )
      }
    >
      {status === REQUEST_STATUS.LOADING && (
        <LoadingRegion label="Loading mentors…" className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </LoadingRegion>
      )}
      {status === REQUEST_STATUS.ERROR && <ApiErrorState error={error} subject="mentors" onRetry={reload} />}
      {status === REQUEST_STATUS.SUCCESS &&
        (mentors.length === 0 ? (
          <p className="text-sm text-slate-600">No mentors are assigned to this course yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {mentors.map((mentor) => (
              <li key={mentor.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 wrap-break-word text-sm font-medium text-slate-900">
                    {mentor.name}
                    {!mentor.isActive && <StatusBadge status="inactive" label="Inactive" />}
                    {mentor.role !== 'mentor' && <StatusBadge status="archived" label="No longer a mentor" />}
                  </p>
                  <p className="break-all text-xs text-slate-600">{mentor.email}</p>
                </div>
                <button type="button" onClick={() => setRemoving(mentor)} className={smallDangerButton}>
                  Remove<span className="sr-only"> {mentor.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ))}
      {atLimit && <p className="mt-3 text-xs text-slate-600">A course can have at most {MAX_MENTORS} mentors.</p>}

      {assigning && (
        <AssignMentorModal
          assignedIds={new Set(mentors.map((mentor) => mentor.id))}
          onAssign={(mentorId) => save([...mentors.map((mentor) => mentor.id), mentorId])}
          onClose={() => setAssigning(false)}
        />
      )}
      {removing && (
        <ConfirmDialog
          title="Remove this mentor?"
          confirmLabel="Remove"
          pendingLabel="Removing…"
          tone="danger"
          onClose={() => setRemoving(null)}
          onConfirm={async () => {
            await save(mentors.filter((mentor) => mentor.id !== removing.id).map((mentor) => mentor.id));
            notify(`${removing.name} removed.`);
          }}
        >
          <p>{removing.name} will immediately lose access to this course&apos;s content management.</p>
        </ConfirmDialog>
      )}
    </Panel>
  );
}