import { CODE_LANGUAGES } from '../../utils/contentBlocks.js';

export default function CodeBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <select value={block.language} onChange={(e) => onChange({ ...block, language: e.target.value })} aria-label="Code language" className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          {CODE_LANGUAGES.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
        </select>
        <input type="text" value={block.filename ?? ''} onChange={(e) => onChange({ ...block, filename: e.target.value })} placeholder="Filename (optional)" aria-label="Filename" className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
      </div>
      <textarea value={block.code} onChange={(e) => onChange({ ...block, code: e.target.value })} rows={6} maxLength={20000} placeholder="Code" aria-label="Code" className="block w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm shadow-sm" />
      <input type="text" value={block.description ?? ''} onChange={(e) => onChange({ ...block, description: e.target.value })} placeholder="Description (optional)" aria-label="Code description" className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
    </div>
  );
}