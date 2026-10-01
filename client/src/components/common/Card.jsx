export default function Card({
  children,
  className = "",
  interactive = false,
  ...props
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-sm border border-[#2A2A2A]",
        "bg-[#111111]",
        "transition-all duration-200 ease-out",
        interactive
          ? [
              "cursor-pointer",
              "hover:-translate-y-1",
              "hover:border-[#FF3E00]/60",
              "hover:bg-[#151515]",
              "hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]",
              "active:translate-y-0",
              "focus-within:border-[#FF3E00]/60",
            ].join(" ")
          : "",
        className,
      ].join(" ")}
      {...props}
    >
      {" "}
      {children}{" "}
    </div>
  );
}
