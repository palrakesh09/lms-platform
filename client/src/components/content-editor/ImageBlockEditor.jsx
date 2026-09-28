export default function ImageBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      <input type="url" value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="https://example.com/image.png" aria-label="Image URL" className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
      <input type="text" value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} placeholder="Alt text (required)" aria-label="Alt text" className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
      <input type="text" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Caption (optional)" aria-label="Caption" className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
    </div>
  );
}