// The only place route strings are built. IDs are encoded so a crafted id can never alter the path.
const encode = encodeURIComponent;

export const ROUTES = Object.freeze({
  courses: '/courses',
  course: (courseId) => `/courses/${encode(courseId)}`,
  learn: (courseId, resourceId) =>
    resourceId ? `/learn/${encode(courseId)}/resource/${encode(resourceId)}` : `/learn/${encode(courseId)}`,
});