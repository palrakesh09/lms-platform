import { useToast } from '../../../hooks/useToast.js';
import { archiveQuiz, deleteQuiz, publishQuiz } from '../../../services/quizService.js';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';

const ACTIONS = {
  publish: { title: 'Publish this quiz?', confirmLabel: 'Publish', pendingLabel: 'Publishing…', tone: 'primary', run: publishQuiz, done: 'Quiz published.', body: (q) => <p>“{q.title}” will become visible and attemptable by students.</p> },
  archive: { title: 'Archive this quiz?', confirmLabel: 'Archive', pendingLabel: 'Archiving…', tone: 'primary', run: archiveQuiz, done: 'Quiz archived.', body: (q) => <p>“{q.title}” will be hidden from students.</p> },
  delete: { title: 'Delete this quiz?', confirmLabel: 'Delete', pendingLabel: 'Deleting…', tone: 'danger', run: deleteQuiz, done: 'Quiz deleted.', body: (q) => <><p>“{q.title}” and its questions will be permanently deleted.</p><p>A quiz that students have already attempted can’t be deleted. Archive it instead.</p></> },
};

export default function QuizActionDialog({ action, quiz, onClose, onDone }) {
  const { notify } = useToast();
  const config = ACTIONS[action];

  return (
    <ConfirmDialog title={config.title} confirmLabel={config.confirmLabel} pendingLabel={config.pendingLabel} tone={config.tone} onClose={onClose}
      onConfirm={async () => { await config.run(quiz.id); notify(config.done); onDone(); }}>
      {config.body(quiz)}
    </ConfirmDialog>
  );
}