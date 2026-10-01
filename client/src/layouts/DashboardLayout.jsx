import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';

import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import SkipLink from '../components/common/SkipLink.jsx';
import DashboardSidebar from '../components/dashboard/DashboardSidebar.jsx';
import DashboardTopbar from '../components/dashboard/DashboardTopbar.jsx';
import { ToastProvider } from '../context/ToastProvider.jsx';
import { useDrawer } from '../hooks/useDrawer.js';

export default function DashboardLayout({ area }) {
  const { pathname } = useLocation();
  const drawer = useDrawer();
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  const closeDrawer = () => {
    drawer.setOpen(false);
  };

  return (
    <ToastProvider>
      <div className="fixed inset-0 flex overflow-hidden bg-[#0A0A0A] text-white">
        <SkipLink />

        {/* Mobile / Tablet Overlay */}
        {drawer.open && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close navigation"
            onClick={closeDrawer}
            className="fixed inset-0 z-30 cursor-default bg-black/70 backdrop-blur-sm xl:hidden"
          />
        )}

        {/* Dashboard Sidebar */}
        <aside
          id="dashboard-sidebar"
          className={`fixed inset-y-0 left-0 z-40 flex w-[260px] max-w-[85vw] flex-col border-r border-[#2A2A2A] bg-[#0D0D0D] transition-transform duration-300 motion-reduce:transition-none xl:static xl:z-auto xl:visible xl:translate-x-0 ${
            drawer.open
              ? 'translate-x-0'
              : '-translate-x-full'
          }`}
        >
          <DashboardSidebar
            area={area}
            onNavigate={closeDrawer}
            onClose={closeDrawer}
            closeRef={drawer.closeRef}
          />
        </aside>

        {/* Main Application */}
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar
            area={area}
            drawerOpen={drawer.open}
            onMenu={() => drawer.setOpen(true)}
            menuRef={drawer.openerRef}
          />

          <main
            id="main-content"
            ref={mainRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#0A0A0A]"
          >
            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
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