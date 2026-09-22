import { useCallback, useMemo, useState } from 'react';
import { secondaryButton } from '../../common/buttonClasses.js';
import EmptyState from '../../common/EmptyState.jsx';
import Icon from '../../common/Icon.jsx';
import { ContentActionsContext } from './ContentActionsContext.js';
import ContentModals from './ContentModals.jsx';
import ModuleManager from './ModuleManager.jsx';

// The editable course hierarchy. It renders the structure it is given and never edits it locally:
// every change is confirmed by the API, then `onChanged()` re-fetches the structure. This component
// stays mounted during that refresh, so expanded sections and scroll position are kept.
export default function ContentTree({ structure, onChanged }) {
  const modules = structure.modules ?? [];
  const course = structure.course;

  const [expanded, setExpanded] = useState(() => new Set(modules.map((module) => module.id)));
  const [modal, setModal] = useState(null);

  const toggle = useCallback((id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const actions = useMemo(
    () => ({
      expanded,
      toggle,
      requestCreate: (entity, parent) => setModal({ kind: 'create', entity, parent }),
      requestEdit: (entity, node) => setModal({ kind: 'edit', entity, node }),
      requestDelete: (entity, node) => setModal({ kind: 'delete', entity, node }),
    }),
    [expanded, toggle],
  );

  const handleDone = useCallback(
    ({ parentId } = {}) => {
      if (parentId) setExpanded((current) => new Set(current).add(parentId)); // show what was just added
      onChanged();
    },
    [onChanged],
  );

  const addModule = () => actions.requestCreate('module', { id: course.id, title: course.title });

  return (
    <ContentActionsContext.Provider value={actions}>
      {modules.length === 0 ? (
        <EmptyState title="No modules yet" message="No modules have been added yet.">
          <button type="button" onClick={addModule} className={secondaryButton}>
            <Icon name="plus" className="size-4" />
            Add module
          </button>
        </EmptyState>
      ) : (
        <>
          <div className="mb-3 flex justify-end">
            <button type="button" onClick={addModule} className={secondaryButton}>
              <Icon name="plus" className="size-4" />
              Add module
            </button>
          </div>
          <ul className="space-y-3">
            {modules.map((module, index) => (
              <ModuleManager key={module.id} module={module} index={index} />
            ))}
          </ul>
        </>
      )}

      {modal && <ContentModals modal={modal} onClose={() => setModal(null)} onDone={handleDone} />}
    </ContentActionsContext.Provider>
  );
}