import Icon from '../common/Icon.jsx';
import { formatFileSize } from '../../utils/mediaUtils.js';

const CATEGORY_LABELS = {
  image: 'IMAGE',
  video: 'VIDEO',
  audio: 'AUDIO',
  document: 'DOCUMENT',
  file: 'FILE',
};

export default function MediaPreview({
  src,
  name,
  size,
  category,
}) {
  const label =
    CATEGORY_LABELS[category] ||
    String(category || 'file').toUpperCase();

  return (
    <div className="group border border-[var(--lms-border)] bg-[#0D0D0D] transition hover:border-white/20">
      <div className="flex items-center gap-4 p-3">
        {/* Preview */}
        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden border border-[var(--lms-border)] bg-[#080808]">
          {category === 'image' && src ? (
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon
              name="clipboard"
              className="size-5 text-[var(--lms-muted)]"
            />
          )}
        </div>

        {/* Information */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-white">
              {name}
            </p>

            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--lms-accent)]">
              {label}
            </span>
          </div>

          {size !== undefined && (
            <p className="mt-1 font-mono text-[10px] text-[var(--lms-muted)]">
              {formatFileSize(size)}
            </p>
          )}
        </div>

        {/* Status */}
        <span className="hidden font-mono text-[9px] uppercase tracking-wider text-[var(--lms-muted)] sm:block">
          READY
        </span>
      </div>
    </div>
  );
}