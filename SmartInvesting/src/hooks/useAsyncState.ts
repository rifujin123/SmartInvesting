import { useState, useCallback, useEffect } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

export interface UseAsyncOptions {
  immediate?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Generic async state hook. Handles loading, error, data, refresh.
 */
export function useAsyncState<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions = {},
): AsyncState<T> & { refresh: () => Promise<void> } {
  const { immediate = true, onError } = options;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
    refreshing: false,
  });

  const execute = useCallback(
    async (isRefresh = false) => {
      try {
        setState((prev) => ({
          ...prev,
          [isRefresh ? 'refreshing' : 'loading']: true,
          error: null,
        }));

        const result = await asyncFn();
        setState((prev) => ({
          ...prev,
          data: result,
          loading: false,
          refreshing: false,
          error: null,
        }));
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({
          ...prev,
          loading: false,
          refreshing: false,
          error: error.message,
        }));
        onError?.(error);
      }
    },
    [asyncFn, onError],
  );

  useEffect(() => {
    if (immediate) {
      void execute(false);
    }
  }, [immediate, execute]);

  const refresh = useCallback(() => execute(true), [execute]);

  return {
    ...state,
    refresh,
  };
}
