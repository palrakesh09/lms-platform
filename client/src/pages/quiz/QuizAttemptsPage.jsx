import { useCallback } from 'react';
import { Link, useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { linkButton } from '../../components/common/buttonClasses.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { getAttempts } from '../../services/attemptService.js';
import { formatDate } from '../../utils/formatters.js';

export default function QuizAttemptsPage() {
  const { quizId } = useParams();
  const { status, data, error, reload } = useApiResource(useCallback((signal) => getAttempts(quizId, signal), [quizId]));

  if (status === REQUEST_STATUS.LOADING) return <LoadingRegion label="Loading attempts…" className="mx-auto max-w-lg"><Skeleton className="h-40 w-full" /></LoadingRegion>;
  if (status === REQUEST_STATUS.ERROR) return <ApiErrorState error={error} subject="attempts" onRetry={reload} />;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Attempt History</h1>
      {data.length === 0 ? (
        <EmptyState title="No attempts yet" message="You haven't attempted this quiz yet." />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {data.map((attempt) => (
            <li key={attempt.attemptId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Attempt {attempt.attemptNumber}</p>
                <p className="text-xs text-slate-600">{attempt.status === 'submitted' ? formatDate(attempt.submittedAt) : 'In progress'}</p>
              </div>
              <div className="flex items-center gap-3">
                {attempt.status === 'submitted' && (
                  <>
                    <span className="text-sm font-medium text-slate-900">{Math.round(attempt.percentage)}%</span>
                    <StatusBadge status={attempt.passed ? 'active' : 'inactive'} label={attempt.passed ? 'Passed' : 'Failed'} />
                    <Link to={`/quiz/${quizId}/result/${attempt.attemptId}`} className={linkButton}>View</Link>
                  </>
                )}
                {attempt.status === 'in_progress' && (
                  <Link to={`/quiz/${quizId}/attempt/${attempt.attemptId}`} className={linkButton}>Continue</Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}