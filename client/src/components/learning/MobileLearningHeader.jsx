import { Icon } from "../common/Icon";

export default function MobileLearningHeader({
  onMenuClick,
  title,
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[#0A0A0A]/95 px-4 backdrop-blur md:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-white/20 hover:text-white"
        aria-label="Open course navigation"
      >
        <Icon name="menu" size={17} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--accent)]">
          Learning
        </div>

        <div className="truncate text-xs font-semibold text-white">
          {title || "Course"}
        </div>
      </div>
    </header>
  );
}