import Icon from './Icon.jsx';

export default function EmptyState({
  title,
  message,
  icon = 'inbox',
  children,
}) {
  return (
    <div
      className={[
        'mx-auto w-full max-w-md',
        'border border-dashed border-[#2A2A2A]',
        'bg-[#111111]',
        'px-5 py-10 text-center',
        'sm:px-8 sm:py-12',
      ].join(' ')}
    >
      <span
        className={[
          'mx-auto flex size-12 items-center justify-center',
          'rounded-sm border border-[#2A2A2A]',
          'bg-[#171717]',
          'text-neutral-500',
        ].join(' ')}
      >
        <Icon name={icon} className="size-5" />
      </span>

      <div className="mt-5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#FF3E00]">
        No Data
      </div>

      <h2 className="mt-2 text-base font-semibold tracking-tight text-white sm:text-lg">
        {title}
      </h2>

      {message && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
          {message}
        </p>
      )}

      {children && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}

