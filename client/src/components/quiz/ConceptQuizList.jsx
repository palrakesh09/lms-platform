import { Link } from 'react-router';
import { useCallback } from 'react';
import {
  REQUEST_STATUS,
  useApiResource,
} from '../../hooks/useApiResource.js';
import { getQuizzesForConcept } from '../../services/quizService.js';
import Icon from '../common/Icon.jsx';

export default function ConceptQuizList({ conceptId }) {
  const fetcher = useCallback(
    (signal) => getQuizzesForConcept(conceptId, signal),
    [conceptId]
  );

  const { status, data } = useApiResource(fetcher);

  if (status !== REQUEST_STATUS.SUCCESS || data.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="concept-quizzes-heading"
      className="
        mt-8 overflow-hidden
        border border-[#2A2A2A]
        bg-[#111111]
      "
    >
      <div className="border-b border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 sm:px-5">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF3E00]">
          Knowledge check
        </p>

        <h2
          id="concept-quizzes-heading"
          className="mt-1 text-sm font-semibold text-white"
        >
          Test your understanding
        </h2>
      </div>

      <ul className="divide-y divide-[#2A2A2A]">
        {data.map((quiz, index) => (
          <li key={quiz.id}>
            <Link
              to={`/quiz/${quiz.id}`}
              className="
                group flex min-h-12
                items-center gap-3
                px-4 py-3
                transition-colors duration-200
                hover:bg-[#171717]
                sm:px-5
              "
            >
              <span className="
                flex size-7 shrink-0
                items-center justify-center
                border border-[#2A2A2A]
                bg-[#0A0A0A]
                font-mono text-[10px]
                text-neutral-500
                group-hover:border-[#FF3E00]
                group-hover:text-[#FF3E00]
              ">
                {String(index + 1).padStart(2, '0')}
              </span>

              <Icon
                name="clipboard"
                className="size-4 shrink-0 text-neutral-500 group-hover:text-[#FF3E00]"
              />

              <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-300 group-hover:text-white">
                {quiz.title}
              </span>

              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 group-hover:text-[#FF3E00]">
                Start
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}