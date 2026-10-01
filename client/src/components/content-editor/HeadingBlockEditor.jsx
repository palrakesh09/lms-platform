export default function HeadingBlockEditor({ block, onChange }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]">
      {" "}
      <select
        value={block.level}
        onChange={(e) => onChange({ ...block, level: Number(e.target.value) })}
        aria-label="Heading level"
        className=" min-h-10 rounded-sm border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#FF3E00] "
      >
        {" "}
        <option value={2}>H2</option> <option value={3}>H3</option>{" "}
        <option value={4}>H4</option>{" "}
      </select>{" "}
      <input
        type="text"
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Heading text"
        aria-label="Heading text"
        maxLength={200}
        className=" min-h-10 min-w-0 rounded-sm border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#FF3E00] "
      />{" "}
    </div>
  );
}
