export default function ParagraphBlock({ block }) {
  return (
    <p className="break-words whitespace-pre-line text-[15px] leading-7 text-neutral-300 sm:text-base">
      {block.text}
    </p>
  );
}

