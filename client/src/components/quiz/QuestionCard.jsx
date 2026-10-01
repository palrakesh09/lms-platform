import { Icon } from "../common/Icon";

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswer,
}) {
  const options = question?.options || [];

  return (
    <section>
      <div className="mb-8">
        <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--accent)]">
          Question
        </div>

        <h1 className="max-w-4xl text-xl font-semibold leading-8 text-white sm:text-2xl sm:leading-9">
          {question?.question || question?.text}
        </h1>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => {
          const value =
            typeof option === "object"
              ? option.value ?? option._id ?? option.id
              : option;

          const label =
            typeof option === "object"
              ? option.label ?? option.text ?? option.value
              : option;

          const selected = selectedAnswer === value;

          return (
            <button
              key={value ?? index}
              type="button"
              onClick={() => onAnswer?.(value)}
              className={[
                "group flex w-full items-center gap-4 border p-4 text-left transition-all duration-200",
                selected
                  ? "border-[var(--accent)] bg-[var(--accent)]/[0.07]"
                  : "border-[var(--border)] bg-[#111] hover:border-white/20 hover:bg-white/[0.025]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-[10px]",
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                    : "border-[var(--border)] text-[var(--muted)]",
                ].join(" ")}
              >
                {String.fromCharCode(65 + index)}
              </span>

              <span
                className={[
                  "flex-1 text-sm leading-6",
                  selected ? "text-white" : "text-[var(--muted)]",
                ].join(" ")}
              >
                {label}
              </span>

              {selected && (
                <Icon
                  name="check"
                  size={15}
                  className="text-[var(--accent)]"
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}