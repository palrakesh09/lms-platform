import { getResourceTypeMeta } from '../../utils/resourceTypes.js';
import Icon from '../common/Icon.jsx';

export default function ResourceTypeBadge({ type }) {
  const meta = getResourceTypeMeta(type);

  return (
    <span className="inline-flex items-center gap-2 border border-[#FF3E00]/30 bg-[#FF3E00]/5 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#FF6A3D]">
      <Icon
        name={meta.icon}
        className="size-3.5"
      />

      {meta.label}
    </span>
  );
}