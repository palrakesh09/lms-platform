import { z } from 'zod';
import { BLOCK_TYPES, CODE_LANGUAGES, CONTENT_LIMITS as L } from '../constants/contentBlocks.js';
import { isHttpUrl } from '../utils/isHttpUrl.js';

const blockId = z.string().trim().max(40).optional(); // client-generated, for React keys/reordering only
const requiredText = (max) => z.string().trim().min(1, 'Text is required').max(max);
const optionalText = (max) => z.string().trim().max(max).optional();
const httpUrl = (max) =>
  z.string().trim().min(1, 'URL is required').max(max).refine(isHttpUrl, 'Must be a valid http(s) URL');

const paragraphBlock = z.strictObject({ id: blockId, type: z.literal(BLOCK_TYPES.PARAGRAPH), text: requiredText(L.MAX_TEXT_LENGTH) });

const headingBlock = z.strictObject({
  id: blockId,
  type: z.literal(BLOCK_TYPES.HEADING),
  level: z.number('Heading level is required').int().min(2, 'Heading level must be 2, 3 or 4').max(4, 'Heading level must be 2, 3 or 4'),
  text: requiredText(L.MAX_HEADING_LENGTH),
});

const listItems = z.array(requiredText(L.MAX_LIST_ITEM_LENGTH), 'Add at least one item').min(1).max(L.MAX_LIST_ITEMS);
const bulletListBlock = z.strictObject({ id: blockId, type: z.literal(BLOCK_TYPES.BULLET_LIST), items: listItems });
const numberedListBlock = z.strictObject({ id: blockId, type: z.literal(BLOCK_TYPES.NUMBERED_LIST), items: listItems });

const codeBlock = z.strictObject({
  id: blockId,
  type: z.literal(BLOCK_TYPES.CODE),
  language: z.enum(CODE_LANGUAGES, `Language must be one of: ${CODE_LANGUAGES.join(', ')}`),
  code: requiredText(L.MAX_CODE_LENGTH),
  filename: optionalText(L.MAX_FILENAME_LENGTH),
  description: optionalText(L.MAX_TEXT_LENGTH),
});

const quoteBlock = z.strictObject({
  id: blockId,
  type: z.literal(BLOCK_TYPES.QUOTE),
  text: requiredText(L.MAX_TEXT_LENGTH),
  attribution: optionalText(200),
});

// Note and warning share a shape; they differ only in presentation (see the renderer's MessageBlock).
const messageBlock = (type) => z.strictObject({ id: blockId, type: z.literal(type), title: optionalText(150), text: requiredText(L.MAX_TEXT_LENGTH) });
const noteBlock = messageBlock(BLOCK_TYPES.NOTE);
const warningBlock = messageBlock(BLOCK_TYPES.WARNING);

const imageBlock = z.strictObject({
  id: blockId,
  type: z.literal(BLOCK_TYPES.IMAGE),
  url: httpUrl(2048),
  alt: requiredText(L.MAX_ALT_LENGTH), // never optional: images must carry useful alt text (§19)
  caption: optionalText(L.MAX_CAPTION_LENGTH),
});

const linkBlock = z.strictObject({
  id: blockId,
  type: z.literal(BLOCK_TYPES.LINK),
  text: requiredText(L.MAX_LINK_TEXT_LENGTH),
  url: httpUrl(2048),
});

const dividerBlock = z.strictObject({ id: blockId, type: z.literal(BLOCK_TYPES.DIVIDER) });

const tableCell = z.string().trim().max(L.MAX_TABLE_CELL_LENGTH);
const tableBlock = z
  .strictObject({
    id: blockId,
    type: z.literal(BLOCK_TYPES.TABLE),
    headers: z.array(tableCell).min(1, 'Add at least one column').max(L.MAX_TABLE_COLUMNS),
    rows: z.array(z.array(tableCell)).max(L.MAX_TABLE_ROWS),
  })
  .refine((v) => v.rows.every((row) => row.length === v.headers.length), {
    message: 'Every row must have the same number of cells as there are headers',
    path: ['rows'],
  });

// discriminatedUnion rejects any block whose `type` doesn't match one of these literals — this IS the
// "reject unknown block types" rule (§4), enforced by construction rather than an extra check.
const blockSchema = z.discriminatedUnion('type', [
  paragraphBlock, headingBlock, bulletListBlock, numberedListBlock, codeBlock,
  quoteBlock, noteBlock, warningBlock, imageBlock, linkBlock, dividerBlock, tableBlock,
]);

export const resourceContentSchema = z
  .strictObject({
    version: z.literal(L.CONTENT_VERSION, `content.version must be ${L.CONTENT_VERSION}`),
    blocks: z.array(blockSchema, 'blocks must be an array').max(L.MAX_BLOCKS, `A resource can have at most ${L.MAX_BLOCKS} blocks`),
  })
  .refine(
    (content) => Buffer.byteLength(JSON.stringify(content), 'utf8') <= L.MAX_CONTENT_BYTES,
    { message: `Content is too large (max ${Math.round(L.MAX_CONTENT_BYTES / 1024)}KB)`, path: ['blocks'] },
  );