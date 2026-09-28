import { BLOCK_TYPES } from '../../utils/contentBlocks.js';
import CodeBlockEditor from './CodeBlockEditor.jsx';
import HeadingBlockEditor from './HeadingBlockEditor.jsx';
import ImageBlockEditor from './ImageBlockEditor.jsx';
import LinkBlockEditor from './LinkBlockEditor.jsx';
import ListBlockEditor from './ListBlockEditor.jsx';
import MessageBlockEditor from './MessageBlockEditor.jsx';
import ParagraphBlockEditor from './ParagraphBlockEditor.jsx';
import QuoteBlockEditor from './QuoteBlockEditor.jsx';
import TableBlockEditor from './TableBlockEditor.jsx';

// Dispatches to the editor for one block's type. Note and Warning share MessageBlockEditor (same
// shape, different presentation downstream) rather than duplicating near-identical components.
export default function BlockEditor({ block, onChange }) {
  switch (block.type) {
    case BLOCK_TYPES.PARAGRAPH: return <ParagraphBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.HEADING: return <HeadingBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.BULLET_LIST:
    case BLOCK_TYPES.NUMBERED_LIST: return <ListBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.CODE: return <CodeBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.QUOTE: return <QuoteBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.NOTE:
    case BLOCK_TYPES.WARNING: return <MessageBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.IMAGE: return <ImageBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.LINK: return <LinkBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.TABLE: return <TableBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.DIVIDER: return <p className="text-xs text-slate-500">A horizontal divider. No settings needed.</p>;
    default: return <p className="text-xs text-red-600">Unknown block type.</p>;
  }
}