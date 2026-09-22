import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { primaryButton, secondaryButton } from '../../components/common/buttonClasses.js';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import QuestionPalette from '../../components/quiz/QuestionPalette.jsx';
import QuizCountdown from '../../components/quiz/QuizCountdown.jsx';
import { startQuiz, submitQuiz } from '../../services/attemptService.js';
import { getMutationError } from '../../utils/getMutationError.js';

const storageKey = (attemptId) => `quiz-answers:${attemptId}`;

export default function QuizAttemptPage() {
  const { quizId, attemptId: urlAttemptId } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState(null); // {attemptId, quiz, questions, startedAt}
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const expiredRef = useRef(false);

  // /start is idempotent: on mount (including refresh) it resumes the existing attempt rather than
  // creating a new one, and returns the same question set again — no need to persist questions.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await startQuiz(quizId);
        if (cancelled) return;
        if (result.attemptId !== urlAttemptId) {
          navigate(`/quiz/${quizId}/attempt/${result.attemptId}`, { replace: true });
          return;
        }
        setState(result);
        try {
          const stored = sessionStorage.getItem(storageKey(result.attemptId));
          if (stored) setAnswers(JSON.parse(stored));
        } catch { /* ignore malformed storage */ }
        setPhase('ready');
      } catch (error) {
        if (!cancelled) { setLoadError(error); setPhase('error'); }
      }
    })();
    return () => { cancelled = true; };
  }, [quizId, urlAttemptId, navigate]);

  const selectAnswer = (questionId, optionId) => {
    setAnswers((previous) => {
      const next = { ...previous, [questionId]: optionId };
      try { sessionStorage.setItem(storageKey(state.attemptId), JSON.stringify(next)); } catch { /* storage may be unavailable */ }
      return next;
    });
  };

  const handleSubmit = useCallback(async () => {
    if (submitting || !state) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = Object.entries(answers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
      await submitQuiz(quizId, state.attemptId, payload);
      try { sessionStorage.removeItem(storageKey(state.attemptId)); } catch { /* ignore */ }
      navigate(`/quiz/${quizId}/result/${state.attemptId}`, { replace: true });
    } catch (error) {
      const info = getMutationError(error);
      setSubmitError(info.message);
      // Already submitted (another tab, or a race with the deadline auto-submit) — go straight to the result.
      if (info.kind === 'conflict') navigate(`/quiz/${quizId}/result/${state.attemptId}`, { replace: true });
    } finally {
      setSubmitting(false);
    }
  }, [submitting, state, answers, quizId, navigate]);

  const handleExpire = useCallback(() => {
    if (expiredRef.current) return;
    expiredRef.current = true;
    handleSubmit();
  }, [handleSubmit]);

  if (phase === 'loading') {
    return <LoadingRegion label="Loading quiz…" className="mx-auto max-w-2xl space-y-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-40 w-full" /></LoadingRegion>;
  }
  if (phase === 'error') return <ApiErrorState error={loadError} subject="quiz" onRetry={() => window.location.reload()} />;

  const question = state.questions[current];
  const deadline = state.quiz.timeLimitMinutes ? new Date(new Date(state.startedAt).getTime() + state.quiz.timeLimitMinutes * 60000) : null;
  const isLast = current === state.questions.length - 1;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight">{state.quiz.title}</h1>
        {deadline && <QuizCountdown deadline={deadline} onExpire={handleExpire} />}
      </div>

      <QuestionPalette questions={state.questions} answers={answers} current={current} onSelect={setCurrent} />

      <fieldset className="rounded-lg border border-slate-200 bg-white p-4">
        <legend className="px-1 text-sm font-medium text-slate-600">
          Question {current + 1} of {state.questions.length}
        </legend>
        <p className="mt-1 text-base font-medium text-slate-900">{question.question}</p>
        <div className="mt-4 space-y-2">
          {question.options.map((option) => (
            <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm ${answers[question.id] === option.id ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'}`}>
              <input
                type="radio"
                name={question.id}
                checked={answers[question.id] === option.id}
                onChange={() => selectAnswer(question.id, option.id)}
                className="size-4 text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              />
              {option.text}
            </label>
          ))}
        </div>
      </fieldset>

      {submitError && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">{submitError}</p>}

      <div className="flex justify-between gap-3">
        <button type="button" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className={secondaryButton}>Previous</button>
        {isLast ? (
          <button type="button" onClick={handleSubmit} disabled={submitting} className={primaryButton}>{submitting ? 'Submitting…' : 'Submit Quiz'}</button>
        ) : (
          <button type="button" onClick={() => setCurrent((c) => c + 1)} className={primaryButton}>Next</button>
        )}
      </div>
      <p className="text-xs text-slate-600">Your selections are saved on this device. Refreshing this page will not lose them, but they are not sent to the server until you submit.</p>
    </div>
  );
}