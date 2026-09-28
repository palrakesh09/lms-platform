export const BLOCK_TYPES = Object.freeze({
  PARAGRAPH: 'paragraph', HEADING: 'heading', BULLET_LIST: 'bullet-list', NUMBERED_LIST: 'numbered-list',
  CODE: 'code', QUOTE: 'quote', NOTE: 'note', WARNING: 'warning', IMAGE: 'image', LINK: 'link',
  DIVIDER: 'divider', TABLE: 'table',
});

export const CODE_LANGUAGES = Object.freeze(['html', 'css', 'javascript', 'typescript', 'jsx', 'tsx', 'json', 'bash', 'sql', 'python', 'java', 'cpp', 'plaintext']);

export const CONTENT_LIMITS = Object.freeze({
  MAX_BLOCKS: 100, MAX_TEXT_LENGTH: 5000, MAX_HEADING_LENGTH: 200, MAX_CODE_LENGTH: 20000,
  MAX_LIST_ITEMS: 50, MAX_TABLE_ROWS: 50, MAX_TABLE_COLUMNS: 10,
});

export const BLOCK_TYPE_OPTIONS = Object.freeze([
  { value: BLOCK_TYPES.PARAGRAPH, label: 'Paragraph' },
  { value: BLOCK_TYPES.HEADING, label: 'Heading' },
  { value: BLOCK_TYPES.BULLET_LIST, label: 'Bullet List' },
  { value: BLOCK_TYPES.NUMBERED_LIST, label: 'Numbered List' },
  { value: BLOCK_TYPES.CODE, label: 'Code' },
  { value: BLOCK_TYPES.QUOTE, label: 'Quote' },
  { value: BLOCK_TYPES.NOTE, label: 'Note' },
  { value: BLOCK_TYPES.WARNING, label: 'Warning' },
  { value: BLOCK_TYPES.IMAGE, label: 'Image' },
  { value: BLOCK_TYPES.LINK, label: 'Link' },
  { value: BLOCK_TYPES.TABLE, label: 'Table' },
  { value: BLOCK_TYPES.DIVIDER, label: 'Divider' },
]);

let counter = 0;
export const newBlockId = () => `b${Date.now().toString(36)}${(counter += 1).toString(36)}`;

// A fresh, empty block of the given type — what "Add Content → <type>" inserts.
export const emptyBlock = (type) => {
  const id = newBlockId();
  switch (type) {
    case BLOCK_TYPES.PARAGRAPH: return { id, type, text: '' };
    case BLOCK_TYPES.HEADING: return { id, type, level: 2, text: '' };
    case BLOCK_TYPES.BULLET_LIST: return { id, type, items: [''] };
    case BLOCK_TYPES.NUMBERED_LIST: return { id, type, items: [''] };
    case BLOCK_TYPES.CODE: return { id, type, language: 'javascript', code: '', filename: '', description: '' };
    case BLOCK_TYPES.QUOTE: return { id, type, text: '', attribution: '' };
    case BLOCK_TYPES.NOTE: return { id, type, title: '', text: '' };
    case BLOCK_TYPES.WARNING: return { id, type, title: '', text: '' };
    case BLOCK_TYPES.IMAGE: return { id, type, url: '', alt: '', caption: '' };
    case BLOCK_TYPES.LINK: return { id, type, text: '', url: '' };
    case BLOCK_TYPES.TABLE: return { id, type, headers: ['', ''], rows: [['', '']] };
    case BLOCK_TYPES.DIVIDER: return { id, type };
    default: return { id, type: BLOCK_TYPES.PARAGRAPH, text: '' };
  }
};