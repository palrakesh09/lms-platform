export const BLOCK_TYPES = Object.freeze({
  PARAGRAPH: 'paragraph',
  HEADING: 'heading',
  BULLET_LIST: 'bullet-list',
  NUMBERED_LIST: 'numbered-list',
  CODE: 'code',
  QUOTE: 'quote',
  NOTE: 'note',
  WARNING: 'warning',
  IMAGE: 'image',
  LINK: 'link',
  DIVIDER: 'divider',
  TABLE: 'table',
});

// Languages relevant to this LMS's own courses (HTML/CSS/JS/React/Node/Mongo). "plaintext" covers
// anything else without opening the door to an unbounded free-text language field.
export const CODE_LANGUAGES = Object.freeze([
  'html', 'css', 'javascript', 'typescript', 'jsx', 'tsx', 'json', 'bash', 'sql', 'python', 'java', 'cpp', 'plaintext',
]);

// Centralized so the server, the model's defense-in-depth check, and any future tooling agree.
export const CONTENT_LIMITS = Object.freeze({
  CONTENT_VERSION: 1,
  MAX_BLOCKS: 100,
  MAX_TEXT_LENGTH: 5000,
  MAX_HEADING_LENGTH: 200,
  MAX_CODE_LENGTH: 20000,
  MAX_LIST_ITEMS: 50,
  MAX_LIST_ITEM_LENGTH: 500,
  MAX_TABLE_ROWS: 50,
  MAX_TABLE_COLUMNS: 10,
  MAX_TABLE_CELL_LENGTH: 300,
  MAX_ALT_LENGTH: 250,
  MAX_CAPTION_LENGTH: 300,
  MAX_FILENAME_LENGTH: 120,
  MAX_LINK_TEXT_LENGTH: 200,
  MAX_CONTENT_BYTES: 200 * 1024, // 200KB serialized JSON, checked against the whole {version, blocks} object
});