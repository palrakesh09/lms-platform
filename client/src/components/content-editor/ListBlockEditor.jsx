import { secondaryButton, smallDangerButton } from '../common/buttonClasses.js';
import Icon from '../common/Icon.jsx';

export default function ListBlockEditor({ block, onChange }) {
  const items = block.items ?? [''];
  const update = (i, value) => onChange({ ...block, items: items.map((item, idx) => (idx === i ? value : item)) });
  const add = () => items.length < 50 && onChange({ ...block, items: [...items, ''] });
  const remove = (i) => onChange({ ...block, items: items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span aria-hidden="true" className="w-5 text-sm text-slate-500">{block.type === 'numbered-list' ? `${i + 1}.` : '•'}</span>
          <input type="text" value={item} onChange={(e) => update(i, e.target.value)} aria-label={`List item ${i + 1}`} className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
          {items.length > 1 && (
            <button type="button" onClick={() => remove(i)} aria-label={`Remove item ${i + 1}`} className={smallDangerButton}>
              <Icon name="trash" className="size-3.5" />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className={secondaryButton}>Add item</button>
    </div>
  );
}