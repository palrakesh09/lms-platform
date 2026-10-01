const LABELS = {
  active: 'Enrolled',
  completed: 'Completed',
};

const STYLES = {
  active: {
    wrapper: 'border-[#FF3E00]/30 bg-[#FF3E00]/10 text-[#FF6A3D]',
    dot: 'bg-[#FF3E00]',
  },

  completed: {
    wrapper: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    dot: 'bg-emerald-400',
  },
};

export default function EnrollmentBadge({ status }) {
  if (!status || status === 'cancelled') {
    return null;
  }

  const label = LABELS[status];

  // Unknown status ko silently render nahi karna.
  if (!label) {
    return null;
  }

  const style = STYLES[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        border px-2 py-1
        font-mono text-[9px]
        font-medium uppercase
        tracking-[0.12em]
        leading-none
        ${style.wrapper}
      `}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 shrink-0 ${style.dot}`}
      />

      {label}
    </span>
  );
}