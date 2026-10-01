import { BLOCK_TYPES } from "../../utils/contentBlocks.js";
import CodeBlockEditor from "./CodeBlockEditor.jsx";
import HeadingBlockEditor from "./HeadingBlockEditor.jsx";
import ImageBlockEditor from "./ImageBlockEditor.jsx";
import LinkBlockEditor from "./LinkBlockEditor.jsx";
import ListBlockEditor from "./ListBlockEditor.jsx";
import MessageBlockEditor from "./MessageBlockEditor.jsx";
import ParagraphBlockEditor from "./ParagraphBlockEditor.jsx";
import QuoteBlockEditor from "./QuoteBlockEditor.jsx";
import TableBlockEditor from "./TableBlockEditor.jsx";
export default function BlockEditor({ block, onChange }) {
  switch (block.type) {
    case BLOCK_TYPES.PARAGRAPH:
      return <ParagraphBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.HEADING:
      return <HeadingBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.BULLET_LIST:
    case BLOCK_TYPES.NUMBERED_LIST:
      return <ListBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.CODE:
      return <CodeBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.QUOTE:
      return <QuoteBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.NOTE:
    case BLOCK_TYPES.WARNING:
      return <MessageBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.IMAGE:
      return <ImageBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.LINK:
      return <LinkBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.TABLE:
      return <TableBlockEditor block={block} onChange={onChange} />;
    case BLOCK_TYPES.DIVIDER:
      return (
        <p className="border border-dashed border-[#2A2A2A] bg-[#111111] px-3 py-3 font-mono text-[10px] uppercase tracking-wider text-neutral-600">
          {" "}
          Horizontal divider — no settings required.{" "}
        </p>
      );
    default:
      return (
        <p className="border border-[#7F1D1D] bg-[#1A0B0B] px-3 py-3 text-xs text-[#F87171]">
          {" "}
          Unknown block type.{" "}
        </p>
      );
  }
}
