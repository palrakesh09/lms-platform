import { useState } from 'react';
import { useForm } from '../../../hooks/useForm.js';
import { buildQuestionPayload, emptyQuestionValues, questionToFormValues, validateQuestionForm } from '../../../utils/forms/questionForm.js';
import { createQuestion, updateQuestion } from '../../../services/questionService.js';
import { primaryButton, secondaryButton, smallDangerButton } from '../../common/buttonClasses.js';
import { TextareaField, TextField } from '../../common/FormControls.jsx';
import FormModal from '../../common/FormModal.jsx';
import Icon from '../../common/Icon.jsx';

const nextLetter = (options) => String.fromCharCode(97 + options.length); // a, b, c, ...

export default function QuestionFormModal({ mode, quizId, question, onClose, onSaved }) {
  const isNew = mode === 'create';
  const [options, setOptions] = useState(isNew ? emptyQuestionValues.options : questionToFormValues(question).options);

  const form = useForm({
    initialValues: isNew ? emptyQuestionValues : questionToFormValues(question),
    validate: (values) => validateQuestionForm({ ...values, options }),
    onSubmit: async (values) => {
      const payload = buildQuestionPayload({ ...values, options });
      const saved = isNew ? await createQuestion(quizId, payload) : await updateQuestion(question.id, payload);
      onSaved(saved);
    },
  });

  const updateOption = (index, text) => setOptions((current) => current.map((o, i) => (i === index ? { ...o, text } : o)));
  const addOption = () => options.length < 8 && setOptions((current) => [...current, { id: nextLetter(current), text: '' }]);
  const removeOption = (index) => setOptions((current) => current.filter((_, i) => i !== index));

  return (
    <FormModal title={isNew ? 'Add question' : 'Edit question'} form={form} submitLabel={isNew ? 'Create question' : 'Save changes'} pendingLabel="Saving…" onClose={onClose} size="lg">
      <TextareaField label="Question" required rows={2} data-autofocus {...form.field('question')} />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Options and correct answer</legend>
        {form.fieldErrors.options && <p className="text-sm text-red-600">{form.fieldErrors.options}</p>}
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <input
              type="radio"
              name="correctAnswer"
              checked={form.values.correctAnswer === option.id}
              onChange={() => form.setValue('correctAnswer', option.id)}
              aria-label={`Mark option ${option.id.toUpperCase()} as correct`}
            />
            <span className="w-6 text-sm font-medium text-slate-600">{option.id.toUpperCase()}</span>
            <input
              type="text"
              value={option.text}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${option.id.toUpperCase()}`}
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600"
            />
            {options.length > 2 && (
              <button type="button" onClick={() => removeOption(index)} aria-label={`Remove option ${option.id.toUpperCase()}`} className={smallDangerButton}>
                <Icon name="trash" className="size-3.5" />
              </button>
            )}
          </div>
        ))}
        {options.length < 8 && (
          <button type="button" onClick={addOption} className={secondaryButton}>
            <Icon name="plus" className="size-4" />
            Add option
          </button>
        )}
        {form.fieldErrors.correctAnswer && <p className="text-sm text-red-600">{form.fieldErrors.correctAnswer}</p>}
      </fieldset>

      <TextareaField label="Explanation" rows={2} hint="Optional, for your own reference." {...form.field('explanation')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Points" type="number" min="1" {...form.field('points')} />
        <TextField label="Order" type="number" min="0" hint={isNew ? 'Optional. Blank adds it at the end.' : ''} {...form.field('order')} />
      </div>
    </FormModal>
  );
}