import { useCallback, useEffect, useState } from 'react';
import { getErrorInfo } from '../utils/getErrorInfo.js';
import { useAuth } from './useAuth.js';

export const REQUEST_STATUS = Object.freeze({
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
});

const LOADING_RESULT = { status: REQUEST_STATUS.LOADING, data: null, error: null };

// Runs `fetcher(signal)` whenever `fetcher` changes, so callers must memoize it with useCallback.
// A stored result only counts if it came from the CURRENT fetcher and attempt. Otherwise the hook reports
// "loading", which avoids showing the previous request's data and needs no synchronous setState in the effect.
export function useApiResource(fetcher) {
  const { expireSession } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const settle = (outcome) => {
      if (!controller.signal.aborted) setResult({ fetcher, attempt, ...outcome });
    };

    fetcher(controller.signal).then(
      (data) => settle({ status: REQUEST_STATUS.SUCCESS, data, error: null }),
      (error) => {
        if (controller.signal.aborted) return;
        // The cookie is no longer valid: drop to guest state so the route guard sends the user to login.
        if (getErrorInfo(error).kind === 'unauthorized') expireSession();
        settle({ status: REQUEST_STATUS.ERROR, data: null, error });
      },
    );

    return () => controller.abort();
  }, [fetcher, attempt, expireSession]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);
  const isCurrent = result?.fetcher === fetcher && result?.attempt === attempt;
  const { status, data, error } = isCurrent ? result : LOADING_RESULT;

  return { status, data, error, reload };
}