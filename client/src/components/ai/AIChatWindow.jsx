import { useCallback, useRef, useState } from 'react';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { explainConcept, generateHint, generatePractice, getConversation, sendChatMessage } from '../../services/aiService.js';
import { getMutationError } from '../../utils/getMutationError.js';
import { secondaryButton } from '../common/buttonClasses.js';
import Skeleton, { LoadingRegion } from '../common/Skeleton.jsx';
import AIHintPanel from './AIHintPanel.jsx';
import AILanguageSelector from './AILanguageSelector.jsx';
import AIMessage from './AIMessage.jsx';
import AIMessageInput from './AIMessageInput.jsx';
import AIPracticePanel from './AIPracticePanel.jsx';

// One window drives chat/explain/practice/hint — a shared history, not four separate screens.
export default function AIChatWindow({ context, conversationId, onConversationStarted, view }) {
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState('en');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const lastFailedRef = useRef(null);

  const loader = useCallback((signal) => (conversationId ? getConversation(conversationId, signal) : Promise.resolve(null)), [conversationId]);
  const { status } = useApiResource(loader);

  const applyResult = (result) => {
    setMessages((current) => [...current, ...result.conversation.messageCount === 1 ? [] : [], result.reply].filter(Boolean));
  };

  const runCall = async (call, userLabel) => {
    setSending(true);
    setError('');
    if (userLabel) setMessages((current) => [...current, { role: 'user', content: userLabel, sources: [], createdAt: new Date().toISOString() }]);
    try {
      const result = await call();
      setMessages((current) => [...current, result.reply]);
      if (!conversationId) onConversationStarted(result.conversation.id);
      lastFailedRef.current = null;
    } catch (failure) {
      setError(getMutationError(failure).message);
      lastFailedRef.current = call;
    } finally {
      setSending(false);
    }
  };

  const send = (text) => runCall(() => sendChatMessage({ conversationId, contextType: context?.type, contextId: context?.id, message: text, language }), text);
  const explain = () => runCall(() => explainConcept({ conversationId, contextType: context?.type, contextId: context?.id, style: 'simple', language }), 'Explain this');
  const practice = (questionType) => runCall(() => generatePractice({ conversationId, contextType: context?.type, contextId: context?.id, questionType, count: 3, language }), `Generate ${questionType} practice questions`);
  const hint = () => runCall(() => generateHint({ conversationId, contextType: context?.type, contextId: context?.id, language }), 'Give me the next hint');

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <p className="truncate text-sm font-medium text-slate-900">{context?.title ? `About: ${context.title}` : 'General question'}</p>
        <AILanguageSelector value={language} onChange={setLanguage} />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {status === REQUEST_STATUS.LOADING && <LoadingRegion label="Loading conversation…" className="space-y-2"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-10 w-1/2" /></LoadingRegion>}
        {messages.length === 0 && status !== REQUEST_STATUS.LOADING && (
          <p className="text-sm text-slate-600">Ask a question, or use Explain / Practice / Hint below.</p>
        )}
        {messages.map((m, i) => <AIMessage key={i} message={m} onCopy={(text) => navigator.clipboard?.writeText(text).catch(() => {})} />)}
        {sending && <p role="status" className="text-sm text-slate-500">Thinking…</p>}
        {error && (
          <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
            {lastFailedRef.current && (
              <button type="button" onClick={() => runCall(lastFailedRef.current)} className={`${secondaryButton} ml-2`}>Retry</button>
            )}
          </div>
        )}
      </div>

      {context && (
        <>
          <div className="flex gap-2 border-t border-slate-200 p-2">
            <button type="button" onClick={explain} disabled={sending} className={secondaryButton}>Explain this</button>
          </div>
          {view === 'practice' && <AIPracticePanel onGenerate={practice} disabled={sending} />}
          {view === 'hint' && <AIHintPanel onHint={hint} disabled={sending} />}
        </>
      )}

      <AIMessageInput onSend={send} disabled={sending} />
    </div>
  );
}