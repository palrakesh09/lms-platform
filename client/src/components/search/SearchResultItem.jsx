import { Link } from 'react-router';
import { TYPE_LABELS, toSafeInternalPath } from '../../utils/searchUtils.js';
import StatusBadge from '../common/StatusBadge.jsx';

// Context line, e.g. "Full Stack · HTML5 › Forms › Form Validation".
const context = (r) => [r.courseTitle, [r.moduleTitle, r.topicTitle, r.conceptTitle].filter(Boolean).join(' › ')].filter(Boolean).join(' · ');

export default function SearchResultItem({ result }) {
  return (
    <Link to={toSafeInternalPath(result.url)} className="block rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{TYPE_LABELS[result.type]}</span>
        {result.resourceType && <span className="text-xs text-slate-500">{result.resourceType}</span>}
        {result.status && <StatusBadge status={result.status} />}
        {result.type === 'course' && result.enrolled && <StatusBadge status="active" label="Enrolled" />}
        <span className="min-w-0 break-words font-medium text-slate-900">{result.title}</span>
      </div>
      {context(result) && <p className="mt-1 break-words text-xs text-slate-600">{context(result)}</p>}
      {result.description && <p className="mt-1 line-clamp-2 break-words text-sm text-slate-700">{result.description}</p>}
    </Link>
  );
}