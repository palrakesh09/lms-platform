import {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { Link, useParams } from 'react-router';

import {
  primaryButton,
} from '../../components/common/buttonClasses.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import ResourceViewer from '../../components/learning/ResourceViewer.jsx';

import { useLearning } from '../../hooks/useLearning.js';
import { recordAccess } from '../../services/progressService.js';
import { findEntry } from '../../utils/courseStructure.js';
import { ROUTES } from '../../utils/paths.js';

export default function ResourcePage() {
  const { resourceId } = useParams();

  const {
    courseId,
    entries,
    progress,
    setConceptCompletion,
  } = useLearning();

  // A resource must belong to this course's structure.
  const entry = useMemo(
    () => findEntry(entries, resourceId),
    [entries, resourceId]
  );

  // Record resource access without blocking reading.
  // Opening a resource does not mark it complete.
  const recordedRef = useRef(null);

  useEffect(() => {
    if (
      !entry ||
      recordedRef.current ===
        entry.resource.id
    ) {
      return;
    }

    recordedRef.current =
      entry.resource.id;

    recordAccess(
      courseId,
      entry.concept.id,
      entry.resource.id
    ).catch(() => {});
  }, [courseId, entry]);

  if (!entry) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl items-center justify-center">
        <ErrorState
          title="Resource not found"
          message="This resource doesn't exist in this course, or you don't have access to it."
        >
          <Link
            to={ROUTES.learn(courseId)}
            className={primaryButton}
          >
            Go to the first resource
          </Link>
        </ErrorState>
      </div>
    );
  }

  const completed = Boolean(
    progress.map.get(
      entry.concept.id
    )?.completed
  );

  return (
    <ResourceViewer
      key={entry.resource.id}
      entry={entry}
      courseId={courseId}
      completed={completed}
      onCompletionChange={
        setConceptCompletion
      }
    />
  );
}

