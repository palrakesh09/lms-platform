import Icon from './Icon.jsx';

export default function EmptyState({ title, message, icon = 'inbox', children }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon name={icon} className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      {message && <p className="mt-1 text-sm text-slate-600">{message}</p>}
      {children && <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  );
}