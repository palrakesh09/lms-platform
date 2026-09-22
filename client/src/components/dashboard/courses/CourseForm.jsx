import { Link, useNavigate } from 'react-router';
import { useForm } from '../../../hooks/useForm.js';
import { useToast } from '../../../hooks/useToast.js';
import { createCourse, updateCourse } from '../../../services/courseService.js';
import { dashboardPaths } from '../../../utils/dashboardPaths.js';
import { LEVEL_OPTIONS } from '../../../utils/enums.js';
import {
  buildCoursePayload,
  courseToFormValues,
  emptyCourseValues,
  validateCourseForm,
} from '../../../utils/forms/courseForm.js';
import { primaryButton, secondaryButton } from '../../common/buttonClasses.js';
import { SelectField, TextField, TextareaField } from '../../common/FormControls.jsx';

// Create (course === null) or edit a course. Only editable fields are sent. Status, instructors, order and
// audit fields are not part of this form: publishing is a separate confirmed action, mentors are assigned
// on the course page, and createdBy/updatedBy come from the server.
// Mentors edit descriptive fields only (no slug). The API enforces that too.
export default function CourseForm({ course, area }) {
  const isNew = !course;
  const isAdmin = area === 'admin';
  const navigate = useNavigate();
  const { notify } = useToast();
  const paths = dashboardPaths(area);

  const form = useForm({
    initialValues: course ? courseToFormValues(course) : emptyCourseValues,
    validate: (values) => validateCourseForm(values, { isAdmin }),
    onSubmit: async (values) => {
      const payload = buildCoursePayload(values, { isNew, isAdmin, original: course });

      if (isNew) {
        const created = await createCourse(payload);
        notify('Course created. It stays a draft until you publish it.');
        navigate(paths.course(created.id));
      } else {
        await updateCourse(course.id, payload);
        notify('Course updated.');
        navigate(paths.courses);
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate className="max-w-2xl space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {form.formError && (
        <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {form.formError}
        </div>
      )}

      <TextField label="Title" required {...form.field('title')} />

      {isAdmin && (
        <TextField
          label="Slug"
          hint={isNew ? 'Lowercase letters, numbers and hyphens. Leave blank to generate it from the title.' : 'Lowercase letters, numbers and hyphens. Must be unique.'}
          {...form.field('slug')}
        />
      )}

      <TextField label="Short description" hint="Shown on course cards (up to 200 characters)." {...form.field('shortDescription')} />
      <TextareaField label="Description" rows={6} {...form.field('description')} />
      <TextField label="Thumbnail URL" type="url" hint="An http(s) image link. Optional." {...form.field('thumbnail')} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Category" required hint="For example web-development." {...form.field('category')} />
        <SelectField label="Level" required options={LEVEL_OPTIONS} {...form.field('level')} />
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
        <Link to={isNew ? paths.courses : paths.course(course.id)} className={secondaryButton}>
          Cancel
        </Link>
        <button type="submit" disabled={form.isSubmitting} className={primaryButton}>
          {form.isSubmitting ? 'Saving…' : isNew ? 'Create course' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}