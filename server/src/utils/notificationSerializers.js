const idOf = (value) => (value === null || value === undefined ? null : String(value));

// Destination derived from TRUSTED ids only; nothing URL-shaped is ever stored or accepted.
export const notificationLink = (n) => {
  const course = idOf(n.course);
  const entity = idOf(n.entityId);
  switch (n.type) {
    case 'resource_published': return course && entity ? `/learn/${course}/resource/${entity}` : course ? `/courses/${course}` : null;
    case 'quiz_published': return entity ? `/quiz/${entity}` : null;
    case 'quiz_result': return idOf(n.parentId) && entity ? `/quiz/${idOf(n.parentId)}/result/${entity}` : null;
    case 'course_completed': return '/my-learning';
    case 'concept_completed': return course ? `/learn/${course}` : null;
    case 'course_published':
    case 'course_updated':
    case 'enrollment':
    case 'announcement': return course ? `/courses/${course}` : null;
    default: return null;
  }
};

export const toNotification = (n) => ({
  id: idOf(n._id),
  type: n.type,
  title: n.title,
  message: n.message,
  isRead: n.isRead,
  readAt: n.readAt,
  createdAt: n.createdAt,
  link: notificationLink(n),
});

const activityLink = (a) => {
  const course = idOf(a.course?._id ?? a.course);
  switch (a.type) {
    case 'resource_viewed': return course && a.resource ? `/learn/${course}/resource/${idOf(a.resource)}` : null;
    case 'concept_completed': return course ? `/learn/${course}` : null;
    case 'quiz_started': return a.quiz ? `/quiz/${idOf(a.quiz)}` : null;
    case 'quiz_submitted':
    case 'quiz_passed':
    case 'quiz_failed': return a.quiz && a.metadata?.attemptId ? `/quiz/${idOf(a.quiz)}/result/${a.metadata.attemptId}` : a.quiz ? `/quiz/${idOf(a.quiz)}` : null;
    case 'course_completed': return '/my-learning';
    default: return course ? `/courses/${course}` : null;
  }
};

export const toActivity = (a) => ({
  id: idOf(a._id),
  type: a.type,
  title: a.title,
  courseId: idOf(a.course?._id ?? a.course),
  courseTitle: a.course?.title ?? null,
  createdAt: a.createdAt,
  link: activityLink(a),
});

export const toAnnouncement = (a, user) => ({
  id: idOf(a._id),
  title: a.title,
  message: a.message,
  audienceType: a.audienceType,
  course: idOf(a.course?._id ?? a.course),
  courseTitle: a.course?.title ?? null,
  status: a.status,
  publishedAt: a.publishedAt,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
  ...(user.role !== 'student' ? { createdBy: idOf(a.createdBy) } : {}),
});