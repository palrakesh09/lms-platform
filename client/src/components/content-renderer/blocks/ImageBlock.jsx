import { getSafeUrl } from '../../../utils/safeUrl.js';

export default function ImageBlock({ block }) {
  const src = getSafeUrl(block.url);
  if (!src) return null; // unsafe/invalid URL: fail safe, never render an unvetted src

  return (
    <figure>
      <img src={src} alt={block.alt} loading="lazy" referrerPolicy="no-referrer" className="max-w-full rounded-lg border border-slate-200" />
      {block.caption && <figcaption className="mt-1 text-xs text-slate-600">{block.caption}</figcaption>}
    </figure>
  );
}