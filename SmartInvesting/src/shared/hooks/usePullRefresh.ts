import { useCallback, useState } from "react";

interface UsePullRefreshOptions {
  onRefresh: () => Promise<void> | void;
  minDuration?: number;
}

export function usePullRefresh({ onRefresh, minDuration = 800 }: UsePullRefreshOptions) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const startedAt = Date.now();

    try {
      await onRefresh();
    } finally {
      const delay = Math.max(0, minDuration - (Date.now() - startedAt));
      setTimeout(() => setRefreshing(false), delay);
    }
  }, [minDuration, onRefresh]);

  return { refreshing, onRefresh: handleRefresh };
}
