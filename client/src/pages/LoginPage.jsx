import { Link } from 'react-router';
import AuthCard from '../components/AuthCard.jsx';
import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../hooks/useAuth.js';

const LOGIN_FIELDS = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'you@example.com',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    autoComplete: 'current-password',
    placeholder: 'Enter your password',
    required: true,
  },
];

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#0A0A0A]">
      <div className="pointer-events-none absolute inset-0 grid-background opacity-30" />

      <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center justify-center px-4 py-16 sm:px-6">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1fr_28rem]">
          {/* Left */}
          <div className="hidden lg:block">
            <p className="mono-label text-[#FF3E00]">
              SYSTEM / LOGIN
            </p>

            <h2 className="mt-5 max-w-2xl text-6xl font-bold leading-[0.95] tracking-tight text-white">
              Continue
              <br />
              <span className="text-neutral-600">
                building.
              </span>
            </h2>

            <p className="mt-8 max-w-lg text-base leading-7 text-neutral-500">
              Access your courses, learning progress,
              assessments and developer workspace.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 border-y border-neutral-800">
              <div className="border-r border-neutral-800 py-4">
                <p className="font-mono text-[10px] text-neutral-600">
                  01
                </p>
                <p className="mt-1 text-sm text-neutral-300">
                  Learn
                </p>
              </div>

              <div className="border-r border-neutral-800 px-4 py-4">
                <p className="font-mono text-[10px] text-neutral-600">
                  02
                </p>
                <p className="mt-1 text-sm text-neutral-300">
                  Practice
                </p>
              </div>

              <div className="px-4 py-4">
                <p className="font-mono text-[10px] text-neutral-600">
                  03
                </p>
                <p className="mt-1 text-sm text-neutral-300">
                  Build
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <AuthCard
            title="Welcome back."
            description="Authenticate to continue your learning journey."
            footer={
              <>
                New to the platform?{' '}
                <Link
                  to="/register"
                  className="font-medium text-[#FF3E00] hover:text-white"
                >
                  Create an account →
                </Link>
              </>
            }
          >
            <AuthForm
              fields={LOGIN_FIELDS}
              submitLabel="Log in"
              pendingLabel="Authenticating..."
              onSubmit={login}
            />
          </AuthCard>
        </div>
      </div>
    </main>
  );
}