import Icon from '../../common/Icon.jsx';

const TONE = {
  note: { className: 'bg-sky-50 text-sky-900 ring-sky-200', icon: 'book', label: 'Note' },
  warning: { className: 'bg-amber-50 text-amber-900 ring-amber-200', icon: 'alert', label: 'Warning' },
};

// Note vs warning is conveyed by icon + label text, not color alone (§30).
export default function MessageBlock({ block, tone }) {
  const t = TONE[tone];
  return (
    <div role="note" className={`flex gap-3 rounded-lg px-4 py-3 ring-1 ring-inset ${t.className}`}>
      <Icon name={t.icon} className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <p className="font-semibold">{block.title || t.label}</p>
        <p className="mt-0.5 whitespace-pre-line wrap-break-word text-sm">{block.text}</p>
      </div>
    </div>
  );
}