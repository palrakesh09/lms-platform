import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { NotificationsProvider } from './context/NotificationsProvider.jsx';
import { AIAssistantProvider } from './context/AIAssistantProvider.jsx';
import AIAssistant from './components/ai/AIAssistant.jsx';

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
      <AIAssistantProvider>
      <ErrorBoundary>
        <AppRoutes />
        </ErrorBoundary>
      <AIAssistant />
    </AIAssistantProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}