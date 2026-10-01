export default function QuoteBlock({ block }) {
  return (
    <blockquote className="border-l-2 border-[#FF3E00] bg-[#111111] px-4 py-4 sm:px-5">
      <p className="break-words whitespace-pre-line text-[15px] leading-7 italic text-neutral-300 sm:text-base">
        {block.text}
      </p>

      {block.attribution && (
        <cite className="mt-3 block font-mono text-[11px] not-italic uppercase tracking-wider text-neutral-500">
          — {block.attribution}
        </cite>
      )}
    </blockquote>
  );
}

