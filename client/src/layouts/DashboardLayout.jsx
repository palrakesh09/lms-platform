import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import SkipLink from '../components/common/SkipLink.jsx';
import DashboardSidebar from '../components/dashboard/DashboardSidebar.jsx';
import DashboardTopbar from '../components/dashboard/DashboardTopbar.jsx';
import { ToastProvider } from '../context/ToastProvider.jsx';
import { useDrawer } from '../hooks/useDrawer.js';

// App shell: the sidebar and the content scroll independently.
// Desktop (lg+): permanent sidebar. Below lg: off-canvas drawer opened from the topbar.
// Only ever rendered behind DashboardGate, which has already checked the user's role (UX only).
export default function DashboardLayout({ area }) {
  const { pathname } = useLocation();
  const drawer = useDrawer();
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const closeDrawer = () => drawer.setOpen(false);

  return (
    <ToastProvider>
      <div className="flex h-dvh overflow-hidden bg-slate-50 text-slate-900">
        <SkipLink />

        {drawer.open && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close navigation"
            onClick={closeDrawer}
            className="fixed inset-0 z-30 cursor-default bg-slate-900/40 lg:hidden"
          />
        )}

        <aside
          id="dashboard-sidebar"
          className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col border-r border-slate-200 bg-white transition-transform motion-reduce:transition-none lg:static lg:z-auto lg:visible lg:translate-x-0 ${
            drawer.open ? 'translate-x-0' : 'invisible -translate-x-full'
          }`}
        >
          <DashboardSidebar area={area} onNavigate={closeDrawer} onClose={closeDrawer} closeRef={drawer.closeRef} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar
            area={area}
            drawerOpen={drawer.open}
            onMenu={() => drawer.setOpen(true)}
            menuRef={drawer.openerRef}
          />
          <main id="main-content" ref={mainRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              <ErrorBoundary resetKey={pathname}>
                <Outlet />
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}