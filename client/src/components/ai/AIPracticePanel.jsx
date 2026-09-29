// AIPracticePanel.jsx — a thin quick-action strip, not a separate full screen.
export default function AIPracticePanel({ onGenerate, disabled }) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-slate-200 p-2 text-xs">
      {['mcq', 'short-answer', 'coding'].map((type) => (
        <button key={type} type="button" disabled={disabled} onClick={() => onGenerate(type)} className="rounded-full border border-slate-300 px-2.5 py-1 hover:bg-slate-50 disabled:opacity-50">
          {type === 'mcq' ? 'Multiple choice' : type === 'short-answer' ? 'Short answer' : 'Coding exercise'}
        </button>
      ))}
    </div>
  );
}