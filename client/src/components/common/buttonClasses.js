const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50';

export const primaryButton = `${base} bg-indigo-600 text-white hover:bg-indigo-500`;
export const secondaryButton = `${base} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;
export const dangerButton = `${base} bg-red-600 text-white hover:bg-red-500`;

const small =
  'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50';

export const smallButton = `${small} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;
export const smallDangerButton = `${small} border border-red-200 bg-white text-red-700 hover:bg-red-50`;

const link =
  'rounded-sm text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50';

export const linkButton = `${link} text-indigo-700`;
export const dangerLinkButton = `${link} text-red-700`;