import { useCallback } from 'react';
import { Link } from 'react-router';
import {
  REQUEST_STATUS,
  useApiResource,
} from '../../hooks/useApiResource.js';
import { searchCourse } from '../../services/searchService.js';
import { toSafeInternalPath } from '../../utils/searchUtils.js';
import Icon from '../common/Icon.jsx';

export default function SidebarQuizMatches({
  courseId,
  query,
  onNavigate,
}) {
  const fetcher = useCallback(
    (signal) =>
      searchCourse(
        courseId,
        {
          q: query,
          type: 'quiz',
          limit: 5,
        },
        signal,
      ),
    [courseId, query],
  );

  const { status, data } =
    useApiResource(fetcher);

  if (
    status !== REQUEST_STATUS.SUCCESS ||
    data.items.length === 0
  ) {
    return null;
  }

  return (
    <div className="border-t border-neutral-800 px-3 py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 bg-[#FF3E00]" />

        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
          Quizzes
        </h3>
      </div>

      <ul className="space-y-1">
        {data.items.map((quiz) => (
          <li key={quiz.id}>
            <Link
              to={toSafeInternalPath(
                quiz.url,
              )}
              onClick={onNavigate}
              className="group flex items-start gap-2 border-l-2 border-transparent px-2 py-2 text-sm text-neutral-400 transition-colors hover:border-[#FF3E00] hover:bg-[#171717] hover:text-white focus-visible:outline-2 focus-visible:outline-[#FF3E00]"
            >
              <Icon
                name="clipboard"
                className="mt-0.5 size-4 shrink-0 text-neutral-600 group-hover:text-[#FF3E00]"
              />

              <span className="break-words">
                {quiz.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}