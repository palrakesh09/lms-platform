import SearchResultItem from './SearchResultItem.jsx';

export default function SearchResultGroup({
  label,
  items,
}) {
  return (
    <section aria-label={label}>
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px w-5 bg-[#FF3E00]" />

        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
          {label}
        </h2>

        <span className="h-px flex-1 bg-neutral-800" />
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={`${item.type}-${item.id}`}
          >
            <SearchResultItem
              result={item}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}