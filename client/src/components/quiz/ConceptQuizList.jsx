import { Link } from 'react-router';
import { useCallback } from 'react';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { getQuizzesForConcept } from '../../services/quizService.js';
import Icon from '../common/Icon.jsx';

// Shown on the learning page for a resource's concept — the only student-facing discovery path for
// quizzes, since the course structure endpoint deliberately doesn't include them (Phase 9 doesn't
// modify it). Renders nothing while loading or if the concept has no published quizzes.
export default function ConceptQuizList({ conceptId }) {
  const fetcher = useCallback((signal) => getQuizzesForConcept(conceptId, signal), [conceptId]);
  const { status, data } = useApiResource(fetcher);

  if (status !== REQUEST_STATUS.SUCCESS || data.length === 0) return null;

  return (
    <section aria-labelledby="concept-quizzes-heading" className="mt-8 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
      <h2 id="concept-quizzes-heading" className="text-sm font-semibold text-indigo-900">Test your understanding</h2>
      <ul className="mt-2 space-y-1">
        {data.map((quiz) => (
          <li key={quiz.id}>
            <Link to={`/quiz/${quiz.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700 hover:underline">
              <Icon name="clipboard" className="size-4" />
              {quiz.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}