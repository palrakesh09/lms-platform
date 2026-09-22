import { smallButton, smallDangerButton } from '../../common/buttonClasses.js';
import Icon from '../../common/Icon.jsx';
import { CONTENT_ENTITIES } from './contentEntities.js';
import { useContentActions } from './ContentActionsContext.js';

// Add (child), Edit and Delete for one row. Every button names its target for screen readers.
// `addEntity` is the child level (for example 'topic' on a module row). Resources have none.
export default function NodeActions({ entity, node, addEntity }) {
  const { requestCreate, requestEdit, requestDelete } = useContentActions();
  const label = CONTENT_ENTITIES[entity].label;
  const addLabel = addEntity && CONTENT_ENTITIES[addEntity].label;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {addEntity && (
        <button
          type="button"
          onClick={() => requestCreate(addEntity, { id: node.id, title: node.title })}
          aria-label={`Add ${addLabel} to ${label}: ${node.title}`}
          className={smallButton}
        >
          <Icon name="plus" className="size-3.5" />
          Add {addLabel}
        </button>
      )}
      <button type="button" onClick={() => requestEdit(entity, node)} aria-label={`Edit ${label}: ${node.title}`} className={smallButton}>
        <Icon name="pencil" className="size-3.5" />
        Edit
      </button>
      <button type="button" onClick={() => requestDelete(entity, node)} aria-label={`Delete ${label}: ${node.title}`} className={smallDangerButton}>
        <Icon name="trash" className="size-3.5" />
        Delete
      </button>
    </div>
  );
}