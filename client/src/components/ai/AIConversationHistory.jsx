import { useCallback } from 'react';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import {
  deleteConversation,
  listConversations,
} from '../../services/aiService.js';
import { formatDate } from '../../utils/formatters.js';
import Icon from '../common/Icon.jsx';
import Skeleton, { LoadingRegion } from '../common/Skeleton.jsx';

export default function AIConversationHistory({ onSelect }) {
  const {
    status,
    data,
    reload,
  } = useApiResource(
    useCallback(
      (signal) => listConversations({ limit: 20 }, signal),
      [],
    ),
  );

  const remove = async (id) => {
    await deleteConversation(id);
    reload();
  };

  if (status === REQUEST_STATUS.LOADING) {
    return (
      <LoadingRegion
        label="Loading conversations..."
        className="space-y-2 p-3"
      >
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </LoadingRegion>
    );
  }

  if (
    status !== REQUEST_STATUS.SUCCESS ||
    !data?.items ||
    data.items.length === 0
  ) {
    return (
      <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-4 flex size-12 items-center justify-center border border-[#2A2A2A] bg-[#111111]">
          <Icon
            name="clock"
            className="size-5 text-neutral-600"
          />
        </div>

        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-600">
          No history
        </p>

        <p className="mt-2 max-w-xs text-sm text-neutral-500">
          Previous AI conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-[#2A2A2A] px-3 py-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF3E00]">
          Conversation Log
        </p>
        <p className="mt-1 text-xs text-neutral-600">
          {data.items.length} recent conversation
          {data.items.length === 1 ? '' : 's'}
        </p>
      </div>

      <ul className="divide-y divide-[#222222]">
        {data.items.map((conversation) => (
          <li
            key={conversation.id}
            className="group flex items-center gap-2 px-3 py-3 transition-colors hover:bg-[#111111]"
          >
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              className="
                min-w-0 flex-1 text-left
                focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-[#FF3E00]
              "
            >
              <span className="block truncate text-sm font-medium text-neutral-300 transition-colors group-hover:text-white">
                {conversation.title}
              </span>

              <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                {formatDate(conversation.updatedAt)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => remove(conversation.id)}
              aria-label={`Delete ${conversation.title}`}
              className="
                flex size-8 shrink-0 items-center justify-center
                border border-transparent
                text-neutral-700 transition-colors
                hover:border-[#7F1D1D]
                hover:bg-[#1A0D0D]
                hover:text-[#F87171]
                focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-[#FF3E00]
              "
            >
              <Icon name="trash" className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
