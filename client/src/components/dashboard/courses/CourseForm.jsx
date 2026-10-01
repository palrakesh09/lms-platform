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
import {
  SelectField,
  TextField,
  TextareaField,
} from '../../common/FormControls.jsx';
import Icon from '../../common/Icon.jsx';

function FieldSection({ eyebrow, title, description, children }) {
  return (
    <section className="overflow-hidden border border-[var(--lms-border)] bg-[var(--lms-surface)]">
      <div className="border-b border-[var(--lms-border)] px-5 py-4">
        <p className="mono-label text-[var(--lms-accent)]">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-[var(--lms-muted)]">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-5 p-5">
        {children}
      </div>
    </section>
  );
}

export default function CourseForm({ course, area }) {
  const isNew = !course;
  const isAdmin = area === 'admin';

  const navigate = useNavigate();
  const { notify } = useToast();
  const paths = dashboardPaths(area);

  const form = useForm({
    initialValues: course
      ? courseToFormValues(course)
      : emptyCourseValues,

    validate: (values) =>
      validateCourseForm(values, { isAdmin }),

    onSubmit: async (values) => {
      const payload = buildCoursePayload(values, {
        isNew,
        isAdmin,
        original: course,
      });

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
    <form
      onSubmit={form.handleSubmit}
      noValidate
      className="max-w-5xl space-y-5"
    >
      {/* Error */}
      {form.formError && (
        <div
          role="alert"
          className="flex items-start gap-3 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <Icon name="warning" className="mt-0.5 size-4 shrink-0" />
          <span>{form.formError}</span>
        </div>
      )}

      {/* Basic information */}
      <FieldSection
        eyebrow="01 / Identity"
        title="Course identity"
        description="Define the core information students will see throughout the LMS."
      >
        <TextField
          label="Title"
          required
          {...form.field('title')}
        />

        {isAdmin && (
          <TextField
            label="Slug"
            hint={
              isNew
                ? 'Lowercase letters, numbers and hyphens. Leave blank to generate it from the title.'
                : 'Lowercase letters, numbers and hyphens. Must be unique.'
            }
            {...form.field('slug')}
          />
        )}

        <TextField
          label="Short description"
          hint="Shown on course cards. Maximum 200 characters."
          {...form.field('shortDescription')}
        />

        <TextareaField
          label="Description"
          rows={7}
          {...form.field('description')}
        />
      </FieldSection>

      {/* Classification */}
      <FieldSection
        eyebrow="02 / Classification"
        title="Course classification"
        description="Help learners discover the course through category and difficulty."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Category"
            required
            hint="For example: web-development"
            {...form.field('category')}
          />

          <SelectField
            label="Level"
            required
            options={LEVEL_OPTIONS}
            {...form.field('level')}
          />
        </div>
      </FieldSection>

      {/* Visual */}
      <FieldSection
        eyebrow="03 / Visual"
        title="Course thumbnail"
        description="Use an HTTPS image URL for the course cover."
      >
        <TextField
          label="Thumbnail URL"
          type="url"
          placeholder="https://..."
          hint="Optional. An HTTP(S) image URL."
          {...form.field('thumbnail')}
        />

        {form.values.thumbnail && (
          <div className="overflow-hidden border border-[var(--lms-border)] bg-black">
            <div className="flex items-center justify-between border-b border-[var(--lms-border)] px-3 py-2">
              <span className="mono-label">Preview</span>
              <span className="text-xs text-[var(--lms-muted)]">
                COURSE THUMBNAIL
              </span>
            </div>

            <div className="aspect-[16/6]">
              <img
                src={form.values.thumbnail}
                alt="Course thumbnail preview"
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </FieldSection>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--lms-border)] pt-5">
        <div>
          <p className="mono-label">Course status</p>
          <p className="mt-1 text-sm text-[var(--lms-muted)]">
            {isNew
              ? 'New courses are created as drafts.'
              : 'Publishing is handled separately from course editing.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={isNew ? paths.courses : paths.course(course.id)}
            className={secondaryButton}
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={form.isSubmitting}
            className={primaryButton}
          >
            <Icon
              name={isNew ? 'plus' : 'check'}
              className="size-4"
            />

            {form.isSubmitting
              ? 'Saving…'
              : isNew
                ? 'Create course'
                : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  );
}