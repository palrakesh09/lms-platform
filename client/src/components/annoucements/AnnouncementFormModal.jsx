import { useCallback } from 'react';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { useForm } from '../../hooks/useForm.js';
import { createAnnouncement, updateAnnouncement } from '../../services/announcementService.js';
import { getCourses } from '../../services/courseService.js';
import { AUDIENCE_LABELS } from '../../utils/notificationUtils.js';
import { announcementToFormValues, buildAnnouncementPayload, emptyAnnouncementValues, validateAnnouncementForm } from '../../utils/forms/announcementForm.js';
import { SelectField, TextField, TextareaField } from '../common/FormControls.jsx';
import FormModal from '../common/FormModal.jsx';

// Mentors only ever see the course audience. The API enforces this regardless of what the UI offers.
export default function AnnouncementFormModal({ mode, announcement, isAdmin, onClose, onSaved }) {
  const isNew = mode === 'create';
  const courses = useApiResource(useCallback((signal) => getCourses({ limit: 50 }, signal), []));

  const form = useForm({
    initialValues: isNew ? emptyAnnouncementValues : announcementToFormValues(announcement),
    validate: (values) => validateAnnouncementForm(values, { isAdmin }),
    onSubmit: async (values) => {
      const payload = buildAnnouncementPayload(values);
      onSaved(isNew ? await createAnnouncement(payload) : await updateAnnouncement(announcement.id, payload));
    },
  });

  const audienceOptions = (isAdmin ? Object.keys(AUDIENCE_LABELS) : ['course_students']).map((value) => ({ value, label: AUDIENCE_LABELS[value] }));
  const courseOptions = [{ value: '', label: 'Choose a course' }, ...(courses.status === REQUEST_STATUS.SUCCESS ? courses.data.items.map((c) => ({ value: c.id, label: c.title })) : [])];

  return (
    <FormModal title={isNew ? 'New announcement' : 'Edit announcement'} form={form} submitLabel={isNew ? 'Save draft' : 'Save changes'} pendingLabel="Saving…" onClose={onClose}>
      <TextField label="Title" required data-autofocus {...form.field('title')} />
      <TextareaField label="Message" required rows={4} hint="Up to 1000 characters. Plain text." {...form.field('message')} />
      <SelectField label="Audience" required options={audienceOptions} {...form.field('audienceType')} />
      {form.values.audienceType === 'course_students' && (
        <SelectField label="Course" required options={courseOptions} hint="Delivered to students enrolled in this course." {...form.field('courseId')} />
      )}
      <p className="text-xs text-slate-600">Saving creates a draft. Nothing is sent until you publish it.</p>
    </FormModal>
  );
}