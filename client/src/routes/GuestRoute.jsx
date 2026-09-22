import { Navigate, Outlet, useLocation } from 'react-router';
import PageLoader from '../components/PageLoader.jsx';
import { AUTH_STATUS } from '../context/AuthContext.jsx';
import { useAuth } from '../hooks/useAuth.js';

// For pages only guests should see (login, register). Once the auth state becomes
// "authenticated" (right after a successful login), this redirects, so the pages themselves
// never need to navigate.
export default function GuestRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === AUTH_STATUS.LOADING) {
    return <PageLoader />;
  }

  if (status === AUTH_STATUS.AUTHENTICATED) {
    return <Navigate to={location.state?.from ?? '/courses'} replace />;
  }

  return <Outlet />;
}