const TAGS = {
  2: 'h2',
  3: 'h3',
  4: 'h4',
};

const STYLES = {
  2: 'text-2xl sm:text-3xl font-bold',
  3: 'text-xl sm:text-2xl font-semibold',
  4: 'text-lg sm:text-xl font-semibold',
};

export default function HeadingBlock({ block }) {
  const Tag = TAGS[block.level] ?? 'h2';

  return (
    <Tag
      className={`break-words border-l-2 border-[#FF3E00] pl-4 tracking-tight text-white ${
        STYLES[block.level] ?? STYLES[2]
      }`}
    >
      {block.text}
    </Tag>
  );
}

