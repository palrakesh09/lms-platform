import { useForm } from '../../../hooks/useForm.js';
import { CONTENT_STATUS_OPTIONS } from '../../../utils/enums.js';
import { buildNodePayload, emptyNodeValues, nodeToFormValues, validateNodeForm } from '../../../utils/forms/nodeForm.js';
import { formatLabel } from '../../../utils/formatters.js';
import FormModal from '../../common/FormModal.jsx';
import { SelectField, TextField, TextareaField } from '../../common/FormControls.jsx';
import { CONTENT_ENTITIES } from './contentEntities.js';

// One modal for creating and editing modules, topics and concepts.
//   create: `parent` is { id, title }. The id goes into the request URL, and there is no parent form field.
//   edit:   `item` is the full record fetched from the API.
export default function NodeFormModal({ mode, entity, parent, item, onClose, onSaved }) {
  const config = CONTENT_ENTITIES[entity];
  const isNew = mode === 'create';
  const label = formatLabel(config.label);

  const form = useForm({
    initialValues: isNew ? emptyNodeValues : nodeToFormValues(item),
    validate: validateNodeForm,
    onSubmit: async (values) => {
      const payload = buildNodePayload(values, { isNew, original: item });
      const saved = isNew ? await config.api.create(parent.id, payload) : await config.api.update(item.id, payload);
      onSaved(saved);
    },
  });

  return (
    <FormModal
      title={isNew ? `Add ${config.label}` : `Edit ${config.label}`}
      form={form}
      submitLabel={isNew ? `Create ${config.label}` : 'Save changes'}
      pendingLabel="Saving…"
      onClose={onClose}
    >
      {isNew && (
        <p className="text-sm text-slate-600">
          Adding a {config.label} to “{parent.title}”.
        </p>
      )}
      <TextField label="Title" required data-autofocus {...form.field('title')} />
      <TextField
        label="Slug"
        hint={isNew ? 'Optional. Leave blank to generate it from the title. Must be unique here.' : 'Lowercase letters, numbers and hyphens. Must be unique here.'}
        {...form.field('slug')}
      />
      <TextareaField label="Description" rows={3} {...form.field('description')} />
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
      <span className="sr-only">{label} form</span>
    </FormModal>
  );
}