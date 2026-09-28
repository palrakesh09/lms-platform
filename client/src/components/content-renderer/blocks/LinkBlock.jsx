import { getSafeUrl } from '../../../utils/safeUrl.js';
import Icon from '../../common/Icon.jsx';

export default function LinkBlock({ block }) {
  const href = getSafeUrl(block.url);
  if (!href) return <p className="text-sm text-amber-700">This link is unavailable.</p>;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600">
      <Icon name="external-link" className="size-4 shrink-0" />
      {block.text}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}