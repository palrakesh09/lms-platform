import Icon from '../../common/Icon.jsx';

const TONE = {
  note: {
    className:
      'border-sky-900/60 bg-sky-950/20 text-sky-100',
    icon: 'book',
    label: 'Note',
  },

  warning: {
    className:
      'border-amber-900/60 bg-amber-950/20 text-amber-100',
    icon: 'alert',
    label: 'Warning',
  },
};

export default function MessageBlock({ block, tone }) {
  const config = TONE[tone] ?? TONE.note;

  return (
    <div
      role="note"
      className={`flex gap-3 border px-4 py-4 ${config.className}`}
    >
      <Icon
        name={config.icon}
        className="mt-0.5 size-5 shrink-0"
      />

      <div className="min-w-0">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
          {config.label}
        </div>

        <p className="mt-1 font-semibold">
          {block.title || config.label}
        </p>

        <p className="mt-1 break-words whitespace-pre-line text-sm leading-6 opacity-80">
          {block.text}
        </p>
      </div>
    </div>
  );
}

