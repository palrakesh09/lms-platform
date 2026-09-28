export default function ParagraphBlockEditor({ block, onChange }) {
  return (
    <textarea
      value={block.text}
      onChange={(e) => onChange({ ...block, text: e.target.value })}
      rows={3}
      maxLength={5000}
      placeholder="Paragraph text"
      aria-label="Paragraph text"
      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600"
    />
  );
}