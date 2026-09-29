import { useState } from 'react';
import { useAIAssistant } from '../../hooks/useAIAssistant.js';
import Icon from '../common/Icon.jsx';
import AIChatWindow from './AIChatWindow.jsx';
import AIConversationHistory from './AIConversationHistory.jsx';

// The floating launcher + panel, mounted once (App.jsx). Hidden entirely when AI is disabled.
export default function AIAssistant() {
  const { enabled, activeContext } = useAIAssistant();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('chat'); // chat | practice | hint | history
  const [conversationId, setConversationId] = useState(null);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!open && (
        <button type="button" onClick={() => setOpen(true)} aria-label="Open AI assistant" className="flex size-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <Icon name="bell" className="size-6" />
        </button>
      )}
      {open && (
        <div role="dialog" aria-label="AI learning assistant" className="flex h-\[32rem\] w-\[22rem\] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <div role="tablist" aria-label="Assistant sections" className="flex gap-1 text-xs">
              {[['chat', 'Ask'], ['practice', 'Practice'], ['hint', 'Hint'], ['history', 'History']].map(([value, label]) => (
                <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`rounded px-2 py-1 ${tab === value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setConversationId(null)} className="text-xs font-medium text-indigo-700 hover:underline">New</button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close AI assistant" className="rounded p-1 text-slate-600 hover:bg-slate-100"><Icon name="x" className="size-4" /></button>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            {tab === 'history' ? (
              <AIConversationHistory onSelect={(id) => { setConversationId(id); setTab('chat'); }} />
            ) : (
              <AIChatWindow context={activeContext} conversationId={conversationId} onConversationStarted={setConversationId} view={tab === 'practice' ? 'practice' : tab === 'hint' ? 'hint' : undefined} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}