import { useToast } from '../../../hooks/useToast.js';
import { setUserRole, setUserStatus } from '../../../services/userService.js';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';

// Deactivating, reactivating and role changes are always confirmed. The API refuses admin accounts and
// the caller's own account, and the table doesn't offer these actions for them.
const ACTIONS = {
  deactivate: {
    title: 'Deactivate this user?',
    confirmLabel: 'Deactivate',
    pendingLabel: 'Deactivating…',
    tone: 'danger',
    run: (userId) => setUserStatus(userId, false),
    done: 'User deactivated.',
    body: (user) => <p>{user.name} will immediately lose access and won&apos;t be able to log in until you reactivate them.</p>,
  },
  activate: {
    title: 'Reactivate this user?',
    confirmLabel: 'Reactivate',
    pendingLabel: 'Reactivating…',
    tone: 'primary',
    run: (userId) => setUserStatus(userId, true),
    done: 'User reactivated.',
    body: (user) => <p>{user.name} will be able to log in again.</p>,
  },
  'make-mentor': {
    title: 'Make this user a mentor?',
    confirmLabel: 'Make mentor',
    pendingLabel: 'Saving…',
    tone: 'primary',
    run: (userId) => setUserRole(userId, 'mentor'),
    done: 'User is now a mentor.',
    body: (user) => (
      <p>{user.name} will be able to manage content in the courses you assign them to. They have no access until you assign one.</p>
    ),
  },
  'make-student': {
    title: 'Make this user a student?',
    confirmLabel: 'Make student',
    pendingLabel: 'Saving…',
    tone: 'danger',
    run: (userId) => setUserRole(userId, 'student'),
    done: 'User is now a student.',
    body: (user) => <p>{user.name} will lose mentor access and be removed from every course they were assigned to.</p>,
  },
};

export default function UserActionDialog({ action, user, onClose, onDone }) {
  const { notify } = useToast();
  const config = ACTIONS[action];

  return (
    <ConfirmDialog
      title={config.title}
      confirmLabel={config.confirmLabel}
      pendingLabel={config.pendingLabel}
      tone={config.tone}
      onClose={onClose}
      onConfirm={async () => {
        await config.run(user.id);
        notify(config.done);
        onDone();
      }}
    >
      {config.body(user)}
    </ConfirmDialog>
  );
}