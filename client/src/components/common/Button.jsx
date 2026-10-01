import { forwardRef } from 'react';

const variants = {
  primary:
    'border border-[#FF3E00] bg-[#FF3E00] text-white hover:border-[#FF531F] hover:bg-[#FF531F] active:bg-[#E93600]',

  secondary:
    'border border-[#3A3A3A] bg-[#111111] text-white hover:border-[#FF3E00] hover:bg-[#171717] hover:text-[#FF3E00] active:bg-[#0D0D0D]',

  ghost:
    'border border-transparent bg-transparent text-neutral-400 hover:border-[#292929] hover:bg-[#171717] hover:text-white active:bg-[#111111]',

  danger:
    'border border-[#EF4444] bg-[#EF4444] text-white hover:border-[#DC2626] hover:bg-[#DC2626] active:bg-[#B91C1C]',

  outlineDanger:
    'border border-[#7F1D1D] bg-transparent text-[#F87171] hover:border-[#EF4444] hover:bg-[#1A0D0D] hover:text-[#EF4444] active:bg-[#220D0D]',
};

const sizes = {
  sm: 'min-h-9 px-3 text-xs sm:min-h-8',
  md: 'min-h-10 px-4 text-sm',
  lg: 'min-h-11 px-5 text-sm sm:min-h-12 sm:px-6',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    type = 'button',
    disabled = false,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2',
        'rounded-sm',
        'font-semibold',
        'leading-none',
        'transition-all duration-200',
        'select-none',
        'focus-visible:outline-2',
        'focus-visible:outline-offset-2',
        'focus-visible:outline-[#FF3E00]',
        'active:scale-[0.98]',
        'disabled:cursor-not-allowed',
        'disabled:pointer-events-none',
        'disabled:opacity-50',
        'disabled:active:scale-100',
        'touch-manipulation',
        'whitespace-nowrap',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;