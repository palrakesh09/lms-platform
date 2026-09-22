import { padNumber } from '../../utils/formatters.js';
import Disclosure from '../common/Disclosure.jsx';
import ConceptItem from './ConceptItem.jsx';
import { useSidebar } from './SidebarContext.js';

export default function TopicAccordion({ topic, index }) {
  const { expanded, toggle } = useSidebar();
  const concepts = topic.concepts ?? [];

  return (
    <li>
      <Disclosure
        level="topic"
        open={expanded.has(topic.id)}
        onToggle={() => toggle(topic.id)}
        eyebrow={`Topic ${padNumber(index + 1)}`}
        title={topic.title}
      >
        {concepts.length === 0 ? (
          <p className="pb-2 pl-12 pr-4 text-xs text-slate-500">This topic has no concepts yet.</p>
        ) : (
          <ul className="mb-2 ml-10 mr-2 border-l border-slate-200 pl-2">
            {concepts.map((concept) => (
              <ConceptItem key={concept.id} concept={concept} />
            ))}
          </ul>
        )}
      </Disclosure>
    </li>
  );
}