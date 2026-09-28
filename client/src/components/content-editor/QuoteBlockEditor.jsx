export default function QuoteBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} rows={2} placeholder="Quote text" aria-label="Quote text" className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      <input type="text" value={block.attribution ?? ''} onChange={(e) => onChange({ ...block, attribution: e.target.value })} placeholder="Attribution (optional)" aria-label="Attribution" className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
    </div>
  );
}