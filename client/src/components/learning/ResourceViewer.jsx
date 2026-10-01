import { useEffect } from 'react';
import { Link } from 'react-router';

import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useResource } from '../../hooks/useResource.js';
import { useAIAssistant } from '../../hooks/useAIAssistant.js';

import { ROUTES } from '../../utils/paths.js';
import { getSafeUrl } from '../../utils/safeUrl.js';

import Icon from '../common/Icon.jsx';
import Skeleton, { LoadingRegion } from '../common/Skeleton.jsx';

import CompletionToggle from './CompletionToggle.jsx';
import ResourceItem from './ResourceItem.jsx';
import ResourceTypeBadge from './ResourceTypeBadge.jsx';

import ConceptQuizList from '../quiz/ConceptQuizList.jsx';
import ContentRenderer from '../content-renderer/ContentRenderer.jsx';

export default function ResourceViewer({
  entry,
  courseId,
  completed,
  onCompletionChange,
}) {
  const {
    resource,
    concept,
    topic,
    module,
  } = entry;

  const {
    setContext,
    clearContext,
  } = useAIAssistant();

  useEffect(() => {
    setContext({
      type: 'resource',
      id: resource.id,
      title: resource.title,
    });

    return clearContext;
  }, [
    resource.id,
    resource.title,
    setContext,
    clearContext,
  ]);

  const {
    status,
    data,
    reload,
  } = useResource(resource.id);

  const safeUrl = getSafeUrl(resource.url);

  const opensInNewTab =
    resource.openInNewTab !== false;

  const siblings = concept.resources ?? [];

  const detail =
    status === REQUEST_STATUS.SUCCESS &&
    data?.id === resource.id &&
    data?.concept === concept.id
      ? data
      : null;

  return (
    <article
      aria-labelledby="resource-title"
      className="pb-16"
    >
      {/* Breadcrumb */}
      <nav
        aria-label="Course location"
        className="mb-8"
      >
        <ol className="flex flex-wrap items-center gap-2 text-xs">
          <li>
            <Link
              to={ROUTES.course(courseId)}
              className="text-neutral-600 transition-colors hover:text-[#FF3E00]"
            >
              Course
            </Link>
          </li>

          <li>
            <Icon
              name="chevron-right"
              className="size-3 text-neutral-700"
            />
          </li>

          <li className="max-w-[180px] truncate text-neutral-500">
            {module.title}
          </li>

          <li>
            <Icon
              name="chevron-right"
              className="size-3 text-neutral-700"
            />
          </li>

          <li className="max-w-[180px] truncate text-neutral-500">
            {topic.title}
          </li>

          <li>
            <Icon
              name="chevron-right"
              className="size-3 text-neutral-700"
            />
          </li>

          <li className="max-w-[180px] truncate font-medium text-neutral-300">
            {concept.title}
          </li>
        </ol>
      </nav>

      {/* Resource Header */}
      <header className="border-b border-neutral-800 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <ResourceTypeBadge type={resource.type} />

          {completed && (
            <span className="inline-flex items-center gap-1.5 border border-emerald-900/60 bg-emerald-950/20 px-2.5 py-1 text-xs font-medium text-emerald-400">
              <Icon
                name="check"
                className="size-3.5"
              />
              Completed
            </span>
          )}
        </div>

        <h1
          id="resource-title"
          className="mt-5 max-w-4xl break-words text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          {resource.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <CompletionToggle
            conceptId={concept.id}
            completed={completed}
            onChanged={onCompletionChange}
          />

          <span className="hidden h-5 w-px bg-neutral-800 sm:block" />

          <span className="flex items-center gap-2 text-xs text-neutral-600">
            <span className="size-1.5 rounded-full bg-[#FF3E00]" />
            Concept progress
          </span>
        </div>
      </header>

      {/* Description */}
      <section className="mt-8">
        {status === REQUEST_STATUS.LOADING && (
          <LoadingRegion
            label="Loading resource description..."
            className="space-y-3"
          >
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
          </LoadingRegion>
        )}

        {status === REQUEST_STATUS.ERROR && (
          <div className="border border-amber-900/50 bg-amber-950/10 p-4">
            <div className="flex gap-3">
              <Icon
                name="warning"
                className="mt-0.5 size-4 shrink-0 text-amber-500"
              />

              <div>
                <p className="text-sm font-medium text-amber-300">
                  Description couldn't be loaded.
                </p>

                <button
                  type="button"
                  onClick={reload}
                  className="mt-1 text-xs text-amber-500 underline underline-offset-2 hover:text-amber-300"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {status === REQUEST_STATUS.SUCCESS &&
          (detail?.description ? (
            <p className="max-w-3xl whitespace-pre-line break-words text-base leading-8 text-neutral-400">
              {detail.description}
            </p>
          ) : (
            <p className="text-sm italic text-neutral-600">
              No description provided.
            </p>
          ))}
      </section>

      {/* Content */}
      {detail?.content?.blocks?.length > 0 && (
        <section
          aria-label="Resource content"
          className="mt-10 border-t border-neutral-800 pt-10"
        >
          <div className="max-w-4xl">
            <ContentRenderer
              content={detail.content}
            />
          </div>
        </section>
      )}

      {/* External Resource */}
      {safeUrl ? (
        <section className="mt-12 border border-neutral-800 bg-[#111111]">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center border border-neutral-800 bg-neutral-900">
                <Icon
                  name="external-link"
                  className="size-4 text-[#FF3E00]"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  External resource
                </p>

                <p className="mt-1 truncate text-xs text-neutral-600">
                  {new URL(safeUrl).hostname}
                </p>
              </div>
            </div>

            <a
              href={safeUrl}
              target={
                opensInNewTab
                  ? '_blank'
                  : undefined
              }
              rel="noopener noreferrer"
              className="lms-button lms-button-primary shrink-0 justify-center"
            >
              Open Resource
              <Icon
                name="arrow-right"
                className="size-4"
              />

              {opensInNewTab && (
                <span className="sr-only">
                  (opens in a new tab)
                </span>
              )}
            </a>
          </div>
        </section>
      ) : (
        <div
          role="alert"
          className="mt-10 border border-amber-900/50 bg-amber-950/10 p-4"
        >
          <div className="flex gap-3">
            <Icon
              name="warning"
              className="mt-0.5 size-4 shrink-0 text-amber-500"
            />

            <div>
              <p className="text-sm font-medium text-amber-300">
                Resource link unavailable
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-500/70">
                This resource doesn't have a valid link.
                Please contact your mentor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Concept Resources */}
      {siblings.length > 1 && (
        <section
          aria-labelledby="concept-resources-heading"
          className="mt-14 border-t border-neutral-800 pt-8"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mono-label text-[#FF3E00]">
                CONCEPT
              </p>

              <h2
                id="concept-resources-heading"
                className="mt-2 text-xl font-bold text-white"
              >
                More in this concept
              </h2>
            </div>

            <span className="font-mono text-xs text-neutral-600">
              {siblings.length} resources
            </span>
          </div>

          <ul className="mt-5 divide-y divide-neutral-900 border-y border-neutral-800">
            {siblings.map((sibling, index) => (
              <li key={sibling.id}>
                <ResourceItem
                  resource={sibling}
                  to={ROUTES.learn(
                    courseId,
                    sibling.id,
                  )}
                  isActive={
                    sibling.id === resource.id
                  }
                  index={index}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Quiz */}
      <section className="mt-10">
        <ConceptQuizList
          conceptId={concept.id}
        />
      </section>

      {/* Bottom navigation */}
      <div className="mt-12 flex flex-col gap-3 border-t border-neutral-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mono-label">
            CURRENT CONCEPT
          </p>

          <p className="mt-1 text-sm text-neutral-400">
            {concept.title}
          </p>
        </div>

        <Link
          to={ROUTES.course(courseId)}
          className="lms-button lms-button-secondary justify-center"
        >
          <Icon
            name="arrow-left"
            className="size-4"
          />
          Course Overview
        </Link>
      </div>
    </article>
  );
}