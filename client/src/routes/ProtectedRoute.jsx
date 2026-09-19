import { Navigate, Outlet, useLocation } from 'react-router';
import PageLoader from '../components/PageLoader.jsx';
import { AUTH_STATUS } from '../context/AuthContext.js';
import { useAuth } from '../hooks/useAuth.js';

// Authenticated or not, nothing more. Role-based protection arrives in Phase 4.
// This is a UX guard only. The API enforces authentication on every protected endpoint.
export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === AUTH_STATUS.LOADING) {
    return <PageLoader />;
  }

  if (status === AUTH_STATUS.GUEST) {
    // Remember where the user was going so login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}