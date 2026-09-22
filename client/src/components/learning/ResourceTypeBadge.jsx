import { getResourceTypeMeta } from '../../utils/resourceTypes.js';
import Icon from '../common/Icon.jsx';

export default function ResourceTypeBadge({ type }) {
  const meta = getResourceTypeMeta(type);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.badgeClass}`}
    >
      <Icon name={meta.icon} className="size-3.5" />
      {meta.label}
    </span>
  );
}