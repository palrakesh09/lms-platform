import { getSafeUrl } from './safeUrl.js';

// Hand-rolled, deliberately small: headings, bold/italic, inline code, fenced code, lists, safe links,
// paragraphs. No HTML is ever parsed or rendered — this walks the text into a plain block/inline model
// that AIMessage.jsx renders with ordinary React elements, exactly like Phase 12's content renderer.
const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

export const parseInline = (text) => {
  const parts = text.split(INLINE_PATTERN).filter((p) => p !== '');
  return parts.map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) return { kind: 'bold', text: part.slice(2, -2) };
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return { kind: 'italic', text: part.slice(1, -1) };
    if (part.startsWith('`') && part.endsWith('`')) return { kind: 'code', text: part.slice(1, -1) };
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) return { kind: 'link', text: link[1], url: getSafeUrl(link[2]) };
    return { kind: 'text', text: part };
  });
};

export const parseMarkdown = (source) => {
  const lines = (source ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i += 1; continue; }

    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i += 1; }
      i += 1; // consume closing fence
      blocks.push({ type: 'code', language, code: codeLines.join('\n') });
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) { blocks.push({ type: 'heading', level: heading[1].length, inline: parseInline(heading[2]) }); i += 1; continue; }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && (/^[-*]\s+/.test(lines[i]) || /^\d+\.\s+/.test(lines[i]))) {
        items.push(parseInline(lines[i].replace(/^[-*]\s+|^\d+\.\s+/, '')));
        i += 1;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('```') && !/^(#{1,3})\s+/.test(lines[i]) && !/^[-*]\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i])) {
      paraLines.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: 'paragraph', inline: parseInline(paraLines.join(' ')) });
  }
  return blocks;
};