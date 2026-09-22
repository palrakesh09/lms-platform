import { useState } from 'react';
import { getSafeUrl } from '../../utils/safeUrl.js';
import Icon from '../common/Icon.jsx';

// The image is decorative (the title sits next to it). A missing, unsafe or broken URL falls back to a placeholder.
export default function CourseThumbnail({ src, className = '' }) {
  const [failed, setFailed] = useState(false);
  const safeSrc = getSafeUrl(src);

  return (
    <div className={`aspect-video overflow-hidden bg-slate-100 ${className}`}>
      {safeSrc && !failed ? (
        <img
          src={safeSrc}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-400">
          <Icon name="book" className="size-10" />
        </div>
      )}
    </div>
  );
}