import { Link } from 'react-router';
import { parseMarkdown } from '../../utils/markdown.js';
import Icon from '../common/Icon.jsx';

const Inline = ({ tokens }) =>
  tokens.map((token, i) => {
    switch (token.kind) {
      case 'bold':
        return <strong key={i} className="font-semibold text-white">{token.text}</strong>;

      case 'italic':
        return <em key={i}>{token.text}</em>;

      case 'code':
        return (
          <code
            key={i}
            className="border border-[#2A2A2A] bg-[#171717] px-1.5 py-0.5 font-mono text-[0.85em] text-[#FFB49E]"
          >
            {token.text}
          </code>
        );

      case 'link':
        return token.url ? (
          <a
            key={i}
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF3E00] underline decoration-[#FF3E00]/40 underline-offset-2 hover:text-[#FF531F]"
          >
            {token.text}
          </a>
        ) : (
          <span key={i}>{token.text}</span>
        );

      default:
        return <span key={i}>{token.text}</span>;
    }
  });

function MarkdownBody({ text }) {
  const blocks = parseMarkdown(text);

  return (
    <div className="space-y-3 text-sm leading-6 text-neutral-300">
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          const Tag = `h${Math.min(block.level + 2, 4)}`;

          return (
            <Tag
              key={i}
              className="font-semibold tracking-tight text-white"
            >
              <Inline tokens={block.inline} />
            </Tag>
          );
        }

        if (block.type === 'code') {
          return (
            <pre
              key={i}
              className="
                overflow-x-auto
                border border-[#2A2A2A]
                bg-[#080808]
                p-3
                text-neutral-200
              "
            >
              <code className="font-mono text-xs leading-5">
                {block.code}
              </code>
            </pre>
          );
        }

        if (block.type === 'list') {
          const Tag = block.ordered ? 'ol' : 'ul';

          return (
            <Tag
              key={i}
              className={[
                'space-y-1.5 pl-5',
                block.ordered ? 'list-decimal' : 'list-disc',
              ].join(' ')}
            >
              {block.items.map((item, j) => (
                <li key={j}>
                  <Inline tokens={item} />
                </li>
              ))}
            </Tag>
          );
        }

        return (
          <p key={i}>
            <Inline tokens={block.inline} />
          </p>
        );
      })}
    </div>
  );
}

export default function AIMessage({ message, onCopy }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[88%] border px-3 py-2.5',
          isUser
            ? 'border-[#FF3E00] bg-[#FF3E00] text-white'
            : 'border-[#2A2A2A] bg-[#111111]',
        ].join(' ')}
      >
        {isUser ? (
          <p className="whitespace-pre-line wrap-break-word text-sm leading-6">
            {message.content}
          </p>
        ) : (
          <MarkdownBody text={message.content} />
        )}

        {!isUser && message.sources?.length > 0 && (
          <div className="mt-3 border-t border-[#2A2A2A] pt-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-px w-3 bg-[#FF3E00]" />
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                Sources
              </p>
            </div>

            <ul className="space-y-1">
              {message.sources.map((source, i) => (
                <li key={i}>
                  <Link
                    to={source.url}
                    className="
                      block truncate text-xs text-neutral-400
                      underline decoration-[#3A3A3A] underline-offset-2
                      transition-colors hover:text-[#FF3E00]
                    "
                  >
                    {source.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isUser && (
          <button
            type="button"
            onClick={() => onCopy(message.content)}
            aria-label="Copy response"
            className="
              mt-3 flex min-h-7 items-center gap-1.5
              font-mono text-[9px] font-bold uppercase tracking-wider
              text-neutral-600 transition-colors
              hover:text-[#FF3E00]
              focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-[#FF3E00]
            "
          >
            <Icon name="clipboard" className="size-3.5" />
            Copy
          </button>
        )}
      </div>
    </div>
  );
}
