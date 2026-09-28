export default function QuoteBlock({ block }) {
  return (
    <blockquote className="border-l-4 border-indigo-200 pl-4 italic text-slate-700">
      <p className="whitespace-pre-line wrap-break-word">{block.text}</p>
      {block.attribution && <cite className="mt-1 block text-sm not-italic text-slate-500">— {block.attribution}</cite>}
    </blockquote>
  );
}