import { Link } from 'react-router';
import {
  TYPE_LABELS,
  toSafeInternalPath,
} from '../../utils/searchUtils.js';
import StatusBadge from '../common/StatusBadge.jsx';

const context = (result) =>
  [
    result.courseTitle,
    [
      result.moduleTitle,
      result.topicTitle,
      result.conceptTitle,
    ]
      .filter(Boolean)
      .join(' › '),
  ]
    .filter(Boolean)
    .join(' · ');

export default function SearchResultItem({
  result,
}) {
  return (
    <Link
      to={toSafeInternalPath(result.url)}
      className="group block border border-neutral-800 bg-[#111111] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3A3A3A] hover:bg-[#171717] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00] sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="border border-neutral-700 bg-[#0A0A0A] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-500">
          {TYPE_LABELS[result.type]}
        </span>

        {result.resourceType && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
            {result.resourceType}
          </span>
        )}

        {result.status && (
          <StatusBadge
            status={result.status}
          />
        )}

        {result.type === 'course' &&
          result.enrolled && (
            <StatusBadge
              status="active"
              label="Enrolled"
            />
          )}
      </div>

      <div className="mt-3 flex items-start gap-3">
        <span className="mt-1 h-2 w-2 shrink-0 bg-[#FF3E00] opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="min-w-0">
          <h3 className="break-words text-base font-semibold text-white">
            {result.title}
          </h3>

          {context(result) && (
            <p className="mt-1 break-words text-xs leading-5 text-neutral-600">
              {context(result)}
            </p>
          )}

          {result.description && (
            <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-neutral-400">
              {result.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}