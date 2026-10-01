import { Link } from 'react-router';
import AuthCard from '../components/AuthCard.jsx';
import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../hooks/useAuth.js';

const REGISTER_FIELDS = [
  {
    name: 'name',
    label: 'Full name',
    type: 'text',
    autoComplete: 'name',
    placeholder: 'Your full name',
    required: true,
  },
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
    autoComplete: 'new-password',
    placeholder: 'At least 8 characters',
    required: true,
  },
];

export default function RegisterPage() {
  const { register, login } = useAuth();

  const handleRegister = async ({
    name,
    email,
    password,
  }) => {
    await register({
      name,
      email,
      password,
    });

    await login({
      email,
      password,
    });
  };

  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#0A0A0A]">
      <div className="pointer-events-none absolute inset-0 grid-background opacity-30" />

      <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center justify-center px-4 py-16 sm:px-6">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1fr_28rem]">
          <div className="hidden lg:block">
            <p className="mono-label text-[#FF3E00]">
              SYSTEM / REGISTER
            </p>

            <h2 className="mt-5 max-w-2xl text-6xl font-bold leading-[0.95] tracking-tight text-white">
              Start
              <br />
              <span className="text-neutral-600">
                learning.
              </span>
            </h2>

            <p className="mt-8 max-w-lg text-base leading-7 text-neutral-500">
              Build real development skills through
              structured courses, practice and projects.
            </p>

            <div className="mt-10 space-y-3 font-mono text-xs text-neutral-600">
              <p>
                <span className="text-[#FF3E00]">01</span>{' '}
                Structured learning paths
              </p>

              <p>
                <span className="text-[#FF3E00]">02</span>{' '}
                Hands-on coding exercises
              </p>

              <p>
                <span className="text-[#FF3E00]">03</span>{' '}
                Progress tracking
              </p>

              <p>
                <span className="text-[#FF3E00]">04</span>{' '}
                AI-powered learning assistance
              </p>
            </div>
          </div>

          <AuthCard
            title="Create account."
            description="Create your student account and start learning."
            footer={
              <>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-[#FF3E00] hover:text-white"
                >
                  Log in →
                </Link>
              </>
            }
          >
            <AuthForm
              fields={REGISTER_FIELDS}
              submitLabel="Create account"
              pendingLabel="Creating account..."
              onSubmit={handleRegister}
            />
          </AuthCard>
        </div>
      </div>
    </main>
  );
}