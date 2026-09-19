import { Link } from 'react-router';
import AuthCard from '../components/AuthCard.jsx';
import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../hooks/useAuth.js';

const LOGIN_FIELDS = [
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', required: true },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    autoComplete: 'current-password',
    required: true,
  },
];

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <AuthCard
      title="Log in"
      description="Welcome back. Enter your details to continue."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Create one
          </Link>
        </>
      }
    >
      <AuthForm
        fields={LOGIN_FIELDS}
        submitLabel="Log in"
        pendingLabel="Logging in…"
        onSubmit={login}
      />
    </AuthCard>
  );
}