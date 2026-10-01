const variants = {
  default: {
    container: 'border-[#2A2A2A] bg-[#171717] text-neutral-300',
    dot: 'bg-neutral-500',
  },

  accent: {
    container: 'border-[#FF3E00]/30 bg-[#FF3E00]/10 text-[#FF6333]',
    dot: 'bg-[#FF3E00]',
  },

  success: {
    container: 'border-green-500/20 bg-green-500/10 text-green-400',
    dot: 'bg-green-400',
  },

  warning: {
    container: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400',
  },

  danger: {
    container: 'border-red-500/20 bg-red-500/10 text-red-400',
    dot: 'bg-red-400',
  },
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
}) {
  const styles = variants[variant] ?? variants.default;

  return (
    <span
      className={[
        'inline-flex min-h-6 items-center gap-1.5',
        'rounded-sm border',
        'px-2 py-1',
        'font-mono text-[10px] font-medium',
        'uppercase tracking-[0.12em]',
        'leading-none whitespace-nowrap',
        styles.container,
        className,
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`}
      />

      <span>{children}</span>
    </span>
  );
}

