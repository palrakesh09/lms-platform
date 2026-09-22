import { useCallback, useEffect, useState } from 'react';
import { getErrorInfo } from '../utils/getErrorInfo.js';
import { REQUEST_STATUS } from './useApiResource.js';
import { useAuth } from './useAuth.js';

// Like useApiResource, but refresh() keeps showing the current data while it re-fetches, so a management
// screen doesn't flash back to a skeleton (and lose its open sections) after every change.
//   status         loading only for the first load of a given `fetcher`, or a retry after an error
//   isRefreshing   a background refresh is in flight
//   refreshError   the last background refresh failed (the previous data is still shown)
//   mutate(next)   replace the data with a confirmed server response (or updater function)
// `fetcher` must be memoized with useCallback.
export function useRefreshableResource(fetcher) {
  const { expireSession } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetcher(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return;
        setResult({ fetcher, attempt, status: REQUEST_STATUS.SUCCESS, data, error: null, refreshError: null });
      },
      (error) => {
        if (controller.signal.aborted) return;
        // The cookie is no longer valid: drop to guest state so the route guard sends the user to login.
        if (getErrorInfo(error).kind === 'unauthorized') expireSession();

        setResult((previous) =>
          previous?.fetcher === fetcher && previous.status === REQUEST_STATUS.SUCCESS
            ? { ...previous, attempt, refreshError: error } // keep the data we already have
            : { fetcher, attempt, status: REQUEST_STATUS.ERROR, data: null, error, refreshError: null },
        );
      },
    );

    return () => controller.abort();
  }, [fetcher, attempt, expireSession]);

  const refresh = useCallback(() => setAttempt((current) => current + 1), []);

  const mutate = useCallback(
    (next) =>
      setResult((previous) =>
        previous?.fetcher === fetcher && previous.status === REQUEST_STATUS.SUCCESS
          ? { ...previous, data: typeof next === 'function' ? next(previous.data) : next }
          : previous,
      ),
    [fetcher],
  );

  // Only a result that belongs to the CURRENT fetcher counts. Otherwise we are loading something new.
  const current = result?.fetcher === fetcher ? result : null;
  let status = REQUEST_STATUS.LOADING;
  if (current) {
    const retryingAfterError = current.status === REQUEST_STATUS.ERROR && current.attempt !== attempt;
    status = retryingAfterError ? REQUEST_STATUS.LOADING : current.status;
  }

  return {
    status,
    data: current?.data ?? null,
    error: current?.error ?? null,
    refreshError: current?.refreshError ?? null,
    isRefreshing: current?.status === REQUEST_STATUS.SUCCESS && current.attempt !== attempt,
    refresh,
    reload: refresh,
    mutate,
  };
}