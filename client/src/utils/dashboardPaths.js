// The only place dashboard route strings are built. `area` is 'admin' or 'mentor'.
const encode = encodeURIComponent;

export const dashboardPaths = (area) => ({
  home: `/${area}`,
  courses: `/${area}/courses`,
  newCourse: `/${area}/courses/new`,
  course: (courseId) => `/${area}/courses/${encode(courseId)}`,
  editCourse: (courseId) => `/${area}/courses/${encode(courseId)}/edit`,
  users: `/${area}/users`,
});