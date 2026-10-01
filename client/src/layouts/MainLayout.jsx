import { Outlet, useLocation } from 'react-router';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import SkipLink from '../components/common/SkipLink.jsx';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
const { pathname } = useLocation();

return ( <div className="page-shell flex min-h-screen flex-col"> <SkipLink />


  <Navbar />

  <main
    id="main-content"
    className="min-w-0 flex-1"
  >
    <ErrorBoundary resetKey={pathname}>
      <Outlet />
    </ErrorBoundary>
  </main>
</div>


);
}
