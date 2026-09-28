import { useCallback } from 'react';
import { Link } from 'react-router';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { searchCourse } from '../../services/searchService.js';
import { toSafeInternalPath } from '../../utils/searchUtils.js';
import Icon from '../common/Icon.jsx';

// Quizzes are not part of the structure payload, so they come from the course-search endpoint (already
// enrollment-checked server-side). Renders nothing while loading, on error, or with no matches.
export default function SidebarQuizMatches({ courseId, query, onNavigate }) {
  const fetcher = useCallback((signal) => searchCourse(courseId, { q: query, type: 'quiz', limit: 5 }, signal), [courseId, query]);
  const { status, data } = useApiResource(fetcher);
  if (status !== REQUEST_STATUS.SUCCESS || data.items.length === 0) return null;

  return (
    <div className="border-t border-slate-200 px-4 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Quizzes</h3>
      <ul className="mt-1 space-y-1">
        {data.items.map((quiz) => (
          <li key={quiz.id}>
            <Link to={toSafeInternalPath(quiz.url)} onClick={onNavigate} className="flex items-center gap-1.5 text-sm text-indigo-700 hover:underline">
              <Icon name="clipboard" className="size-4 shrink-0" />
              <span className="wrap-break-word">{quiz.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}