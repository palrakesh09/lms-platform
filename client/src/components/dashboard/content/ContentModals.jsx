import { useCallback } from 'react';
import { REQUEST_STATUS, useApiResource } from '../../../hooks/useApiResource.js';
import { useToast } from '../../../hooks/useToast.js';
import { formatLabel } from '../../../utils/formatters.js';
import ApiErrorState from '../../common/ApiErrorState.jsx';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import Modal from '../../common/Modal.jsx';
import Skeleton, { LoadingRegion } from '../../common/Skeleton.jsx';
import { CONTENT_ENTITIES } from './contentEntities.js';
import NodeFormModal from './NodeFormModal.jsx';
import ResourceFormModal from './ResourceFormModal.jsx';

// Editing loads the full record first: the structure endpoint leaves out descriptions, and a fresh
// copy avoids overwriting someone else's change with stale text.
function EditContentModal({ modal, onClose, onSaved }) {
  const config = CONTENT_ENTITIES[modal.entity];
  const fetcher = useCallback((signal) => config.api.get(modal.node.id, signal), [config, modal.node.id]);
  const { status, data, error, reload } = useApiResource(fetcher);
  const Form = modal.entity === 'resource' ? ResourceFormModal : NodeFormModal;

  if (status === REQUEST_STATUS.SUCCESS) {
    return <Form mode="edit" entity={modal.entity} item={data} onClose={onClose} onSaved={onSaved} />;
  }

  return (
    <Modal title={`Edit ${config.label}`} onClose={onClose}>
      <div className="p-5">
        {status === REQUEST_STATUS.LOADING ? (
          <LoadingRegion label={`Loading ${config.label}…`} className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-20 w-full" />
          </LoadingRegion>
        ) : (
          <ApiErrorState error={error} subject={config.label} onRetry={reload} />
        )}
      </div>
    </Modal>
  );
}

// The one place the tree's create, edit and delete dialogs are chosen.
// `modal` is { kind: 'create' | 'edit' | 'delete', entity, parent?, node? }.
// `onDone({ parentId })` tells the tree to refresh (and to open the parent after a create).
export default function ContentModals({ modal, onClose, onDone }) {
  const { notify } = useToast();
  const config = CONTENT_ENTITIES[modal.entity];
  const Label = formatLabel(config.label);

  if (modal.kind === 'delete') {
    return (
      <ConfirmDialog
        title={`Delete ${config.label}?`}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        tone="danger"
        onClose={onClose}
        onConfirm={async () => {
          await config.api.remove(modal.node.id);
          notify(`${Label} deleted.`);
          onDone({});
        }}
      >
        <p>“{modal.node.title}” will be permanently deleted. This action cannot be undone.</p>
        {config.deleteHint && <p>{config.deleteHint}</p>}
      </ConfirmDialog>
    );
  }

  if (modal.kind === 'edit') {
    return (
      <EditContentModal
        modal={modal}
        onClose={onClose}
        onSaved={() => {
          notify(`${Label} updated.`);
          onDone({});
          onClose();
        }}
      />
    );
  }

  const Form = modal.entity === 'resource' ? ResourceFormModal : NodeFormModal;

  return (
    <Form
      mode="create"
      entity={modal.entity}
      parent={modal.parent}
      onClose={onClose}
      onSaved={() => {
        notify(`${Label} created.`);
        onDone({ parentId: modal.parent.id });
        onClose();
      }}
    />
  );
}