import { BLOCK_TYPES, CONTENT_LIMITS as L } from '../contentBlocks.js';
import { getSafeUrl } from '../safeUrl.js';

// Fast, friendly client-side checks. The server (resourceContent.validators.js) is authoritative and
// re-checks everything independently.
export const validateBlock = (block, index) => {
  const label = `Block ${index + 1} (${block.type})`;
  switch (block.type) {
    case BLOCK_TYPES.PARAGRAPH:
    case BLOCK_TYPES.QUOTE:
      return !block.text?.trim() ? `${label}: text is required` : block.text.length > L.MAX_TEXT_LENGTH ? `${label}: text is too long` : null;
    case BLOCK_TYPES.HEADING:
      return !block.text?.trim() ? `${label}: heading text is required` : null;
    case BLOCK_TYPES.BULLET_LIST:
    case BLOCK_TYPES.NUMBERED_LIST:
      return (block.items ?? []).length === 0 ? `${label}: add at least one item` : block.items.some((item) => !item.trim()) ? `${label}: list items cannot be empty` : null;
    case BLOCK_TYPES.CODE:
      return !block.code?.trim() ? `${label}: code is required` : null;
    case BLOCK_TYPES.NOTE:
    case BLOCK_TYPES.WARNING:
      return !block.text?.trim() ? `${label}: text is required` : null;
    case BLOCK_TYPES.IMAGE:
      return !getSafeUrl(block.url) ? `${label}: a valid image URL is required` : !block.alt?.trim() ? `${label}: alt text is required` : null;
    case BLOCK_TYPES.LINK:
      return !getSafeUrl(block.url) ? `${label}: a valid URL is required` : !block.text?.trim() ? `${label}: link text is required` : null;
    case BLOCK_TYPES.TABLE:
      return (block.headers ?? []).length === 0 ? `${label}: add at least one column` : (block.rows ?? []).some((row) => row.length !== block.headers.length) ? `${label}: every row must match the number of columns` : null;
    case BLOCK_TYPES.DIVIDER:
      return null;
    default:
      return `${label}: unsupported block type`;
  }
};

export const validateContent = (content) => {
  if (!content || !Array.isArray(content.blocks)) return null;
  for (let i = 0; i < content.blocks.length; i += 1) {
    const error = validateBlock(content.blocks[i], i);
    if (error) return error;
  }
  return content.blocks.length > L.MAX_BLOCKS ? `A resource can have at most ${L.MAX_BLOCKS} blocks` : null;
};