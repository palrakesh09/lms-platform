const base =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';

export const primaryButton =
  `${base} border-[#FF3E00] bg-[#FF3E00] text-white hover:border-[#FF531F] hover:bg-[#FF531F]`;

export const secondaryButton =
  `${base} border-[#3A3A3A] bg-transparent text-white hover:border-[#FF3E00] hover:text-[#FF3E00]`;

export const dangerButton =
  `${base} border-[#EF4444] bg-[#EF4444] text-white hover:border-[#DC2626] hover:bg-[#DC2626]`;

const small =
  'inline-flex min-h-8 items-center justify-center gap-1 rounded-sm border px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all duration-200 touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';

export const smallButton =
  `${small} border-[#3A3A3A] bg-transparent text-neutral-300 hover:border-[#FF3E00] hover:text-[#FF3E00]`;

export const smallDangerButton =
  `${small} border-[#7F1D1D] bg-transparent text-[#F87171] hover:border-[#EF4444] hover:text-[#EF4444]`;

const link =
  'rounded-sm text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00] disabled:opacity-50';

export const linkButton =
  `${link} text-[#FF3E00] hover:text-[#FF531F] hover:underline`;

export const dangerLinkButton =
  `${link} text-[#F87171] hover:text-[#EF4444] hover:underline`;

