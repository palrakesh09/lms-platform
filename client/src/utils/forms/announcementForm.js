import { collect, lengthError } from './common.js';

export const emptyAnnouncementValues = Object.freeze({ title: '', message: '', audienceType: 'course_students', courseId: '' });

export const announcementToFormValues = (a) => ({ title: a.title ?? '', message: a.message ?? '', audienceType: a.audienceType ?? 'course_students', courseId: a.course ?? '' });

export const validateAnnouncementForm = (values, { isAdmin }) =>
  collect([
    ['title', lengthError('Title', values.title, { min: 2, max: 150 })],
    ['message', lengthError('Message', values.message, { min: 1, max: 1000 })],
    ['audienceType', isAdmin || values.audienceType === 'course_students' ? null : 'Mentors can only announce to a course'],
    ['courseId', values.audienceType === 'course_students' && !values.courseId ? 'Choose a course' : null],
  ]);

// courseId is sent only for course_students; the server re-checks who may target what.
export const buildAnnouncementPayload = (values) => ({
  title: values.title.trim(),
  message: values.message.trim(),
  audienceType: values.audienceType,
  ...(values.audienceType === 'course_students' ? { courseId: values.courseId } : {}),
});