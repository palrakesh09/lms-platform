import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { AUTH_STATUS, AuthContext } from './AuthContext.jsx';

const GUEST_STATE = { status: AUTH_STATUS.GUEST, user: null };

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: AUTH_STATUS.LOADING, user: null });

  // On startup, ask the API who we are. The httpOnly cookie is attached automatically.
  useEffect(() => {
    const controller = new AbortController();

    const restoreSession = async () => {
      try {
        const user = await authService.getCurrentUser(controller.signal);
        setState({ status: AUTH_STATUS.AUTHENTICATED, user });
      } catch {
        if (controller.signal.aborted) return;
        setState(GUEST_STATE); // 401 (or an unreachable API) means "not logged in"
      }
    };

    restoreSession();

    return () => controller.abort();
  }, []);

  const login = useCallback(async (credentials) => {
    await authService.login(credentials); // sets the cookie
    const user = await authService.getCurrentUser(); // then read the identity back
    setState({ status: AUTH_STATUS.AUTHENTICATED, user });
    return user;
  }, []);

  // Registration does not authenticate. Callers log in afterwards.
  const register = useCallback((payload) => authService.register(payload), []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Local state is cleared regardless. If the API was unreachable, the cookie will still
      // exist and the session is restored on the next page load.
      console.error('Logout request failed:', error);
    }
    setState(GUEST_STATE);
  }, []);

  const value = useMemo(
    () => ({
      status: state.status,
      user: state.user,
      isAuthenticated: state.status === AUTH_STATUS.AUTHENTICATED,
      login,
      register,
      logout,
    }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}