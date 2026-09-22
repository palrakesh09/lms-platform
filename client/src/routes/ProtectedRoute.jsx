import { Navigate, Outlet, useLocation } from 'react-router';
import PageLoader from '../components/PageLoader.jsx';
import { AUTH_STATUS } from '../context/AuthContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import ForbiddenPage from '../pages/ForbiddenPage.jsx';
import { hasRole } from '../utils/roles.js';

// Usage as a layout route:  <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}> ...children... </Route>
// Usage as a wrapper:       <ProtectedRoute roles={[ROLES.ADMIN]}><Page /></ProtectedRoute>
//
// No `roles` prop: any authenticated user may enter.
// With `roles`: guests go to login, and authenticated users with another role see the 403 page
// (or `forbidden`, for routes that sit outside MainLayout and need their own frame).
// This is a UX guard only. The API enforces authentication and roles on every endpoint.
export default function ProtectedRoute({ roles, forbidden, children }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === AUTH_STATUS.LOADING) {
    return <PageLoader />;
  }

  if (status === AUTH_STATUS.GUEST) {
    // Remember where the user was going so login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !hasRole(user, roles)) {
    return forbidden ?? <ForbiddenPage />;
  }

  return children ?? <Outlet />;
}