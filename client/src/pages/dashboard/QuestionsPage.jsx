import { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { primaryButton, secondaryButton, smallButton, smallDangerButton } from '../../components/common/buttonClasses.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import Icon from '../../components/common/Icon.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import QuestionFormModal from '../../components/dashboard/content/QuestionFormModal.jsx';
import { PageHeader } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { useToast } from '../../hooks/useToast.js';
import { deleteQuestion, getQuestions } from '../../services/questionService.js';
import { getQuiz } from '../../services/quizService.js';
import { dashboardPaths } from '../../utils/dashboardPaths.js';

export default function QuestionsPage({ area }) {
  const { quizId } = useParams();
  const paths = dashboardPaths(area);
  const { notify } = useToast();
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const quiz = useApiResource(useCallback((signal) => getQuiz(quizId, signal), [quizId]));
  const questions = useApiResource(useCallback((signal) => getQuestions(quizId, signal), [quizId]));

  if (quiz.status === REQUEST_STATUS.LOADING || questions.status === REQUEST_STATUS.LOADING) {
    return <LoadingRegion label="Loading…" className="space-y-2"><Skeleton className="h-24 w-full" /></LoadingRegion>;
  }
  if (quiz.status === REQUEST_STATUS.ERROR) return <ApiErrorState error={quiz.error} subject="quiz" onRetry={quiz.reload} backTo={paths.courses} />;
  if (questions.status === REQUEST_STATUS.ERROR) return <ApiErrorState error={questions.error} subject="questions" onRetry={questions.reload} />;

  return (
    <>
      <PageHeader
        title={`Questions — ${quiz.data.title}`}
        backTo={paths.course(quiz.data.course)}
        backLabel="Back to course"
        actions={<button type="button" onClick={() => setModal({ kind: 'create' })} className={primaryButton}><Icon name="plus" className="size-4" />Add Question</button>}
      />

      {questions.data.length === 0 ? (
        <EmptyState title="No questions yet" message="Add at least one question before publishing this quiz.">
          <button type="button" onClick={() => setModal({ kind: 'create' })} className={secondaryButton}>Add question</button>
        </EmptyState>
      ) : (
        <ol className="space-y-3">
          {questions.data.map((question, index) => (
            <li key={question.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-900">{index + 1}. {question.question}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {question.options.map((option) => (
                  <li key={option.id} className={option.id === question.correctAnswer ? 'font-medium text-emerald-700' : 'text-slate-700'}>
                    {option.id.toUpperCase()}. {option.text} {option.id === question.correctAnswer && '✓ Correct'}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setModal({ kind: 'edit', question })} className={smallButton}>Edit</button>
                <button type="button" onClick={() => setDeleting(question)} className={smallDangerButton}>Delete</button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {modal && (
        <QuestionFormModal mode={modal.kind} quizId={quizId} question={modal.question}
          onClose={() => setModal(null)} onSaved={() => { setModal(null); questions.reload(); }} />
      )}
      {deleting && (
        <ConfirmDialog title="Delete this question?" confirmLabel="Delete" pendingLabel="Deleting…" tone="danger"
          onClose={() => setDeleting(null)}
          onConfirm={async () => { await deleteQuestion(deleting.id); notify('Question deleted.'); questions.reload(); }}>
          <p>This action cannot be undone.</p>
        </ConfirmDialog>
      )}
    </>
  );
}