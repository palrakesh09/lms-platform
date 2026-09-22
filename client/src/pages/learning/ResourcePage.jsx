import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { primaryButton } from '../../components/common/buttonClasses.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import ResourceViewer from '../../components/learning/ResourceViewer.jsx';
import { useLearning } from '../../hooks/useLearning.js';
import { recordAccess } from '../../services/progressService.js';
import { findEntry } from '../../utils/courseStructure.js';
import { ROUTES } from '../../utils/paths.js';

export default function ResourcePage() {
  const { resourceId } = useParams();
  const { courseId, entries, progress, setConceptCompletion } = useLearning();

  // Membership check: the id must appear in THIS course's structure.
  const entry = useMemo(() => findEntry(entries, resourceId), [entries, resourceId]);

  // Records that the student opened this resource. Best-effort — a failure must never block reading —
  // and it NEVER marks the concept complete; only the explicit toggle in ResourceViewer does that.
  // The ref guards against React StrictMode's double-invoked effects sending the same call twice.
  const recordedRef = useRef(null);
  useEffect(() => {
    if (!entry || recordedRef.current === entry.resource.id) return;
    recordedRef.current = entry.resource.id;
    recordAccess(courseId, entry.concept.id, entry.resource.id).catch(() => {});
  }, [courseId, entry]);

  if (!entry) {
    return (
      <ErrorState title="Resource not found" message="This resource doesn't exist in this course, or you don't have access to it.">
        <Link to={ROUTES.learn(courseId)} className={primaryButton}>
          Go to the first resource
        </Link>
      </ErrorState>
    );
  }

  const completed = Boolean(progress.map.get(entry.concept.id)?.completed);

  return (
    <ResourceViewer key={entry.resource.id} entry={entry} courseId={courseId} completed={completed} onCompletionChange={setConceptCompletion} />
  );
}