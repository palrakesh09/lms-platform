import { padNumber, pluralize } from '../../../utils/formatters.js';
import NodeActions from './NodeActions.jsx';
import ResourceManager from './ResourceManager.jsx';
import ConceptQuizzes from './ConceptQuizzes.jsx';
import TreeNode from './TreeNode.jsx';
import { useContentActions } from './ContentActionsContext.js';

export default function ConceptManager({ concept, index, area }) {
  const { expanded } = useContentActions();
  const resources = concept.resources ?? [];

  return (
    <TreeNode
      id={concept.id}
      level="concept"
      eyebrow={`Concept ${padNumber(index + 1)}`}
      title={concept.title}
      status={concept.status}
      order={concept.order}
      count={pluralize(resources.length, 'resource')}
      actions={<NodeActions entity="concept" node={concept} addEntity="resource" />}
    >
      {resources.length === 0 ? (
        <p className="text-sm text-slate-600">No resources in this concept.</p>
      ) : (
        <ul className="space-y-0.5">
          {resources.map((resource) => (
            <ResourceManager key={resource.id} resource={resource} />
          ))}
        </ul>
      )}
      {expanded.has(concept.id) && <ConceptQuizzes concept={concept} area={area} />}
    </TreeNode>
  );
}