import { Link } from 'react-router';

// Rendered in place (the URL is kept), so the back button doesn't loop.
export default function ForbiddenPage() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-semibold text-indigo-600">403</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Access denied</h1>
      <p className="mt-2 text-slate-600">You don&apos;t have permission to view this page.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Back to home
      </Link>
    </div>
  );
}