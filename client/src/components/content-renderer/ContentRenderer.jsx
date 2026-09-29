import { BLOCK_TYPES } from '../../utils/contentBlocks.js';
import CodeBlock from './blocks/CodeBlock.jsx';
import DividerBlock from './blocks/DividerBlock.jsx';
import HeadingBlock from './blocks/HeadingBlock.jsx';
import ImageBlock from './blocks/ImageBlock.jsx';
import LinkBlock from './blocks/LinkBlock.jsx';
import ListBlock from './blocks/ListBlock.jsx';
import MessageBlock from './blocks/MessageBlock.jsx';
import ParagraphBlock from './blocks/ParagraphBlock.jsx';
import QuoteBlock from './blocks/QuoteBlock.jsx';
import TableBlock from './blocks/TableBlock.jsx';
import { useEffect, useState } from 'react';
import { resolveMediaBatch } from '../../services/mediaService.js';
import { apiClient } from '../../services/apiClient.js';
import { resolveDeliveryUrl } from '../../utils/mediaUtils.js';

// Renders structured content as safe React elements ONLY. There is no dangerouslySetInnerHTML anywhere
// in this tree, no block type executes anything, and text always renders as text — never markup. An
// unrecognized block type (e.g. authored by a future content version) fails safe instead of crashing
// the page. Used identically by the author's Preview mode and the student's learning page (§12).
export default function ContentRenderer({ content }) {
  const blocks = content?.blocks ?? [];
  const mediaIds = blocks.filter((b) => b.type === 'image' && b.mediaId).map((b) => b.mediaId);
  const [resolved, setResolved] = useState({});

  useEffect(() => {
    if (mediaIds.length === 0) return;
    // ONE request resolves every uploaded image in this resource, not one per image.
    resolveMediaBatch(mediaIds).then((items) => {
      setResolved(Object.fromEntries(items.map((i) => [i.id, resolveDeliveryUrl(i.url, apiClient.defaults.baseURL)])));
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(mediaIds)]);

  if (blocks.length === 0) return null;

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const key = block.id ?? index;
        switch (block.type) {
          case BLOCK_TYPES.PARAGRAPH: return <ParagraphBlock key={key} block={block} />;
          case BLOCK_TYPES.HEADING: return <HeadingBlock key={key} block={block} />;
          case BLOCK_TYPES.BULLET_LIST: return <ListBlock key={key} block={block} ordered={false} />;
          case BLOCK_TYPES.NUMBERED_LIST: return <ListBlock key={key} block={block} ordered />;
          case BLOCK_TYPES.CODE: return <CodeBlock key={key} block={block} />;
          case BLOCK_TYPES.QUOTE: return <QuoteBlock key={key} block={block} />;
          case BLOCK_TYPES.NOTE: return <MessageBlock key={key} block={block} tone="note" />;
          case BLOCK_TYPES.WARNING: return <MessageBlock key={key} block={block} tone="warning" />;
          case BLOCK_TYPES.IMAGE: return <ImageBlock key={key} block={block} resolvedSrc={block.mediaId ? resolved[block.mediaId] : undefined} />;
          case BLOCK_TYPES.LINK: return <LinkBlock key={key} block={block} />;
          case BLOCK_TYPES.TABLE: return <TableBlock key={key} block={block} />;
          case BLOCK_TYPES.DIVIDER: return <DividerBlock key={key} />;
          default:
            return (
              <p key={key} role="note" className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-500">
                This content block isn&apos;t supported in this view.
              </p>
            );
        }
      })}
    </div>
  );
}