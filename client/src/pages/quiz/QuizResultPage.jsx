import { useCallback } from 'react';
import { Link, useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { primaryButton, secondaryButton } from '../../components/common/buttonClasses.js';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { getAttempt, getAttempts, startQuiz } from '../../services/attemptService.js';
import { formatDate } from '../../utils/formatters.js';

export default function QuizResultPage() {
  const { quizId, attemptId } = useParams();
  const result = useApiResource(useCallback((signal) => getAttempt(attemptId, signal), [attemptId]));
  const attempts = useApiResource(useCallback((signal) => getAttempts(quizId, signal), [quizId]));

  if (result.status === REQUEST_STATUS.LOADING) return <LoadingRegion label="Loading result…" className="mx-auto max-w-md"><Skeleton className="h-64 w-full" /></LoadingRegion>;
  if (result.status === REQUEST_STATUS.ERROR) return <ApiErrorState error={result.error} subject="attempt" onRetry={result.reload} />;

  const { data } = result;
  const submittedCount = attempts.status === REQUEST_STATUS.SUCCESS ? attempts.data.filter((a) => a.status === 'submitted').length : null;
  const canRetry = data.quiz?.maxAttempts == null || (submittedCount != null && submittedCount < data.quiz.maxAttempts);

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight">{data.quiz?.title ?? 'Quiz result'}</h1>
        <p className="mt-1 text-sm text-slate-600">Attempt {data.attemptNumber} · {formatDate(data.submittedAt)}</p>
      </div>

      <div className="text-center">
        <p className="text-4xl font-bold text-slate-900">{data.score} / {data.totalPoints}</p>
        <p className="mt-1 text-lg font-medium text-slate-700">{Math.round(data.percentage)}%</p>
        <div className="mt-3 flex justify-center">
          <StatusBadge status={data.passed ? 'active' : 'inactive'} label={data.passed ? 'Passed' : 'Failed'} />
        </div>
        {data.submittedLate && <p className="mt-2 text-xs text-amber-700">This attempt was submitted after the time limit.</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/courses" className={secondaryButton}>Back to Course</Link>
        {canRetry && (
          <RetryButton quizId={quizId} />
        )}
      </div>
    </div>
  );
}

function RetryButton({ quizId }) {
  // Reuses the same startQuiz call the detail page uses. If nothing has changed it will (safely,
  // idempotently) resume rather than duplicate — but after a submitted attempt, a fresh call always
  // creates the next attemptNumber.
  const navigateToAttempt = async () => {
    const result = await startQuiz(quizId);
    window.location.assign(`/quiz/${quizId}/attempt/${result.attemptId}`);
  };
  return <button type="button" onClick={navigateToAttempt} className={primaryButton}>Retry Quiz</button>;
}