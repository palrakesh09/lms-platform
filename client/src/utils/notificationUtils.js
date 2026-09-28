import { formatDate } from './formatters.js';

const UNITS = [['day', 86400000], ['hour', 3600000], ['minute', 60000]];

// "just now", "5 minutes ago", "2 hours ago", "3 days ago"; older than a week falls back to a date.
export const formatRelativeTime = (value, now = Date.now()) => {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.max(0, now - then);
  if (diff >= 7 * 86400000) return formatDate(value);
  for (const [unit, ms] of UNITS) {
    if (diff >= ms) {
      const n = Math.floor(diff / ms);
      return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
};

export const formatBadgeCount = (count) => (count > 99 ? '99+' : String(Math.max(0, count)));

// Links come from the server and are validated again here: only plain in-app paths are followed.
export const safeLink = (link) => (typeof link === 'string' && link.startsWith('/') && !link.startsWith('//') ? link : null);

export const activityLabel = ({ type, title }) => {
  const t = title || 'an item';
  switch (type) {
    case 'course_enrolled': return `Enrolled in ${t}`;
    case 'resource_viewed': return `Viewed ${t}`;
    case 'concept_completed': return `Completed ${t}`;
    case 'quiz_started': return `Started ${t}`;
    case 'quiz_submitted': return `Submitted ${t}`;
    case 'quiz_passed': return `Passed ${t}`;
    case 'quiz_failed': return `Did not pass ${t}`;
    case 'course_completed': return `Completed the course ${t}`;
    default: return t;
  }
};

export const AUDIENCE_LABELS = { all_students: 'All students', enrolled_students: 'All enrolled students', course_students: 'Students in one course' };