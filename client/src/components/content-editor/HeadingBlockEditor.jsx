export default function HeadingBlockEditor({ block, onChange }) {
  return (
    <div className="flex gap-2">
      <select value={block.level} onChange={(e) => onChange({ ...block, level: Number(e.target.value) })} aria-label="Heading level" className="rounded-md border border-slate-300 px-2 py-2 text-sm">
        <option value={2}>H2</option>
        <option value={3}>H3</option>
        <option value={4}>H4</option>
      </select>
      <input type="text" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Heading text" aria-label="Heading text" maxLength={200} className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
    </div>
  );
}