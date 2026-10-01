import { useCallback } from 'react';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { useForm } from '../../hooks/useForm.js';
import { createAnnouncement, updateAnnouncement } from '../../services/announcementService.js';
import { getCourses } from '../../services/courseService.js';
import { AUDIENCE_LABELS } from '../../utils/notificationUtils.js';
import {
  announcementToFormValues,
  buildAnnouncementPayload,
  emptyAnnouncementValues,
  validateAnnouncementForm,
} from '../../utils/forms/announcementForm.js';
import { SelectField, TextField, TextareaField } from '../common/FormControls.jsx';
import FormModal from '../common/FormModal.jsx';

export default function AnnouncementFormModal({
  mode,
  announcement,
  isAdmin,
  onClose,
  onSaved,
}) {
  const isNew = mode === 'create';

  const courses = useApiResource(
    useCallback((signal) => getCourses({ limit: 50 }, signal), [])
  );

  const form = useForm({
    initialValues: isNew
      ? emptyAnnouncementValues
      : announcementToFormValues(announcement),

    validate: (values) => validateAnnouncementForm(values, { isAdmin }),

    onSubmit: async (values) => {
      const payload = buildAnnouncementPayload(values);

      onSaved(
        isNew
          ? await createAnnouncement(payload)
          : await updateAnnouncement(announcement.id, payload)
      );
    },
  });

  const audienceOptions = (
    isAdmin
      ? Object.keys(AUDIENCE_LABELS)
      : ['course_students']
  ).map((value) => ({
    value,
    label: AUDIENCE_LABELS[value],
  }));

  const courseOptions = [
    {
      value: '',
      label: 'Choose a course',
    },
    ...(courses.status === REQUEST_STATUS.SUCCESS
      ? courses.data.items.map((course) => ({
          value: course.id,
          label: course.title,
        }))
      : []),
  ];

  return (
    <FormModal
      title={isNew ? 'New announcement' : 'Edit announcement'}
      form={form}
      submitLabel={isNew ? 'Save draft' : 'Save changes'}
      pendingLabel="Saving…"
      onClose={onClose}
    >
      <div className="space-y-5">
        <TextField
          label="Title"
          required
          data-autofocus
          {...form.field('title')}
        />

        <TextareaField
          label="Message"
          required
          rows={5}
          hint="Up to 1000 characters. Plain text."
          {...form.field('message')}
        />

        <SelectField
          label="Audience"
          required
          options={audienceOptions}
          {...form.field('audienceType')}
        />

        {form.values.audienceType === 'course_students' && (
          <SelectField
            label="Course"
            required
            options={courseOptions}
            hint="Delivered to students enrolled in this course."
            {...form.field('courseId')}
          />
        )}

        <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-3">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 bg-[#FF3E00]" />

            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                Draft mode
              </p>

              <p className="mt-1 text-xs leading-5 text-neutral-400">
                Saving creates a draft. Nothing is sent until you publish it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}