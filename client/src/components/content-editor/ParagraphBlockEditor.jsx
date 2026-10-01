export default function ParagraphBlockEditor({ block, onChange }) {
  return (
    <textarea
      value={block.text}
      onChange={(e) => onChange({ ...block, text: e.target.value })}
      rows={4}
      maxLength={5000}
      placeholder="Paragraph text"
      aria-label="Paragraph text"
      className=" block w-full resize-y border border-[#2A2A2A] bg-[#111111] px-3 py-3 text-sm leading-6 text-neutral-200 placeholder:text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#FF3E00] "
    />
  );
}
