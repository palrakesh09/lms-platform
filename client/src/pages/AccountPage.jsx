import { useAuth } from '../hooks/useAuth.js';
import Icon from '../components/common/Icon.jsx';

export default function AccountPage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="border-b border-[#2A2A2A] pb-5 sm:pb-6">
        <div className="flex items-start gap-3">
          <div className="hidden h-10 w-1 shrink-0 bg-[#FF3E00] sm:block" />

          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF3E00]">
              Account
            </span>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Your account
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Manage your account information and view
              the details associated with your LMS profile.
            </p>
          </div>
        </div>
      </header>

      {/* Profile */}
      <section className="overflow-hidden border border-[#2A2A2A] bg-[#111111]">
        <div className="flex flex-col gap-4 border-b border-[#2A2A2A] bg-[#171717] p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[#3A3A3A] bg-[#0D0D0D]">
            <span className="text-xl font-bold text-[#FF3E00]">
              {(user?.name ?? 'U')
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">
              {user.name}
            </p>

            <p className="truncate text-sm text-neutral-500">
              {user.email}
            </p>
          </div>

          <span className="self-start border border-[#FF3E00]/40 bg-[#FF3E00]/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#FF3E00] sm:ml-auto">
            {user.role}
          </span>
        </div>

        {/* Details */}
        <dl className="divide-y divide-[#222222]">
          <div className="grid gap-1 px-4 py-4 sm:grid-cols-[180px_1fr] sm:items-center sm:px-5">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              Name
            </dt>

            <dd className="break-words text-sm text-neutral-200">
              {user.name}
            </dd>
          </div>

          <div className="grid gap-1 px-4 py-4 sm:grid-cols-[180px_1fr] sm:items-center sm:px-5">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              Email
            </dt>

            <dd className="break-all text-sm text-neutral-200">
              {user.email}
            </dd>
          </div>

          <div className="grid gap-1 px-4 py-4 sm:grid-cols-[180px_1fr] sm:items-center sm:px-5">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              Role
            </dt>

            <dd className="text-sm capitalize text-neutral-200">
              {user.role}
            </dd>
          </div>

          <div className="grid gap-1 px-4 py-4 sm:grid-cols-[180px_1fr] sm:items-center sm:px-5">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              Member since
            </dt>

            <dd className="text-sm text-neutral-200">
              {new Date(
                user.createdAt
              ).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </section>

      {/* Security note */}
      <div className="flex gap-3 border border-[#2A2A2A] bg-[#111111] p-4">
        <Icon
          name="info"
          className="mt-0.5 size-4 shrink-0 text-neutral-500"
        />

        <p className="text-xs leading-5 text-neutral-500">
          Your profile information is loaded from your
          authenticated account session.
        </p>
      </div>

      {/* Logout */}
      <div className="border-t border-[#2A2A2A] pt-5">
        <button
          type="button"
          onClick={logout}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 border border-[#3A3A3A] bg-transparent px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:border-[#EF4444] hover:text-[#F87171] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF3E00] sm:w-auto"
        >
          <Icon
            name="log-out"
            className="size-4"
          />
          Log out
        </button>
      </div>
    </div>
  );
}

