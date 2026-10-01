import { useCallback, useMemo, useState } from 'react';
import { secondaryButton } from '../../common/buttonClasses.js';
import EmptyState from '../../common/EmptyState.jsx';
import Icon from '../../common/Icon.jsx';
import { ContentActionsContext } from './ContentActionsContext.js';
import ContentModals from './ContentModals.jsx';
import ModuleManager from './ModuleManager.jsx';

export default function ContentTree({ structure, onChanged }) {
  const modules = structure.modules ?? [];
  const course = structure.course;

  const [expanded, setExpanded] = useState(
    () => new Set(modules.map((module) => module.id)),
  );

  const [modal, setModal] = useState(null);

  const toggle = useCallback((id) => {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const actions = useMemo(
    () => ({
      expanded,
      toggle,

      requestCreate: (entity, parent) =>
        setModal({
          kind: 'create',
          entity,
          parent,
        }),

      requestEdit: (entity, node) =>
        setModal({
          kind: 'edit',
          entity,
          node,
        }),

      requestDelete: (entity, node) =>
        setModal({
          kind: 'delete',
          entity,
          node,
        }),
    }),
    [expanded, toggle],
  );

  const handleDone = useCallback(
    ({ parentId } = {}) => {
      if (parentId) {
        setExpanded(
          (current) =>
            new Set(current).add(parentId),
        );
      }

      onChanged();
    },
    [onChanged],
  );

  const addModule = () => {
    actions.requestCreate('module', {
      id: course.id,
      title: course.title,
    });
  };

  return (
    <ContentActionsContext.Provider value={actions}>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--lms-border)] pb-4">
        <div>
          <p className="mono-label text-[var(--lms-accent)]">
            CONTENT ARCHITECTURE
          </p>

          <h3 className="mt-1 text-lg font-semibold text-white">
            Learning structure
          </h3>

          <p className="mt-1 text-sm text-[var(--lms-muted)]">
            Build the module → topic → concept → resource hierarchy.
          </p>
        </div>

        <button
          type="button"
          onClick={addModule}
          className={secondaryButton}
        >
          <Icon name="plus" className="size-4" />
          Add module
        </button>
      </div>

      {/* Hierarchy */}
      {modules.length === 0 ? (
        <EmptyState
          title="No modules yet"
          message="Start building this course by creating its first module."
        >
          <button
            type="button"
            onClick={addModule}
            className={secondaryButton}
          >
            <Icon name="plus" className="size-4" />
            Add first module
          </button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {modules.map((module, index) => (
            <ModuleManager
              key={module.id}
              module={module}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <ContentModals
          modal={modal}
          onClose={() => setModal(null)}
          onDone={handleDone}
        />
      )}
    </ContentActionsContext.Provider>
  );
}