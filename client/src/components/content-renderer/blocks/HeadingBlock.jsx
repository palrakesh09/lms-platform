const TAGS = { 2: 'h2', 3: 'h3', 4: 'h4' };
const STYLES = { 2: 'text-xl font-bold', 3: 'text-lg font-semibold', 4: 'text-base font-semibold' };

// Real semantic heading levels (§30) — h2/h3/h4 only, never used purely for visual size (the resource's
// own title is the page's h1, so authored headings correctly nest under it).
export default function HeadingBlock({ block }) {
  const Tag = TAGS[block.level] ?? 'h2';
  return <Tag className={`break-words tracking-tight text-slate-900 ${STYLES[block.level] ?? STYLES[2]}`}>{block.text}</Tag>;
}