import { BACKEND_STATUS, useBackendStatus } from '../hooks/useBackendStatus.js';

const STATUS_VIEW = {
  [BACKEND_STATUS.CHECKING]: {
    label: 'Checking…',
    icon: '',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
  [BACKEND_STATUS.CONNECTED]: {
    label: 'Connected',
    icon: '✓',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  [BACKEND_STATUS.DISCONNECTED]: {
    label: 'Disconnected',
    icon: '✕',
    className: 'bg-red-50 text-red-700 ring-red-200',
  },
};

export default function BackendStatus() {
  const { status, message, recheck } = useBackendStatus();
  const view = STATUS_VIEW[status];

  return (
    <section
      aria-labelledby="backend-status-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2
        id="backend-status-heading"
        className="text-sm font-semibold uppercase tracking-wide text-slate-500"
      >
        Backend Status
      </h2>

      <p
        role="status"
        className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${view.className}`}
      >
        {view.label}
        {view.icon && <span aria-hidden="true">{view.icon}</span>}
      </p>

      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}

      <button
        type="button"
        onClick={recheck}
        disabled={status === BACKEND_STATUS.CHECKING}
        className="mt-4 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Check again
      </button>
    </section>
  );
}