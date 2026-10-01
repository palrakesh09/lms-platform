import { CODE_LANGUAGES } from "../../utils/contentBlocks.js";
const inputClass = ` min-h-10 rounded-sm border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#FF3E00] `;
export default function CodeBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-3">
      {" "}
      <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]">
        {" "}
        <select
          value={block.language}
          onChange={(e) => onChange({ ...block, language: e.target.value })}
          aria-label="Code language"
          className={inputClass}
        >
          {" "}
          {CODE_LANGUAGES.map((lang) => (
            <option key={lang} value={lang} className="bg-[#111111]">
              {" "}
              {lang}{" "}
            </option>
          ))}{" "}
        </select>{" "}
        <input
          type="text"
          value={block.filename ?? ""}
          onChange={(e) => onChange({ ...block, filename: e.target.value })}
          placeholder="Filename (optional)"
          aria-label="Filename"
          className={inputClass}
        />{" "}
      </div>{" "}
      <textarea
        value={block.code}
        onChange={(e) => onChange({ ...block, code: e.target.value })}
        rows={8}
        maxLength={20000}
        placeholder="Write code..."
        aria-label="Code"
        className=" block w-full resize-y border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-3 font-mono text-xs leading-6 text-neutral-200 placeholder:text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#FF3E00] "
      />{" "}
      <input
        type="text"
        value={block.description ?? ""}
        onChange={(e) => onChange({ ...block, description: e.target.value })}
        placeholder="Description (optional)"
        aria-label="Code description"
        className={`w-full ${inputClass}`}
      />{" "}
    </div>
  );
}
