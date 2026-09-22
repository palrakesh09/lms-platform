import { Outlet, useLocation } from 'react-router';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import SkipLink from '../components/common/SkipLink.jsx';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <SkipLink />
      <Navbar />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* A rendering error keeps the navbar, and navigating elsewhere clears it. */}
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}