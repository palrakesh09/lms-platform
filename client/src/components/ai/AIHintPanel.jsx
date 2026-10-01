export default function AIHintPanel({ onHint, disabled }) {
  return (
    <div className="shrink-0 border-t border-[#2A2A2A] bg-[#111111] p-2.5">
      {" "}
      <button
        type="button"
        disabled={disabled}
        onClick={onHint}
        className=" flex min-h-9 w-full items-center justify-center gap-2 border border-[#3A3A3A] bg-transparent px-3 font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-400 transition-all duration-200 hover:border-[#FF3E00] hover:text-[#FF3E00] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00] "
      >
        {" "}
        <span className="size-1.5 bg-[#FF3E00]" /> Give me a hint{" "}
      </button>{" "}
      <p className="mt-2 text-center text-[10px] leading-4 text-neutral-600">
        {" "}
        Hints become more specific each time you ask.{" "}
      </p>{" "}
    </div>
  );
}
