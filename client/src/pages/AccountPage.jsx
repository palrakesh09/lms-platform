import { useAuth } from '../hooks/useAuth.js';

export default function AccountPage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your account</h1>
        <p className="mt-2 text-slate-600">
          This page is only visible when logged in. The details below come from <code>GET /api/auth/me</code>.
        </p>
      </div>

      <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm font-medium text-slate-500">Name</dt>
          <dd className="text-sm text-slate-900">{user.name}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm font-medium text-slate-500">Email</dt>
          <dd className="text-sm text-slate-900">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm font-medium text-slate-500">Role</dt>
          <dd className="text-sm capitalize text-slate-900">{user.role}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm font-medium text-slate-500">Member since</dt>
          <dd className="text-sm text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={logout}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Log out
      </button>
    </div>
  );
}