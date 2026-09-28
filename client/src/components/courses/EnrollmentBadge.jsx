import StatusBadge from '../common/StatusBadge.jsx';

const LABELS = { active: 'Enrolled', completed: 'Completed' };

export default function EnrollmentBadge({ status }) {
  if (!status || status === 'cancelled') return null;
  return <StatusBadge status={status === 'completed' ? 'active' : 'draft'} label={LABELS[status]} />;
}