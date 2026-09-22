export default function QuestionPalette({ questions, answers, current, onSelect }) {
  return (
    <nav aria-label="Question navigator" className="flex flex-wrap gap-2">
      {questions.map((question, index) => {
        const answered = Boolean(answers[question.id]);
        const isCurrent = index === current;
        return (
          <button key={question.id} type="button" onClick={() => onSelect(index)}
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={`Question ${index + 1}${answered ? ', answered' : ', not answered'}`}
            className={`flex size-9 items-center justify-center rounded-md text-sm font-medium ring-1 ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              isCurrent ? 'bg-indigo-600 text-white ring-indigo-600' : answered ? 'bg-emerald-50 text-emerald-800 ring-emerald-300' : 'bg-white text-slate-700 ring-slate-300'
            }`}>
            {index + 1}
          </button>
        );
      })}
    </nav>
  );
}