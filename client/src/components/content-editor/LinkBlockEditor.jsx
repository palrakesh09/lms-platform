export default function LinkBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      <input type="text" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Link text" aria-label="Link text" className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
      <input type="url" value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="https://" aria-label="Link URL" className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
    </div>
  );
}