import { Link, Navigate } from 'react-router';

import {
  secondaryButton,
} from '../../components/common/buttonClasses.js';
import EmptyState from '../../components/common/EmptyState.jsx';

import { useLearning } from '../../hooks/useLearning.js';
import { findEntry } from '../../utils/courseStructure.js';
import { ROUTES } from '../../utils/paths.js';

export default function LearningIndexPage() {
  const {
    courseId,
    entries,
    progress,
  } = useLearning();

  if (entries.length === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl items-center justify-center">
        <EmptyState
          title="Nothing to learn yet"
          message="No learning resources are available for this course yet."
        >
          <Link
            to={ROUTES.course(courseId)}
            className={secondaryButton}
          >
            Back to course
          </Link>
        </EmptyState>
      </div>
    );
  }

  // Resume the last-accessed resource only if it still
  // exists in the current course structure.
  const resumeEntry = findEntry(
    entries,
    progress.lastAccessed?.resourceId
  );

  const target = resumeEntry ?? entries[0];

  return (
    <Navigate
      replace
      to={ROUTES.learn(
        courseId,
        target.resource.id
      )}
    />
  );
}

