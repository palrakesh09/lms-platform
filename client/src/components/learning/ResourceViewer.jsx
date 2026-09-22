import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useResource } from '../../hooks/useResource.js';
import { ROUTES } from '../../utils/paths.js';
import { getSafeUrl } from '../../utils/safeUrl.js';
import { primaryButton } from '../common/buttonClasses.js';
import Icon from '../common/Icon.jsx';
import Skeleton, { LoadingRegion } from '../common/Skeleton.jsx';
import CompletionToggle from './CompletionToggle.jsx';
import ResourceItem from './ResourceItem.jsx';
import ResourceTypeBadge from './ResourceTypeBadge.jsx';
import ConceptQuizList from '../quiz/ConceptQuizList.jsx';

// Shows one resource. Title, type and the Open button come from the already-loaded structure. The
// description is fetched separately because the structure endpoint omits it. Nothing is embedded:
// external pages are only ever opened by the user through a plain link.
export default function ResourceViewer({ entry, courseId, completed, onCompletionChange }) {
  const { resource, concept, topic, module } = entry;
  const { status, data, reload } = useResource(resource.id);

  const safeUrl = getSafeUrl(resource.url);
  const opensInNewTab = resource.openInNewTab !== false;
  const siblings = concept.resources ?? [];

  const detail = status === REQUEST_STATUS.SUCCESS && data?.id === resource.id && data?.concept === concept.id ? data : null;

  return (
    <article aria-labelledby="resource-title">
      <ol aria-label="Location in course" className="flex flex-wrap items-center gap-1 text-xs text-slate-600">
        {[module.title, topic.title, concept.title].map((label, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <Icon name="chevron-right" className="size-3" />}
            <span className="wrap-break-word">{label}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4">
        <ResourceTypeBadge type={resource.type} />
      </div>
      <h1 id="resource-title" className="mt-3 wrap-break-word text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {resource.title}
      </h1>

      <div className="mt-4">
        <CompletionToggle conceptId={concept.id} completed={completed} onChanged={onCompletionChange} />
      </div>

      <div className="mt-4">
        {status === REQUEST_STATUS.LOADING && (
          <LoadingRegion label="Loading description…" className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </LoadingRegion>
        )}
        {status === REQUEST_STATUS.ERROR && (
          <p className="text-sm text-slate-600">
            The description couldn&apos;t be loaded.{' '}
            <button type="button" onClick={reload} className="font-medium text-indigo-700 underline">
              Retry
            </button>
          </p>
        )}
        {status === REQUEST_STATUS.SUCCESS &&
          (detail?.description ? (
            <p className="whitespace-pre-line wrap-break-word leading-relaxed text-slate-700">{detail.description}</p>
          ) : (
            <p className="text-sm italic text-slate-600">No description provided.</p>
          ))}
      </div>

      {safeUrl ? (
        <div className="mt-6">
          <a href={safeUrl} target={opensInNewTab ? '_blank' : undefined} rel="noopener noreferrer" className={primaryButton}>
            Open Resource
            <Icon name="external-link" className="size-4" />
            {opensInNewTab && <span className="sr-only">(opens in a new tab)</span>}
          </a>
          <p className="mt-2 text-xs text-slate-600">
            Opens {new URL(safeUrl).hostname} {opensInNewTab ? 'in a new tab' : 'in this tab'}.
          </p>
        </div>
      ) : (
        <p role="alert" className="mt-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-inset ring-amber-200">
          This resource doesn&apos;t have a valid link, so it can&apos;t be opened. Please let your mentor know.
        </p>
      )}

      {siblings.length > 1 && (
        <section aria-labelledby="concept-resources-heading" className="mt-10 border-t border-slate-200 pt-6">
          <h2 id="concept-resources-heading" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            In this concept
          </h2>
          <ul className="mt-3 space-y-0.5">
            {siblings.map((sibling) => (
              <li key={sibling.id}>
                <ResourceItem resource={sibling} to={ROUTES.learn(courseId, sibling.id)} isActive={sibling.id === resource.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

            <ConceptQuizList conceptId={concept.id} />
    </article>
  );
}