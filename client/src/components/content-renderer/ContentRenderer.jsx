import { useEffect, useState } from 'react';
import { BLOCK_TYPES } from '../../utils/contentBlocks.js';
import { resolveMediaBatch } from '../../services/mediaService.js';
import { apiClient } from '../../services/apiClient.js';
import { resolveDeliveryUrl } from '../../utils/mediaUtils.js';

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

export default function ContentRenderer({ content }) {
  const blocks = content?.blocks ?? [];

  const mediaIds = blocks
    .filter((block) => block.type === 'image' && block.mediaId)
    .map((block) => block.mediaId);

  const [resolved, setResolved] = useState({});

  useEffect(() => {
    if (mediaIds.length === 0) return;

    resolveMediaBatch(mediaIds)
      .then((items) => {
        setResolved(
          Object.fromEntries(
            items.map((item) => [
              item.id,
              resolveDeliveryUrl(
                item.url,
                apiClient.defaults.baseURL
              ),
            ])
          )
        );
      })
      .catch(() => {});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(mediaIds)]);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        const key = block.id ?? index;

        switch (block.type) {
          case BLOCK_TYPES.PARAGRAPH:
            return <ParagraphBlock key={key} block={block} />;

          case BLOCK_TYPES.HEADING:
            return <HeadingBlock key={key} block={block} />;

          case BLOCK_TYPES.BULLET_LIST:
            return (
              <ListBlock
                key={key}
                block={block}
                ordered={false}
              />
            );

          case BLOCK_TYPES.NUMBERED_LIST:
            return (
              <ListBlock
                key={key}
                block={block}
                ordered
              />
            );

          case BLOCK_TYPES.CODE:
            return <CodeBlock key={key} block={block} />;

          case BLOCK_TYPES.QUOTE:
            return <QuoteBlock key={key} block={block} />;

          case BLOCK_TYPES.NOTE:
            return (
              <MessageBlock
                key={key}
                block={block}
                tone="note"
              />
            );

          case BLOCK_TYPES.WARNING:
            return (
              <MessageBlock
                key={key}
                block={block}
                tone="warning"
              />
            );

          case BLOCK_TYPES.IMAGE:
            return (
              <ImageBlock
                key={key}
                block={block}
                resolvedSrc={
                  block.mediaId
                    ? resolved[block.mediaId]
                    : undefined
                }
              />
            );

          case BLOCK_TYPES.LINK:
            return <LinkBlock key={key} block={block} />;

          case BLOCK_TYPES.TABLE:
            return <TableBlock key={key} block={block} />;

          case BLOCK_TYPES.DIVIDER:
            return <DividerBlock key={key} />;

          default:
            return (
              <div
                key={key}
                role="note"
                className="border border-dashed border-[#3A3A3A] bg-[#111111] px-4 py-3"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF3E00]">
                  Unsupported block
                </span>

                <p className="mt-1 text-sm text-neutral-400">
                  This content block isn&apos;t supported in this view.
                </p>
              </div>
            );
        }
      })}
    </div>
  );
}

