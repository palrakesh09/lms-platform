import { useForm } from '../../../hooks/useForm.js';
import { CONTENT_STATUS_OPTIONS, RESOURCE_TYPE_OPTIONS } from '../../../utils/enums.js';
import {
  buildResourcePayload,
  emptyResourceValues,
  resourceToFormValues,
  validateResourceForm,
} from '../../../utils/forms/resourceForm.js';
import FormModal from '../../common/FormModal.jsx';
import { CheckboxField, SelectField, TextField, TextareaField } from '../../common/FormControls.jsx';
import { CONTENT_ENTITIES } from './contentEntities.js';

// Create or edit a resource. `parent` is the concept { id, title } (create); `item` is the full resource (edit).
// The type comes from a fixed list and the URL must be http(s). The concept id goes into the request URL only.
export default function ResourceFormModal({ mode, parent, item, onClose, onSaved }) {
  const config = CONTENT_ENTITIES.resource;
  const isNew = mode === 'create';

  const form = useForm({
    initialValues: isNew ? emptyResourceValues : resourceToFormValues(item),
    validate: validateResourceForm,
    onSubmit: async (values) => {
      const payload = buildResourcePayload(values);
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
      <TextareaField label="Description" rows={3} {...form.field('description')} />
      <TextField
        label="URL"
        type="url"
        required
        placeholder="https://"
        hint="Only http:// and https:// links are allowed."
        {...form.field('url')}
      />
      <CheckboxField
        label="Open in a new tab"
        hint="Recommended for external sites."
        {...form.field('openInNewTab')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Order"
          type="number"
          min="0"
          step="1"
          hint={isNew ? 'Optional. Blank adds it at the end.' : 'Lower numbers come first.'}
          {...form.field('order')}
        />
        <SelectField
          label="Status"
          hint="Drafts and archived items are hidden from students."
          options={CONTENT_STATUS_OPTIONS}
          {...form.field('status')}
        />
      </div>
    </FormModal>
  );
}