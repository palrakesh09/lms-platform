import { useState } from 'react';
import { useAIAssistant } from '../../hooks/useAIAssistant.js';
import Icon from '../common/Icon.jsx';
import AIChatWindow from './AIChatWindow.jsx';
import AIConversationHistory from './AIConversationHistory.jsx';

// Floating AI launcher + responsive assistant panel.
// UI only — AI context, hooks and services remain unchanged.
export default function AIAssistant() {
  const { enabled, activeContext } = useAIAssistant();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('chat');
  const [conversationId, setConversationId] = useState(null);

  if (!enabled) return null;

  const tabs = [
    { value: 'chat', label: 'Ask' },
    { value: 'practice', label: 'Practice' },
    { value: 'hint', label: 'Hint' },
    { value: 'history', label: 'History' },
  ];

  const startNewConversation = () => {
    setConversationId(null);
    setTab('chat');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-5 sm:right-5">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI learning assistant"
          className="
            group flex size-12 items-center justify-center
            border border-[#FF3E00]
            bg-[#FF3E00] text-white
            shadow-[0_8px_30px_rgba(0,0,0,0.45)]
            transition-all duration-200
            hover:-translate-y-1 hover:bg-[#FF531F]
            focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-[#FF3E00]
            active:scale-95
            sm:size-14
          "
        >
          <Icon
            name="bell"
            className="size-5 transition-transform duration-200 group-hover:scale-110 sm:size-6"
          />

          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 size-2.5 bg-white ring-2 ring-[#0A0A0A]"
          />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="AI learning assistant"
          className="
            flex h-[min(40rem,calc(100vh-2rem))]
            w-[min(25rem,calc(100vw-2rem))]
            flex-col overflow-hidden
            border border-[#2A2A2A]
            bg-[#0F0F0F]
            shadow-[0_20px_70px_rgba(0,0,0,0.65)]
            sm:h-[40rem] sm:w-[25rem]
          "
        >
          {/* Header */}
          <header className="shrink-0 border-b border-[#2A2A2A] bg-[#111111]">
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center border border-[#FF3E00]/40 bg-[#FF3E00]/10">
                  <Icon
                    name="bell"
                    className="size-4 text-[#FF3E00]"
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#FF3E00]">
                    AI SYSTEM
                  </p>
                  <p className="truncate text-sm font-semibold text-white">
                    Learning Assistant
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={startNewConversation}
                  className="
                    min-h-8 px-2.5
                    font-mono text-[10px] font-bold uppercase tracking-wider
                    text-neutral-500 transition-colors
                    hover:text-[#FF3E00]
                    focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-[#FF3E00]
                  "
                >
                  New
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close AI assistant"
                  className="
                    flex size-8 items-center justify-center
                    border border-transparent
                    text-neutral-500 transition-colors
                    hover:border-[#3A3A3A] hover:bg-[#171717] hover:text-white
                    focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-[#FF3E00]
                  "
                >
                  <Icon name="x" className="size-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Assistant sections"
              className="flex overflow-x-auto border-t border-[#222222] px-2 no-scrollbar"
            >
              {tabs.map((item) => {
                const active = tab === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(item.value)}
                    className={[
                      'relative min-h-10 shrink-0 px-3',
                      'font-mono text-[10px] font-bold uppercase tracking-wider',
                      'transition-colors duration-200',
                      'focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
                      'focus-visible:outline-[#FF3E00]',
                      active
                        ? 'text-white'
                        : 'text-neutral-600 hover:text-neutral-300',
                    ].join(' ')}
                  >
                    {item.label}

                    {active && (
                      <span className="absolute inset-x-2 bottom-0 h-0.5 bg-[#FF3E00]" />
                    )}
                  </button>
                );
              })}
            </div>
          </header>

          {/* Content */}
          <div className="min-h-0 flex-1 bg-[#0A0A0A]">
            {tab === 'history' ? (
              <AIConversationHistory
                onSelect={(id) => {
                  setConversationId(id);
                  setTab('chat');
                }}
              />
            ) : (
              <AIChatWindow
                context={activeContext}
                conversationId={conversationId}
                onConversationStarted={setConversationId}
                view={
                  tab === 'practice'
                    ? 'practice'
                    : tab === 'hint'
                      ? 'hint'
                      : undefined
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}