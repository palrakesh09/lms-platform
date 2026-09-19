import { Link } from 'react-router';
import AuthCard from '../components/AuthCard.jsx';
import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../hooks/useAuth.js';

const REGISTER_FIELDS = [
  { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name', required: true },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', required: true },
  {
    name: 'password',
    label: 'Password (at least 8 characters)',
    type: 'password',
    autoComplete: 'new-password',
    required: true,
  },
];

export default function RegisterPage() {
  const { register, login } = useAuth();

  // The API's register endpoint doesn't start a session, so log in right after it succeeds.
  const handleRegister = async ({ name, email, password }) => {
    await register({ name, email, password });
    await login({ email, password });
  };

  return (
    <AuthCard
      title="Create your account"
      description="Sign up as a student to start learning."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </>
      }
    >
      <AuthForm
        fields={REGISTER_FIELDS}
        submitLabel="Create account"
        pendingLabel="Creating account…"
        onSubmit={handleRegister}
      />
    </AuthCard>
  );
}