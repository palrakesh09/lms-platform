import { Link } from 'react-router';
import { parseMarkdown } from '../../utils/markdown.js';
import Icon from '../common/Icon.jsx';

const Inline = ({ tokens }) =>
  tokens.map((token, i) => {
    switch (token.kind) {
      case 'bold': return <strong key={i}>{token.text}</strong>;
      case 'italic': return <em key={i}>{token.text}</em>;
      case 'code': return <code key={i} className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[0.85em]">{token.text}</code>;
      case 'link': return token.url ? <a key={i} href={token.url} target="_blank" rel="noopener noreferrer" className="text-indigo-700 underline">{token.text}</a> : <span key={i}>{token.text}</span>;
      default: return <span key={i}>{token.text}</span>;
    }
  });

// Renders assistant text through the hand-rolled markdown parser only — never dangerouslySetInnerHTML,
// never raw HTML. The parser is the same one used everywhere this content type appears (Phase 16 only).
function MarkdownBody({ text }) {
  const blocks = parseMarkdown(text);
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        if (block.type === 'heading') { const Tag = `h${Math.min(block.level + 2, 4)}`; return <Tag key={i} className="font-semibold text-slate-900"><Inline tokens={block.inline} /></Tag>; }
        if (block.type === 'code') return (
          <pre key={i} className="overflow-x-auto rounded-md bg-slate-900 p-3 text-slate-100"><code className="font-mono text-xs">{block.code}</code></pre>
        );
        if (block.type === 'list') { const Tag = block.ordered ? 'ol' : 'ul'; return <Tag key={i} className={`space-y-1 pl-5 ${block.ordered ? 'list-decimal' : 'list-disc'}`}>{block.items.map((item, j) => <li key={j}><Inline tokens={item} /></li>)}</Tag>; }
        return <p key={i}><Inline tokens={block.inline} /></p>;
      })}
    </div>
  );
}

export default function AIMessage({ message, onCopy }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-lg px-3 py-2 ${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
        {isUser ? <p className="whitespace-pre-line wrap-break-word text-sm">{message.content}</p> : <MarkdownBody text={message.content} />}

        {!isUser && message.sources?.length > 0 && (
          <div className="mt-2 border-t border-slate-300/60 pt-2">
            <p className="text-xs font-semibold text-slate-600">Sources</p>
            <ul className="mt-1 space-y-0.5">
              {message.sources.map((s, i) => (
                <li key={i}><Link to={s.url} className="text-xs text-indigo-700 underline">{s.title}</Link></li>
              ))}
            </ul>
          </div>
        )}

        {!isUser && (
          <button type="button" onClick={() => onCopy(message.content)} aria-label="Copy response" className="mt-2 flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900">
            <Icon name="clipboard" className="size-3.5" />Copy
          </button>
        )}
      </div>
    </div>
  );
}