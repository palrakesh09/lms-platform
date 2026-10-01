export default function ListBlock({ block, ordered }) {
  const Tag = ordered ? 'ol' : 'ul';

  return (
    <Tag
      className={`space-y-2 pl-6 text-[15px] leading-7 text-neutral-300 sm:text-base ${
        ordered ? 'list-decimal' : 'list-disc'
      }`}
    >
      {(block.items ?? []).map((item, index) => (
        <li
          key={index}
          className="break-words pl-1 marker:text-[#FF3E00]"
        >
          {item}
        </li>
      ))}
    </Tag>
  );
}

