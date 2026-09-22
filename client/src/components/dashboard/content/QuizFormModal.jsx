import { useForm } from '../../../hooks/useForm.js';
import { buildQuizPayload, emptyQuizValues, quizToFormValues, validateQuizForm } from '../../../utils/forms/quizForm.js';
import FormModal from '../../common/FormModal.jsx';
import { TextField, TextareaField } from '../../common/FormControls.jsx';
import { createQuizForConcept, updateQuiz } from '../../../services/quizService.js';

export default function QuizFormModal({ mode, concept, quiz, onClose, onSaved }) {
  const isNew = mode === 'create';

  const form = useForm({
    initialValues: isNew ? emptyQuizValues : quizToFormValues(quiz),
    validate: validateQuizForm,
    onSubmit: async (values) => {
      const payload = buildQuizPayload(values, { isNew, original: quiz });
      const saved = isNew ? await createQuizForConcept(concept.id, payload) : await updateQuiz(quiz.id, payload);
      onSaved(saved);
    },
  });

  return (
    <FormModal title={isNew ? 'Add quiz' : 'Edit quiz'} form={form} submitLabel={isNew ? 'Create quiz' : 'Save changes'} pendingLabel="Saving…" onClose={onClose} size="lg">
      {isNew && <p className="text-sm text-slate-600">Adding a quiz to “{concept.title}”.</p>}
      <TextField label="Title" required data-autofocus {...form.field('title')} />
      <TextField label="Slug" hint={isNew ? 'Optional. Leave blank to generate it from the title.' : 'Lowercase letters, numbers and hyphens.'} {...form.field('slug')} />
      <TextareaField label="Description" rows={3} {...form.field('description')} />
      <TextareaField label="Instructions" rows={3} hint="Shown to students before they start." {...form.field('instructions')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Passing score (%)" type="number" min="0" max="100" {...form.field('passingScore')} />
        <TextField label="Max attempts" type="number" min="1" hint="Blank = unlimited" {...form.field('maxAttempts')} />
        <TextField label="Time limit (minutes)" type="number" min="1" hint="Blank = untimed" {...form.field('timeLimitMinutes')} />
      </div>
      {!isNew && <TextField label="Order" type="number" min="0" {...form.field('order')} />}
    </FormModal>
  );
}