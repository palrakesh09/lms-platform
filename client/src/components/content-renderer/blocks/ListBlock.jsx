export default function ListBlock({ block, ordered }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={`space-y-1 pl-6 text-slate-700 ${ordered ? 'list-decimal' : 'list-disc'}`}>
      {(block.items ?? []).map((item, i) => <li key={i} className="wrap-break-word leading-relaxed">{item}</li>)}
    </Tag>
  );
}