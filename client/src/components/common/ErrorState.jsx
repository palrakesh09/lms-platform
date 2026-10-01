import Icon from './Icon.jsx';

export default function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Try again',
  children,
}) {
  return (
    <div
      role="alert"
      className={[
        'mx-auto w-full max-w-md',
        'border border-red-500/20',
        'bg-[#111111]',
        'px-5 py-10 text-center',
        'sm:px-8 sm:py-12',
      ].join(' ')}
    >
      <span
        className={[
          'mx-auto flex size-12 items-center justify-center',
          'rounded-sm border border-red-500/20',
          'bg-red-500/10',
          'text-red-400',
        ].join(' ')}
      >
        <Icon name="alert" className="size-5" />
      </span>

      <div className="mt-5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-red-400">
        System Error
      </div>

      <h2 className="mt-2 text-base font-semibold tracking-tight text-white sm:text-lg">
        {title}
      </h2>

      {message && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
          {message}
        </p>
      )}

      {(onRetry || children) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={[
                'inline-flex min-h-10 items-center justify-center',
                'rounded-sm border border-[#3A3A3A]',
                'bg-transparent px-4',
                'text-sm font-semibold text-white',
                'transition-all duration-200',
                'hover:border-[#FF3E00]',
                'hover:text-[#FF3E00]',
                'active:scale-[0.98]',
                'focus-visible:outline-2',
                'focus-visible:outline-offset-2',
                'focus-visible:outline-[#FF3E00]',
              ].join(' ')}
            >
              {retryLabel}
            </button>
          )}

          {children}
        </div>
      )}
    </div>
  );
}

