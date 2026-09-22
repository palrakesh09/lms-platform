import { padNumber } from '../../utils/formatters.js';
import Disclosure from '../common/Disclosure.jsx';
import { useSidebar } from './SidebarContext.js';
import TopicAccordion from './TopicAccordion.jsx';

export default function ModuleAccordion({ module, index }) {
  const { expanded, toggle } = useSidebar();
  const topics = module.topics ?? [];

  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <Disclosure
        level="module"
        open={expanded.has(module.id)}
        onToggle={() => toggle(module.id)}
        eyebrow={`Module ${padNumber(index + 1)}`}
        title={module.title}
      >
        {topics.length === 0 ? (
          <p className="pb-3 pl-8 pr-4 text-xs text-slate-500">This module has no topics yet.</p>
        ) : (
          <ul className="pb-1">
            {topics.map((topic, topicIndex) => (
              <TopicAccordion key={topic.id} topic={topic} index={topicIndex} />
            ))}
          </ul>
        )}
      </Disclosure>
    </li>
  );
}