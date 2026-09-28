const idOf = (value) => (value === null || value === undefined ? null : String(value));

export const toEnrollment = (enrollment) => ({
  id: idOf(enrollment._id),
  course: idOf(enrollment.course?._id ?? enrollment.course),
  courseTitle: enrollment.course?.title,
  status: enrollment.status,
  enrolledAt: enrollment.enrolledAt,
  completedAt: enrollment.completedAt,
  lastAccessedAt: enrollment.lastAccessedAt,
});

// Admin table view — never exposes the student's password/email beyond name+email, matching the
// existing user.controller.js whitelist pattern.
export const toAdminEnrollment = (enrollment) => ({
  id: idOf(enrollment._id),
  student: { id: idOf(enrollment.student?._id ?? enrollment.student), name: enrollment.student?.name, email: enrollment.student?.email },
  course: { id: idOf(enrollment.course?._id ?? enrollment.course), title: enrollment.course?.title },
  status: enrollment.status,
  enrolledAt: enrollment.enrolledAt,
  completedAt: enrollment.completedAt,
  lastAccessedAt: enrollment.lastAccessedAt,
});