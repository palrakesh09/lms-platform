import Icon from '../common/Icon.jsx';
import { formatFileSize } from '../../utils/mediaUtils.js';

export default function MediaPreview({ src, name, size, category }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-2">
      {category === 'image' && src ? (
        <img src={src} alt="" className="size-12 rounded object-cover" />
      ) : (
        <span className="flex size-12 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500"><Icon name="clipboard" className="size-5" /></span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{name}</p>
        {size !== undefined && <p className="text-xs text-slate-600">{formatFileSize(size)}</p>}
      </div>
    </div>
  );
}