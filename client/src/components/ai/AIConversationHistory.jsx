import { useCallback } from 'react';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { deleteConversation, listConversations } from '../../services/aiService.js';
import { formatDate } from '../../utils/formatters.js';
import { smallDangerButton } from '../common/buttonClasses.js';
import Skeleton, { LoadingRegion } from '../common/Skeleton.jsx';

export default function AIConversationHistory({ onSelect }) {
  const { status, data, reload } = useApiResource(useCallback((signal) => listConversations({ limit: 20 }, signal), []));

  const remove = async (id) => { await deleteConversation(id); reload(); };

  if (status === REQUEST_STATUS.LOADING) return <LoadingRegion label="Loading conversations…" className="space-y-2 p-3"><Skeleton className="h-10 w-full" /></LoadingRegion>;
  if (status !== REQUEST_STATUS.SUCCESS || data.items.length === 0) return <p className="p-3 text-sm text-slate-600">No previous conversations yet.</p>;

  return (
    <ul className="divide-y divide-slate-100">
      {data.items.map((c) => (
        <li key={c.id} className="flex items-center justify-between gap-2 px-3 py-2">
          <button type="button" onClick={() => onSelect(c.id)} className="min-w-0 flex-1 text-left text-sm text-slate-900 hover:underline">
            <span className="block truncate">{c.title}</span>
            <span className="block text-xs text-slate-500">{formatDate(c.updatedAt)}</span>
          </button>
          <button type="button" onClick={() => remove(c.id)} className={smallDangerButton}>Delete</button>
        </li>
      ))}
    </ul>
  );
}