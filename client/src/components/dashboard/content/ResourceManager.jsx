import { getSafeUrl } from '../../../utils/safeUrl.js';
import Icon from '../../common/Icon.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import ResourceTypeBadge from '../../learning/ResourceTypeBadge.jsx';
import NodeActions from './NodeActions.jsx';

export default function ResourceManager({ resource }) {
  const safeUrl = getSafeUrl(resource.url);

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md px-2 py-1.5 hover:bg-slate-50">
      <ResourceTypeBadge type={resource.type} />
      <span className="min-w-0 flex-1 basis-48 wrap-break-word text-sm text-slate-900">
        {resource.title}
        <span className="block text-xs text-slate-600">Order {resource.order}</span>
      </span>
      <StatusBadge status={resource.status} />
      {safeUrl ? (
        <a
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open resource in a new tab: ${resource.title}`}
          className="rounded p-1 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600"
        >
          <Icon name="external-link" className="size-4" />
        </a>
      ) : (
        <span className="text-xs font-medium text-amber-800">Invalid link</span>
      )}
      <NodeActions entity="resource" node={resource} />
    </li>
  );
}