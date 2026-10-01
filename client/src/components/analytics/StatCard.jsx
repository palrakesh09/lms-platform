export default function StatCard({
  label,
  value,
  hint,
}) {
  return (
    <div className="group relative overflow-hidden border border-neutral-800 bg-[#111111] p-4 transition-all duration-200 hover:border-[#3A3A3A] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500 sm:text-xs">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl">
            {value}
          </p>

          {hint && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500 sm:text-sm">
              {hint}
            </p>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-px w-0 bg-[#FF3E00] transition-all duration-300 group-hover:w-full" />
    </div>
  );
}

