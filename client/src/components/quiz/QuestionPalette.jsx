export default function QuestionPalette({
  questions,
  answers,
  current,
  onSelect,
}) {
  return (
    <nav
      aria-label="Question navigator"
      className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:flex lg:flex-wrap"
    >
      {questions.map((question, index) => {
        const answered = Boolean(answers[question.id]);
        const isCurrent = index === current;

        return (
          <button
            key={question.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={`Question ${index + 1}${
              answered ? ', answered' : ', not answered'
            }`}
            className={[
              'flex size-9 items-center justify-center',
              'border font-mono text-xs font-bold',
              'transition-all duration-200',
              'touch-manipulation',
              'focus-visible:outline-2 focus-visible:outline-offset-2',
              'focus-visible:outline-[#FF3E00]',
              'active:scale-95',
              isCurrent
                ? 'border-[#FF3E00] bg-[#FF3E00] text-white'
                : answered
                  ? 'border-[#166534] bg-[#0B2114] text-[#4ADE80]'
                  : 'border-[#2A2A2A] bg-[#111111] text-neutral-500 hover:border-[#3A3A3A] hover:text-white',
            ].join(' ')}
          >
            {String(index + 1).padStart(2, '0')}
          </button>
        );
      })}
    </nav>
  );
}