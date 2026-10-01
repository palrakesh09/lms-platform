import { getSafeUrl } from '../../../utils/safeUrl.js';

export default function ImageBlock({ block, resolvedSrc }) {
  const src = block.mediaId
    ? resolvedSrc
    : getSafeUrl(block.url);

  if (!src) {
    return null;
  }

  return (
    <figure className="overflow-hidden border border-[#2A2A2A] bg-[#111111]">
      <img
        src={src}
        alt={block.alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="block max-w-full object-contain"
      />

      {block.caption && (
        <figcaption className="border-t border-[#2A2A2A] px-3 py-2 font-mono text-[11px] leading-5 text-neutral-500 sm:px-4">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

