import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../../hooks/useAuth.js';
import { REQUEST_STATUS, useApiResource } from '../../../hooks/useApiResource.js';
import { useToast } from '../../../hooks/useToast.js';
import { getUsers } from '../../../services/userService.js';
import { getMutationError } from '../../../utils/getMutationError.js';
import ApiErrorState from '../../common/ApiErrorState.jsx';
import { primaryButton, secondaryButton, smallButton } from '../../common/buttonClasses.js';
import Modal from '../../common/Modal.jsx';
import SearchInput from '../../common/SearchInput.jsx';
import Skeleton, { LoadingRegion } from '../../common/Skeleton.jsx';

const CANDIDATE_LIMIT = 50; // the API's maximum page size

// Lists active mentors that aren't assigned yet. `onAssign(mentorId)` saves the new list and throws on failure.
// The dialog stays open so several mentors can be assigned in a row.
export default function AssignMentorModal({ assignedIds, onAssign, onClose }) {
  const { notify } = useToast();
  const { expireSession } = useAuth();
  const [search, setSearch] = useState('');
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState('');

  const fetcher = useCallback(
    (signal) => getUsers({ role: 'mentor', isActive: true, limit: CANDIDATE_LIMIT, search }, signal),
    [search],
  );
  const { status, data, error: loadError, reload } = useApiResource(fetcher);
  const candidates = data ? data.items.filter((user) => !assignedIds.has(user.id)) : [];

  const assign = async (mentor) => {
    if (pendingId) return;
    setPendingId(mentor.id);
    setError('');

    try {
      await onAssign(mentor.id);
      notify(`${mentor.name} assigned.`);
    } catch (failure) {
      const info = getMutationError(failure);
      if (info.kind === 'unauthorized') expireSession();
      setError(info.message);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Modal title="Assign mentor" onClose={onClose} size="lg">
      <div className="space-y-4 px-5 py-4">
        <div data-autofocus-container>
          <SearchInput id="mentor-search" label="Search mentors" placeholder="Name or email" onSearch={setSearch} />
        </div>

        {error && (
          <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {error}
          </div>
        )}

        {status === REQUEST_STATUS.LOADING && (
          <LoadingRegion label="Loading mentors…" className="space-y-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </LoadingRegion>
        )}
        {status === REQUEST_STATUS.ERROR && <ApiErrorState error={loadError} subject="mentors" onRetry={reload} />}
        {status === REQUEST_STATUS.SUCCESS &&
          (candidates.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-600">
              {search
                ? 'No mentors match your search.'
                : 'No mentors available. To add one, give a user the mentor role on the '}
              {!search && (
                <>
                  <Link to="/admin/users" className="font-medium text-indigo-700 underline">
                    Users page
                  </Link>
                  .
                </>
              )}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
              {candidates.map((mentor) => (
                <li key={mentor.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="wrap-break-word text-sm font-medium text-slate-900">{mentor.name}</p>
                    <p className="break-all text-xs text-slate-600">{mentor.email}</p>
                  </div>
                  <button type="button" onClick={() => assign(mentor)} disabled={Boolean(pendingId)} className={smallButton}>
                    {pendingId === mentor.id ? 'Assigning…' : 'Assign'}
                    <span className="sr-only"> {mentor.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ))}
      </div>
      <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
        <button type="button" data-autofocus onClick={onClose} className={pendingId ? secondaryButton : primaryButton}>
          Done
        </button>
      </div>
    </Modal>
  );
}