import { useState } from 'react';
import { getSafeUrl } from '../../utils/safeUrl.js';
import Icon from '../common/Icon.jsx';

export default function CourseThumbnail({
  src,
  thumbnailUrl,
  className = '',
}) {
  const [failed, setFailed] = useState(false);

  const safeSrc = getSafeUrl(thumbnailUrl || src);

  return (
    <div
      className={`
        group relative aspect-video w-full overflow-hidden
        border border-[#2A2A2A]
        bg-[#0D0D0D]
        ${className}
      `}
    >
      {/* Image */}
      {safeSrc && !failed ? (
        <>
          <img
            src={safeSrc}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="
              h-full w-full object-cover
              transition-transform duration-700 ease-out
              group-hover:scale-[1.05]
            "
          />

          {/* Dark cinematic overlay */}
          <div
            className="
              pointer-events-none absolute inset-0
              bg-gradient-to-t
              from-black/70
              via-black/10
              to-transparent
            "
          />

          {/* Subtle hover overlay */}
          <div
            className="
              pointer-events-none absolute inset-0
              bg-[#FF3E00]/5
              opacity-0 transition-opacity duration-300
              group-hover:opacity-100
            "
          />

          {/* Course label */}
          <div className="pointer-events-none absolute left-3 top-3 sm:left-4 sm:top-4">
            <span
              className="
                inline-flex items-center
                border border-white/10
                bg-black/70
                px-2 py-1
                font-mono text-[8px]
                font-medium uppercase
                tracking-[0.18em]
                text-white
                backdrop-blur-sm
                sm:text-[9px]
              "
            >
              LMS / COURSE
            </span>
          </div>

          {/* Bottom technical line */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
            <span className="h-px w-8 bg-[#FF3E00]" />

            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/60">
              Learn / Build / Ship
            </span>
          </div>
        </>
      ) : (
        /* Fallback */
        <div className="grid-background relative flex h-full flex-col items-center justify-center gap-3">
          {/* Decorative corner */}
          <div className="absolute left-3 top-3 h-4 w-4 border-l border-t border-[#FF3E00]/50" />
          <div className="absolute right-3 top-3 h-4 w-4 border-r border-t border-[#FF3E00]/50" />
          <div className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-[#FF3E00]/50" />
          <div className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-[#FF3E00]/50" />

          <Icon
            name="book"
            className="size-8 text-[#666666] opacity-60 sm:size-9"
          />

          <span
            className="
              font-mono text-[9px]
              uppercase tracking-[0.2em]
              text-[#666666]
            "
          >
            No thumbnail
          </span>
        </div>
      )}
    </div>
  );
}