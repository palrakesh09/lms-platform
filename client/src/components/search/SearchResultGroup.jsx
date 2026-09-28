import SearchResultItem from './SearchResultItem.jsx';

export default function SearchResultGroup({ label, items }) {
  return (
    <section aria-label={label}>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={`${item.type}-${item.id}`}><SearchResultItem result={item} /></li>
        ))}
      </ul>
    </section>
  );
}