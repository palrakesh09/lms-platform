import { getSafeUrl } from '../../../utils/safeUrl.js';
import Icon from '../../common/Icon.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import ResourceTypeBadge from '../../learning/ResourceTypeBadge.jsx';
import NodeActions from './NodeActions.jsx';

export default function ResourceManager({ resource }) {
  const safeUrl = getSafeUrl(resource.url);

  return (
    <li className="group border border-[var(--lms-border)] bg-[#0A0A0A]">
      <div className="flex flex-wrap items-center gap-3 px-3 py-3">
        {/* Resource index */}
        <span className="hidden font-mono text-[10px] text-[var(--lms-muted)] sm:block">
          {String(resource.order).padStart(2, '0')}
        </span>

        {/* Type */}
        <ResourceTypeBadge type={resource.type} />

        {/* Main */}
        <div className="min-w-0 flex-1 basis-52">
          <p className="break-words text-sm font-medium text-white">
            {resource.title}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--lms-muted)]">
              ORDER {resource.order}
            </span>

            {(resource.content?.blocks?.length ?? 0) > 0 && (
              <>
                <span className="text-[var(--lms-border)]">/</span>

                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--lms-accent)]">
                  RICH CONTENT
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <StatusBadge status={resource.status} />

        {/* External link */}
        {safeUrl ? (
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open resource in a new tab: ${resource.title}`}
            className="flex size-8 items-center justify-center border border-[var(--lms-border)] text-[var(--lms-muted)] transition hover:border-[var(--lms-accent)] hover:text-white"
          >
            <Icon name="external-link" className="size-4" />
          </a>
        ) : (
          <span className="font-mono text-[10px] uppercase text-amber-400">
            Invalid URL
          </span>
        )}

        {/* Actions */}
        <NodeActions
          entity="resource"
          node={resource}
        />
      </div>
    </li>
  );
}