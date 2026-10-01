import { useState } from 'react';
import Icon from '../common/Icon.jsx';

export default function AIMessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();

    const text = value.trim();

    if (!text || disabled) return;

    setValue('');
    onSend(text);
  };

  return (
    <form
      onSubmit={submit}
      className="shrink-0 border-t border-[#2A2A2A] bg-[#111111] p-2.5 sm:p-3"
    >
      <label htmlFor="ai-message-input" className="sr-only">
        Ask the AI assistant
      </label>

      <div className="flex items-end gap-2">
        <div className="relative min-w-0 flex-1">
          <textarea
            id="ai-message-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                submit(e);
              }
            }}
            rows={2}
            maxLength={4000}
            placeholder="Ask about this lesson..."
            disabled={disabled}
            className="
              min-h-11 w-full resize-none
              border border-[#2A2A2A]
              bg-[#0A0A0A]
              px-3 py-2.5
              text-sm text-white
              placeholder:text-neutral-700
              transition-colors
              focus:border-[#FF3E00]
              focus:outline-none
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />

          <span className="pointer-events-none absolute bottom-2 right-2 hidden font-mono text-[9px] text-neutral-700 sm:block">
            SHIFT + ENTER
          </span>
        </div>

        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="
            flex min-h-11 shrink-0 items-center justify-center gap-2
            border border-[#FF3E00]
            bg-[#FF3E00]
            px-3
            text-sm font-semibold text-white
            transition-all duration-200
            hover:border-[#FF531F] hover:bg-[#FF531F]
            focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-[#FF3E00]
            disabled:cursor-not-allowed
            disabled:border-[#2A2A2A]
            disabled:bg-[#171717]
            disabled:text-neutral-600
            active:scale-[0.98]
            sm:px-4
          "
        >
          <Icon name="arrow-right" className="size-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

      <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-neutral-700">
        AI responses may require verification
      </p>
    </form>
  );
}
