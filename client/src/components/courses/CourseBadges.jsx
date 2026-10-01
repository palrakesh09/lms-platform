import { formatLabel } from '../../utils/formatters.js';

const baseBadge =
  'inline-flex items-center border px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.12em] leading-none transition-colors duration-200';

const levelStyles = {
  beginner: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  intermediate: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  advanced: 'border-red-500/30 bg-red-500/10 text-red-400',
};

const getLevelStyle = (level) => {
  const normalized = String(level || '').toLowerCase();

  return (
    levelStyles[normalized] ||
    'border-[#2A2A2A] bg-[#171717] text-[#A3A3A3]'
  );
};

export default function CourseBadges({ course }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      {/* Level */}
      {course.level && (
        <span
          className={`${baseBadge} ${getLevelStyle(course.level)}`}
        >
          {formatLabel(course.level)}
        </span>
      )}

      {/* Category */}
      {course.category && (
        <span
          className={`${baseBadge} border-[#2A2A2A] bg-[#171717] text-[#A3A3A3] hover:border-[#444444] hover:text-white`}
        >
          {formatLabel(course.category)}
        </span>
      )}

      {/* Unpublished status — visible to staff */}
      {course.status && course.status !== 'published' && (
        <span
          className={`${baseBadge} border-amber-500/30 bg-amber-500/10 text-amber-400`}
        >
          {formatLabel(course.status)}
        </span>
      )}
    </div>
  );
}