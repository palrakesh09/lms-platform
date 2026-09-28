import { useState } from 'react';
import { useForm } from '../../../hooks/useForm.js';
import { CONTENT_STATUS_OPTIONS, RESOURCE_TYPE_OPTIONS } from '../../../utils/enums.js';
import { buildResourcePayload, emptyResourceValues, resourceToFormValues, validateResourceForm } from '../../../utils/forms/resourceForm.js';
import ContentEditor from '../../content-editor/ContentEditor.jsx';
import { CheckboxField, SelectField, TextField, TextareaField } from '../../common/FormControls.jsx';
import FormModal from '../../common/FormModal.jsx';
import { CONTENT_ENTITIES } from './contentEntities.js';

// Create or edit a resource. `parent` is the concept { id, title } (create); `item` is the full resource
// (edit). A resource may carry an external URL, structured content blocks, or both — see
// hasUsableContent() in resourceForm.js, which mirrors the server's own rule. Content blocks are held in
// their own state alongside useForm, the same pattern Phase 9's QuestionFormModal uses for its options.
export default function ResourceFormModal({ mode, parent, item, onClose, onSaved }) {
  const config = CONTENT_ENTITIES.resource;
  const isNew = mode === 'create';
  const initialValues = isNew ? emptyResourceValues : resourceToFormValues(item);
  const [blocks, setBlocks] = useState(initialValues.content.blocks);

  const form = useForm({
    initialValues,
    validate: (values) => validateResourceForm({ ...values, content: { version: 1, blocks } }),
    onSubmit: async (values) => {
      const payload = buildResourcePayload({ ...values, content: { version: 1, blocks } });
      const saved = isNew ? await config.api.create(parent.id, payload) : await config.api.update(item.id, payload);
      onSaved(saved);
    },
  });

  return (
    <FormModal
      title={isNew ? 'Add resource' : 'Edit resource'}
      form={form}
      submitLabel={isNew ? 'Create resource' : 'Save changes'}
      pendingLabel="Saving…"
      onClose={onClose}
      size="lg"
    >
      {isNew && <p className="text-sm text-slate-600">Adding a resource to “{parent.title}”.</p>}
      <SelectField label="Resource type" required options={RESOURCE_TYPE_OPTIONS} data-autofocus {...form.field('type')} />
      <TextField label="Title" required {...form.field('title')} />
      <TextareaField label="Description" rows={2} hint="A short summary shown above the content." {...form.field('description')} />

      <TextField label="External URL" type="url" placeholder="https:// (optional if you add content below)" hint="Only http:// and https:// links are allowed." {...form.field('url')} />
      <CheckboxField label="Open in a new tab" hint="Applies to the external URL, if provided." {...form.field('openInNewTab')} />

      <ContentEditor blocks={blocks} onChange={setBlocks} />
      {form.fieldErrors.content && <p role="alert" className="text-sm text-red-600">{form.fieldErrors.content}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Order" type="number" min="0" step="1" hint={isNew ? 'Optional. Blank adds it at the end.' : 'Lower numbers come first.'} {...form.field('order')} />
        <SelectField label="Status" hint="Drafts and archived items are hidden from students." options={CONTENT_STATUS_OPTIONS} {...form.field('status')} />
      </div>
    </FormModal>
  );
}