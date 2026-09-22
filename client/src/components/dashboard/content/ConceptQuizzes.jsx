import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { REQUEST_STATUS, useApiResource } from '../../../hooks/useApiResource.js';
import { getQuizzesForConcept } from '../../../services/quizService.js';
import ApiErrorState from '../../common/ApiErrorState.jsx';
import { secondaryButton, smallButton, smallDangerButton } from '../../common/buttonClasses.js';
import Icon from '../../common/Icon.jsx';
import Skeleton, { LoadingRegion } from '../../common/Skeleton.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import QuizActionDialog from './QuizActionDialog.jsx';
import QuizFormModal from './QuizFormModal.jsx';

// Lazily fetched per concept — the course structure endpoint intentionally does not include quizzes
// (Phase 9 does not modify it), so this only fetches once the concept's tree row is expanded.
export default function ConceptQuizzes({ concept, area }) {
  const fetcher = useCallback((signal) => getQuizzesForConcept(concept.id, signal), [concept.id]);
  const { status, data, error, reload } = useApiResource(fetcher);
  const [modal, setModal] = useState(null); // {kind:'create'|'edit', quiz?} | null
  const [action, setAction] = useState(null); // {type, quiz} | null

  if (status === REQUEST_STATUS.LOADING) {
    return (
      <LoadingRegion label="Loading quizzes…" className="space-y-2">
        <Skeleton className="h-10 w-full" />
      </LoadingRegion>
    );
  }
  if (status === REQUEST_STATUS.ERROR) return <ApiErrorState error={error} subject="quizzes" onRetry={reload} />;

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Quizzes</h4>
        <button type="button" onClick={() => setModal({ kind: 'create' })} className={smallButton}>
          <Icon name="plus" className="size-3.5" />
          Add Quiz
        </button>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-slate-600">No quizzes for this concept yet.</p>
      ) : (
        <ul className="space-y-1">
          {data.map((quiz) => (
            <li key={quiz.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-2 py-1.5 hover:bg-slate-50">
              <span className="min-w-0 flex-1 basis-48 wrap-break-word text-sm text-slate-900">{quiz.title}</span>
              <StatusBadge status={quiz.status} />
              <div className="flex flex-wrap gap-2">
                <Link to={`/${area}/quizzes/${quiz.id}/questions`} className={smallButton}>Manage Questions</Link>
                <button type="button" onClick={() => setModal({ kind: 'edit', quiz })} className={smallButton}>Edit</button>
                {area === 'admin' && quiz.status !== 'published' && (
                  <button type="button" onClick={() => setAction({ type: 'publish', quiz })} className={smallButton}>Publish</button>
                )}
                {area === 'admin' && quiz.status !== 'archived' && (
                  <button type="button" onClick={() => setAction({ type: 'archive', quiz })} className={smallButton}>Archive</button>
                )}
                <button type="button" onClick={() => setAction({ type: 'delete', quiz })} className={smallDangerButton}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <QuizFormModal
          mode={modal.kind} concept={concept} quiz={modal.quiz}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); reload(); }}
        />
      )}
      {action && (
        <QuizActionDialog action={action.type} quiz={action.quiz} onClose={() => setAction(null)} onDone={() => { setAction(null); reload(); }} />
      )}
    </div>
  );
}