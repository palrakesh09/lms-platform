export default function MessageBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      <input type="text" value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Title (optional)" aria-label={`${block.type} title`} className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
      <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} rows={2} placeholder="Text" aria-label={`${block.type} text`} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
    </div>
  );
}