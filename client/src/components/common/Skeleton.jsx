export default function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

// Announces loading to screen readers while the visual skeleton is shown.
export function LoadingRegion({ label, className = '', children }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}