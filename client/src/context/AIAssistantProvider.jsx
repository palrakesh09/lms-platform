// context/AIAssistantProvider.jsx — same shape as Phase 14's NotificationsProvider.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { getAiStatus } from '../services/aiService.js';
import { AIAssistantContext } from './AIAssistantContext.js';

export function AIAssistantProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [activeContext, setActiveContext] = useState(null); // { type, id, title } | null

  useEffect(() => {
    if (!isAuthenticated) return;
    getAiStatus().then((s) => setEnabled(s.enabled)).catch(() => setEnabled(false));
  }, [isAuthenticated]);

  const setContext = useCallback((ctx) => setActiveContext(ctx), []);
  const clearContext = useCallback(() => setActiveContext(null), []);

  const value = useMemo(() => ({ enabled: isAuthenticated && enabled, activeContext, setContext, clearContext }), [isAuthenticated, enabled, activeContext, setContext, clearContext]);
  return <AIAssistantContext.Provider value={value}>{children}</AIAssistantContext.Provider>;
}