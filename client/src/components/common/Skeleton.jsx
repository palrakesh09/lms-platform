export default function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={[
        'animate-pulse rounded-sm',
        'bg-[#1A1A1A]',
        'border border-[#242424]',
        className,
      ].join(' ')}
    />
  );
}

// Announces loading to screen readers while the visual skeleton is shown.
export function LoadingRegion({
  label,
  className = '',
  children,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

