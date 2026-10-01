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
    <div className="min-h-screen bg-[#0A0A0A]">
  <QuizHeader
    title={quiz?.title}
    currentQuestion={currentQuestionIndex + 1}
    totalQuestions={questions.length}
    timeLeft={timeLeft}
    onExit={handleExit}
  />

  <main className="mx-auto grid max-w-[1400px] gap-6 p-4 sm:p-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:p-8">
    <div className="lg:sticky lg:top-24 lg:self-start">
      <QuestionPalette
        total={questions.length}
        currentIndex={currentQuestionIndex}
        answers={answers}
        onSelect={setCurrentQuestionIndex}
      />
    </div>

    <div className="min-w-0 border border-[var(--border)] bg-[#0D0D0D] p-5 sm:p-8 lg:p-12">
      <QuestionCard
        question={questions[currentQuestionIndex]}
        selectedAnswer={currentAnswer}
        onAnswer={handleAnswer}
      />

      <QuizNavigation
        isFirst={currentQuestionIndex === 0}
        isLast={currentQuestionIndex === questions.length - 1}
        canContinue={currentAnswer != null}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  </main>
</div>
  );
}