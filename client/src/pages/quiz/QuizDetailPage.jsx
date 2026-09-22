import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { primaryButton, secondaryButton } from '../../components/common/buttonClasses.js';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { startQuiz } from '../../services/attemptService.js';
import { getQuestions } from '../../services/questionService.js';
import { getQuiz } from '../../services/quizService.js';
import { getMutationError } from '../../utils/getMutationError.js';

export default function QuizDetailPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  const quiz = useApiResource(useCallback((signal) => getQuiz(quizId, signal), [quizId]));
  const questions = useApiResource(useCallback((signal) => getQuestions(quizId, signal), [quizId]));

  if (quiz.status === REQUEST_STATUS.LOADING || questions.status === REQUEST_STATUS.LOADING) {
    return <LoadingRegion label="Loading quiz…" className="mx-auto max-w-2xl space-y-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-24 w-full" /></LoadingRegion>;
  }
  if (quiz.status === REQUEST_STATUS.ERROR) return <ApiErrorState error={quiz.error} subject="quiz" onRetry={quiz.reload} />;

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    setStartError('');
    try {
      const result = await startQuiz(quizId);
      navigate(`/quiz/${quizId}/attempt/${result.attemptId}`);
    } catch (error) {
      const info = getMutationError(error);
      setStartError(info.message);
    } finally {
      setStarting(false);
    }
  };

  const { data } = quiz;
  const questionCount = questions.status === REQUEST_STATUS.SUCCESS ? questions.data.length : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
        {data.description && <p className="mt-2 text-slate-700">{data.description}</p>}
      </div>

      {data.instructions && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Instructions</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{data.instructions}</p>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm sm:grid-cols-4">
        <div><dt className="text-slate-600">Questions</dt><dd className="font-semibold text-slate-900">{questionCount ?? '—'}</dd></div>
        <div><dt className="text-slate-600">Time limit</dt><dd className="font-semibold text-slate-900">{data.timeLimitMinutes ? `${data.timeLimitMinutes} min` : 'Untimed'}</dd></div>
        <div><dt className="text-slate-600">Passing score</dt><dd className="font-semibold text-slate-900">{data.passingScore}%</dd></div>
        <div><dt className="text-slate-600">Max attempts</dt><dd className="font-semibold text-slate-900">{data.maxAttempts ?? 'Unlimited'}</dd></div>
      </dl>

      {startError && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">{startError}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleStart} disabled={starting} className={primaryButton}>
          {starting ? 'Starting…' : 'Start Quiz'}
        </button>
        <Link to={`/quiz/${quizId}/attempts`} className={secondaryButton}>View attempt history</Link>
      </div>
    </div>
  );
}