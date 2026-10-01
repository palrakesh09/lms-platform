import { useState } from 'react';
import Icon from '../../common/Icon.jsx';

export default function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard may be unavailable.
    }
  };

  return (
    <div className="overflow-hidden border border-[#2A2A2A] bg-[#0D0D0D]">
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[#2A2A2A] bg-[#111111] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF3E00]" />

          <span className="truncate font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            {block.filename || block.language || 'Code'}
          </span>
        </div>

        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex min-h-8 shrink-0 items-center gap-1.5 border border-[#3A3A3A] px-2.5 text-xs font-semibold text-neutral-300 transition hover:border-[#FF3E00] hover:text-[#FF3E00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00]"
        >
          <Icon name="clipboard" className="size-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code className="font-mono text-neutral-200">
          {block.code}
        </code>
      </pre>

      {block.description && (
        <div className="border-t border-[#2A2A2A] bg-[#111111] px-4 py-3">
          <p className="text-xs leading-5 text-neutral-400">
            {block.description}
          </p>
        </div>
      )}
    </div>
  );
}

