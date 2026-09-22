import { padNumber, pluralize } from '../../../utils/formatters.js';
import NodeActions from './NodeActions.jsx';
import TopicManager from './TopicManager.jsx';
import TreeNode from './TreeNode.jsx';

export default function ModuleManager({ module, index }) {
  const topics = module.topics ?? [];

  return (
    <TreeNode
      id={module.id}
      level="module"
      eyebrow={`Module ${padNumber(index + 1)}`}
      title={module.title}
      status={module.status}
      order={module.order}
      count={pluralize(topics.length, 'topic')}
      actions={<NodeActions entity="module" node={module} addEntity="topic" />}
    >
      {topics.length === 0 ? (
        <p className="text-sm text-slate-600">No topics in this module.</p>
      ) : (
        <ul className="space-y-2">
          {topics.map((topic, topicIndex) => (
            <TopicManager key={topic.id} topic={topic} index={topicIndex} />
          ))}
        </ul>
      )}
    </TreeNode>
  );
}