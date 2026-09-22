import { padNumber, pluralize } from '../../../utils/formatters.js';
import ConceptManager from './ConceptManager.jsx';
import NodeActions from './NodeActions.jsx';
import TreeNode from './TreeNode.jsx';

export default function TopicManager({ topic, index }) {
  const concepts = topic.concepts ?? [];

  return (
    <TreeNode
      id={topic.id}
      level="topic"
      eyebrow={`Topic ${padNumber(index + 1)}`}
      title={topic.title}
      status={topic.status}
      order={topic.order}
      count={pluralize(concepts.length, 'concept')}
      actions={<NodeActions entity="topic" node={topic} addEntity="concept" />}
    >
      {concepts.length === 0 ? (
        <p className="text-sm text-slate-600">No concepts in this topic.</p>
      ) : (
        <ul className="space-y-2">
          {concepts.map((concept, conceptIndex) => (
            <ConceptManager key={concept.id} concept={concept} index={conceptIndex} />
          ))}
        </ul>
      )}
    </TreeNode>
  );
}