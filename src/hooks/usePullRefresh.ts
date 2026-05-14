import { useState, useCallback, ComponentProps } from 'react';
import { RefreshControl, ScrollView, RefreshControlProps, ScrollViewProps } from 'react-native';

type PullScrollViewProps = ScrollViewProps & {
  refreshing: boolean;
  onRefresh: () => void;
};

export interface UsePullRefreshOptions extends Pick<RefreshControlProps, 'tintColor' | 'colors' | 'progressViewOffset'> {
  onRefresh: () => Promise<void> | void;
  /** ms, default 1000 */
  minDuration?: number;
}

export interface UsePullRefreshReturn {
  refreshing: boolean;
  onRefresh: () => void;
  RefreshControlComponent: typeof RefreshControl;
}

export const usePullRefresh = ({
  onRefresh,
  minDuration = 1000,
  ...rest
}: UsePullRefreshOptions): UsePullRefreshReturn => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const start = Date.now();
    try {
      await onRefresh();
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < minDuration) {
        setTimeout(() => setRefreshing(false), minDuration - elapsed);
      } else {
        setRefreshing(false);
      }
    }
  }, [onRefresh, minDuration]);

  return {
    refreshing,
    onRefresh: handleRefresh,
    RefreshControlComponent: RefreshControl,
  };
};

/** Helper: ScrollView with built-in RefreshControl */
export const PullScrollView = ({
  refreshing,
  onRefresh,
  children,
  ...props
}: PullScrollViewProps) => (
  <ScrollView
    {...props}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        {...rest}
      />
    }
  >
    {children}
  </ScrollView>
);
