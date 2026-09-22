import { Link, Navigate } from 'react-router';
import { secondaryButton } from '../../components/common/buttonClasses.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useLearning } from '../../hooks/useLearning.js';
import { findEntry } from '../../utils/courseStructure.js';
import { ROUTES } from '../../utils/paths.js';

// Resume-learning: prefer the student's last-accessed resource, but only if it still exists in the
// CURRENT structure (findEntry doubles as that membership check) — a resource removed since is never
// linked to. Otherwise the first resource in course order. `replace` keeps Back from bouncing here.
export default function LearningIndexPage() {
  const { courseId, entries, progress } = useLearning();

  if (entries.length === 0) {
    return (
      <EmptyState title="Nothing to learn yet" message="No learning resources are available for this course yet.">
        <Link to={ROUTES.course(courseId)} className={secondaryButton}>
          Back to course
        </Link>
      </EmptyState>
    );
  }

  const resumeEntry = findEntry(entries, progress.lastAccessed?.resourceId);
  const target = resumeEntry ?? entries[0];

  return <Navigate replace to={ROUTES.learn(courseId, target.resource.id)} />;
}