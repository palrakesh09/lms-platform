import { getSafeUrl } from '../../../utils/safeUrl.js';
import Icon from '../../common/Icon.jsx';

export default function LinkBlock({ block }) {
  const href = getSafeUrl(block.url);

  if (!href) {
    return (
      <p className="border border-dashed border-[#3A3A3A] bg-[#111111] px-3 py-2 text-sm text-amber-400">
        This link is unavailable.
      </p>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-2 break-all border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm font-semibold text-[#FF3E00] transition hover:border-[#FF3E00] hover:bg-[#171717] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00]"
    >
      <Icon
        name="external-link"
        className="size-4 shrink-0"
      />

      <span>{block.text}</span>

      <span className="sr-only">
        {' '}
        (opens in a new tab)
      </span>
    </a>
  );
}

