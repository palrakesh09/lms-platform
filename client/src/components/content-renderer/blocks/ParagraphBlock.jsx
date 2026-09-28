export default function ParagraphBlock({ block }) {
  return <p className="whitespace-pre-line wrap-break-word leading-relaxed text-slate-700">{block.text}</p>;
}