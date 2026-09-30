import { useState } from 'react';
import { sendChatMessage } from '../../services/aiService.js';
import { getMutationError } from '../../utils/getMutationError.js';
import { secondaryButton } from '../common/buttonClasses.js';
import AIMessage from './AIMessage.jsx';

const actions = [
  {
    label: 'Get a hint',
    prompt: 'Give me one small hint about my code without providing the full solution.',
  },
  {
    label: 'Review my code',
    prompt: 'Review my code for bugs or issues. Explain any problems and suggest how I can fix them without rewriting the whole solution.',
  },
];

function AICodeActionsForExercise({ code }) {
  const [conversationId, setConversationId] = useState(null);
  const [reply, setReply] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const ask = async (prompt) => {
    setSending(true);
    setReply(null);
    setError('');
    try {
      const result = await sendChatMessage({
        conversationId,
        message: `${prompt}\n\nHere is the code I'm working on:\n\`\`\`javascript\n${code}\n\`\`\``,
      });
      setConversationId(result.conversation.id);
      setReply(result.reply);
    } catch (failure) {
      setError(getMutationError(failure).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-2 rounded-md border border-slate-200 p-3" aria-label="AI code help">
      <div className="flex flex-wrap gap-2">
        {actions.map(({ label, prompt }) => (
          <button
            key={label}
            type="button"
            disabled={sending || !code.trim()}
            onClick={() => ask(prompt)}
            className={secondaryButton}
          >
            {label}
          </button>
        ))}
      </div>
      {sending && <p role="status" className="text-sm text-slate-500">Getting AI feedback…</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {reply && <AIMessage message={reply} onCopy={(text) => navigator.clipboard?.writeText(text).catch(() => {})} />}
    </section>
  );
}

export default function AICodeActions({ exerciseId, code }) {
  return <AICodeActionsForExercise key={exerciseId} code={code} />;
}
