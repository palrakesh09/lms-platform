import { formatLabel } from './formatters.js';

// Presentation for the API's fixed resource-type values. This is UI styling, not course data.
export const RESOURCE_TYPE_META = Object.freeze({
  theory: {
    label: 'Theory',
    icon: 'book',
    iconClass: 'text-sky-600',
    badgeClass: 'bg-sky-50 text-sky-800 ring-sky-200',
  },
  task: {
    label: 'Task',
    icon: 'clipboard',
    iconClass: 'text-amber-600',
    badgeClass: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  'mini-project': {
    label: 'Mini Project',
    icon: 'rocket',
    iconClass: 'text-violet-600',
    badgeClass: 'bg-violet-50 text-violet-800 ring-violet-200',
  },
});

// A type added to the backend later still renders, with a neutral style.
export const getResourceTypeMeta = (type) =>
  RESOURCE_TYPE_META[type] ?? {
    label: formatLabel(type) || 'Resource',
    icon: 'link',
    iconClass: 'text-slate-500',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
  };