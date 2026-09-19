import { useCallback, useEffect, useState } from 'react';
import { getHealth } from '../services/healthService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export const BACKEND_STATUS = Object.freeze({
  CHECKING: 'checking',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
});

export function useBackendStatus() {
  const [state, setState] = useState({ status: BACKEND_STATUS.CHECKING, message: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const checkHealth = async () => {
      try {
        const data = await getHealth(controller.signal);

        if (data?.success === true) {
          setState({ status: BACKEND_STATUS.CONNECTED, message: data.message });
        } else {
          setState({
            status: BACKEND_STATUS.DISCONNECTED,
            message: 'Received an unexpected response. Check that VITE_API_URL points to the API.',
          });
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({ status: BACKEND_STATUS.DISCONNECTED, message: getErrorMessage(error) });
      }
    };

    checkHealth();

    return () => controller.abort();
  }, [attempt]);

  const recheck = useCallback(() => {
    setState({ status: BACKEND_STATUS.CHECKING, message: '' });
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, recheck };
}