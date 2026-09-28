const STAFF_AREA = { admin: 'admin', mentor: 'mentor' };

// Internal links, built per role so a result always opens somewhere the caller may actually go.
export const buildSearchUrl = (row, role) => {
  const course = String(row.courseId);
  const area = STAFF_AREA[role];

  if (area) {
    return row.kind === 'quiz' ? `/${area}/quizzes/${row.id}/questions` : `/${area}/courses/${course}`;
  }
  switch (row.kind) {
    case 'course': return `/courses/${course}`;
    case 'quiz': return `/quiz/${row.id}`;
    case 'resource': return `/learn/${course}/resource/${row.id}`;
    case 'concept': return row.firstResourceId ? `/learn/${course}/resource/${row.firstResourceId}` : `/learn/${course}`;
    default: return `/learn/${course}`; // module/topic: the learning page resumes or opens the first resource
  }
};

const str = (value) => (value === undefined || value === null ? undefined : String(value));

// Explicit whitelist. The aggregation already projects only these fields; audit fields, answer keys and
// internals never reach this function, and none are added here.
export const toSearchResult = (row, scope) => {
  const isStaff = Boolean(STAFF_AREA[scope.role]);
  return {
    id: String(row.id),
    type: row.kind,
    title: row.title,
    description: row.description ?? '',
    courseId: str(row.courseId),
    courseTitle: row.courseTitle,
    moduleTitle: row.moduleTitle,
    topicTitle: row.topicTitle,
    conceptTitle: row.conceptTitle,
    ...(row.resourceType ? { resourceType: row.resourceType } : {}),
    ...(isStaff ? { status: row.status } : {}),
    ...(!isStaff && row.kind === 'course' ? { enrolled: scope.enrolledIds.has(String(row.id)) } : {}),
    url: buildSearchUrl(row, scope.role),
  };
};