import { useState } from 'react';
import { primaryButton } from '../common/buttonClasses.js';

export default function AIMessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const submit = (e) => { e.preventDefault(); const text = value.trim(); if (!text || disabled) return; setValue(''); onSend(text); };

  return (
    <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 p-2">
      <label htmlFor="ai-message-input" className="sr-only">Ask the AI assistant</label>
      <textarea
        id="ai-message-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) submit(e); }}
        rows={2}
        maxLength={4000}
        placeholder="Ask a question about this lesson…"
        disabled={disabled}
        className="min-w-0 flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 disabled:bg-slate-100"
      />
      <button type="submit" disabled={disabled || !value.trim()} className={primaryButton}>Send</button>
    </form>
  );
}