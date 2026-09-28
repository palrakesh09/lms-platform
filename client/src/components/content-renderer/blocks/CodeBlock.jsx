import { useState } from 'react';
import Icon from '../../common/Icon.jsx';

// No syntax highlighting library exists anywhere in this project, so this renders plain, readable
// monospace text — never executes anything (§7). Horizontal scroll keeps long lines from breaking the
// page layout on mobile (§31).
export default function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable; the code is still visible and selectable */
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
      <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-300">
        <span className="truncate">{block.filename || block.language}</span>
        <button type="button" onClick={copy} aria-label="Copy code" className="flex shrink-0 items-center gap-1 rounded px-2 py-1 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-400">
          <Icon name="clipboard" className="size-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-sm">
        <code className="font-mono text-slate-100">{block.code}</code>
      </pre>
      {block.description && <p className="border-t border-slate-800 px-3 py-2 text-xs text-slate-400">{block.description}</p>}
    </div>
  );
}