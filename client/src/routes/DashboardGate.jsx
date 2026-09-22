import Navbar from '../components/Navbar.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ForbiddenPage from '../pages/ForbiddenPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Dashboards sit outside MainLayout, so a denied user gets a framed 403 page with the normal navbar.
// The dashboard layout and its sidebar are never rendered for the wrong role.
function ForbiddenScreen() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <ForbiddenPage />
      </main>
    </div>
  );
}

export default function DashboardGate({ area, roles }) {
  return (
    <ProtectedRoute roles={roles} forbidden={<ForbiddenScreen />}>
      <DashboardLayout area={area} />
    </ProtectedRoute>
  );
}