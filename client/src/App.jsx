import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { NotificationsProvider } from './context/NotificationsProvider.jsx';

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
      </NotificationsProvider>
    </AuthProvider>
  );
}