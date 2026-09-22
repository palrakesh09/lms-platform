import Icon from './Icon.jsx';
import { secondaryButton } from './buttonClasses.js';

// Generic "something failed" panel. `children` are extra actions (links, buttons).
export default function ErrorState({ title, message, onRetry, retryLabel = 'Try again', children }) {
  return (
    <div
      role="alert"
      className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm"
    >
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <Icon name="alert" className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{message}</p>

      {(onRetry || children) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button type="button" onClick={onRetry} className={secondaryButton}>
              {retryLabel}
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}