import { useCallback, useRef, useState } from 'react';
import {
  REQUEST_STATUS,
  useApiResource,
} from '../../hooks/useApiResource.js';
import {
  explainConcept,
  generateHint,
  generatePractice,
  getConversation,
  sendChatMessage,
} from '../../services/aiService.js';
import { getMutationError } from '../../utils/getMutationError.js';
import Icon from '../common/Icon.jsx';
import Skeleton, { LoadingRegion } from '../common/Skeleton.jsx';
import AIHintPanel from './AIHintPanel.jsx';
import AILanguageSelector from './AILanguageSelector.jsx';
import AIMessage from './AIMessage.jsx';
import AIMessageInput from './AIMessageInput.jsx';
import AIPracticePanel from './AIPracticePanel.jsx';

// One window drives chat / explain / practice / hint.
// Data flow and AI services remain unchanged.
export default function AIChatWindow({
  context,
  conversationId,
  onConversationStarted,
  view,
}) {
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState('en');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const lastFailedRef = useRef(null);

  const loader = useCallback(
    (signal) =>
      conversationId
        ? getConversation(conversationId, signal)
        : Promise.resolve(null),
    [conversationId],
  );

  const { status } = useApiResource(loader);

  const runCall = async (call, userLabel) => {
    setSending(true);
    setError('');

    if (userLabel) {
      setMessages((current) => [
        ...current,
        {
          role: 'user',
          content: userLabel,
          sources: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    try {
      const result = await call();

      setMessages((current) => [
        ...current,
        result.reply,
      ]);

      if (!conversationId) {
        onConversationStarted(result.conversation.id);
      }

      lastFailedRef.current = null;
    } catch (failure) {
      setError(getMutationError(failure).message);
      lastFailedRef.current = call;
    } finally {
      setSending(false);
    }
  };

  const send = (text) =>
    runCall(
      () =>
        sendChatMessage({
          conversationId,
          contextType: context?.type,
          contextId: context?.id,
          message: text,
          language,
        }),
      text,
    );

  const explain = () =>
    runCall(
      () =>
        explainConcept({
          conversationId,
          contextType: context?.type,
          contextId: context?.id,
          style: 'simple',
          language,
        }),
      'Explain this',
    );

  const practice = (questionType) =>
    runCall(
      () =>
        generatePractice({
          conversationId,
          contextType: context?.type,
          contextId: context?.id,
          questionType,
          count: 3,
          language,
        }),
      `Generate ${questionType} practice questions`,
    );

  const hint = () =>
    runCall(
      () =>
        generateHint({
          conversationId,
          contextType: context?.type,
          contextId: context?.id,
          language,
        }),
      'Give me the next hint',
    );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0A0A0A]">
      {/* Context bar */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#2A2A2A] bg-[#111111] px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-1.5 shrink-0 bg-[#FF3E00]" />

          <p className="truncate text-xs text-neutral-400">
            {context?.title
              ? `About: ${context.title}`
              : 'General question'}
          </p>
        </div>

        <AILanguageSelector
          value={language}
          onChange={setLanguage}
        />
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3">
        {status === REQUEST_STATUS.LOADING && (
          <LoadingRegion
            label="Loading conversation..."
            className="space-y-2"
          >
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-12 w-1/2" />
          </LoadingRegion>
        )}

        {messages.length === 0 &&
          status !== REQUEST_STATUS.LOADING && (
            <div className="flex min-h-40 flex-col items-center justify-center px-4 text-center">
              <div className="mb-4 flex size-10 items-center justify-center border border-[#2A2A2A] bg-[#111111]">
                <Icon
                  name="bell"
                  className="size-4 text-[#FF3E00]"
                />
              </div>

              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#FF3E00]">
                Ready
              </p>

              <p className="mt-2 max-w-xs text-xs leading-5 text-neutral-600">
                Ask a question, explain a concept, practice a topic,
                or request a hint.
              </p>
            </div>
          )}

        {messages.map((message, index) => (
          <AIMessage
            key={index}
            message={message}
            onCopy={(text) =>
              navigator.clipboard?.writeText(text).catch(() => {})
            }
          />
        ))}

        {sending && (
          <div
            role="status"
            className="flex items-center gap-2 text-xs text-neutral-600"
          >
            <span className="flex gap-1">
              <span className="size-1 animate-pulse bg-[#FF3E00]" />
              <span className="size-1 animate-pulse bg-[#FF3E00] [animation-delay:150ms]" />
              <span className="size-1 animate-pulse bg-[#FF3E00] [animation-delay:300ms]" />
            </span>

            <span className="font-mono text-[9px] uppercase tracking-wider">
              Thinking...
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="border border-[#7F1D1D] bg-[#1A0D0D] p-3"
          >
            <div className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 bg-[#EF4444]" />

              <div className="min-w-0 flex-1">
                <p className="text-xs leading-5 text-[#FCA5A5]">
                  {error}
                </p>

                {lastFailedRef.current && (
                  <button
                    type="button"
                    onClick={() => runCall(lastFailedRef.current)}
                    className="
                      mt-2 min-h-8 border border-[#7F1D1D]
                      px-3 font-mono text-[9px] font-bold
                      uppercase tracking-wider text-[#F87171]
                      transition-colors
                      hover:border-[#EF4444] hover:text-[#EF4444]
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-[#FF3E00]
                    "
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context actions */}
      {context && (
        <>
          <div className="shrink-0 border-t border-[#2A2A2A] bg-[#111111] p-2">
            <button
              type="button"
              onClick={explain}
              disabled={sending}
              className="
                flex min-h-9 w-full items-center justify-center gap-2
                border border-[#3A3A3A]
                bg-transparent px-3
                font-mono text-[9px] font-bold uppercase tracking-wider
                text-neutral-400
                transition-all
                hover:border-[#FF3E00] hover:text-[#FF3E00]
                disabled:cursor-not-allowed disabled:opacity-40
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-[#FF3E00]
              "
            >
              <Icon name="info" className="size-3.5" />
              Explain this
            </button>
          </div>

          {view === 'practice' && (
            <AIPracticePanel
              onGenerate={practice}
              disabled={sending}
            />
          )}

          {view === 'hint' && (
            <AIHintPanel
              onHint={hint}
              disabled={sending}
            />
          )}
        </>
      )}

      <AIMessageInput
        onSend={send}
        disabled={sending}
      />
    </div>
  );
}

