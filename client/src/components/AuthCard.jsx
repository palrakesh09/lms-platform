export default function AuthCard({
  title,
  description,
  footer,
  children,
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative overflow-hidden border border-neutral-800 bg-[#111111] shadow-2xl">
        {/* top accent */}
        <div className="h-1 bg-[#FF3E00]" />

        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF3E00]">
                LMS / AUTH
              </span>

              <span className="h-px flex-1 bg-neutral-800" />

              <span className="font-mono text-[9px] text-neutral-700">
                SECURE
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              {title}
            </h1>

            {description && (
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                {description}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>

      {footer && (
        <div className="mt-4 border border-neutral-800 bg-[#111111] px-5 py-4 text-center text-sm text-neutral-500">
          {footer}
        </div>
      )}
    </div>
  );
}