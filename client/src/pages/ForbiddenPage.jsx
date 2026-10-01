import { Link } from 'react-router';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg border border-[#2A2A2A] bg-[#111111] p-6 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#FF3E00]/40 bg-[#FF3E00]/10">
          <span className="font-mono text-xl font-bold text-[#FF3E00]">
            403
          </span>
        </div>

        <span className="mt-6 block font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
          Access Control
        </span>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Access denied
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
          You don&apos;t have permission to view
          this page.
        </p>

        <div className="mt-7">
          <Link
            to="/"
            className="inline-flex min-h-10 w-full items-center justify-center border border-[#FF3E00] bg-[#FF3E00] px-5 text-sm font-semibold text-white transition hover:border-[#FF531F] hover:bg-[#FF531F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00] sm:w-auto"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

