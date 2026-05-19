import { useMemo } from 'react';
import { useAsyncState } from './useAsyncState';
import { tokenStorage } from '../services/auth/tokenStorage';
import { request } from '../services/api/client';
import type { TransactionDto, PagedResponse } from '../services/transactions/types';
import type { WalletDto } from '../services/wallets/types';

interface TransactionsData {
  transactions: TransactionDto[];
  wallets: WalletDto[];
}

export function useTransactions() {
  const { data, loading, error, refreshing, refresh } = useAsyncState<TransactionsData>(
    async () => {
      const { accessToken } = await tokenStorage.getTokens();
      if (!accessToken) throw new Error('Not authenticated');

      const walletsRes = await request<PagedResponse<WalletDto>>('/api/wallets', { token: accessToken });
      const wallets = walletsRes.items ?? [];

      if (wallets.length === 0) {
        return { transactions: [], wallets: [] };
      }

      const txPromises = wallets.map((wallet) =>
        request<PagedResponse<TransactionDto>>(`/api/wallets/${wallet.id}/transactions?page=1&pageSize=100`, {
          token: accessToken,
        }).catch(() => ({
          items: [],
          pageNumber: 1,
          pageSize: 100,
          totalCount: 0,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
        } as PagedResponse<TransactionDto>)),
      );

      const txResults = await Promise.all(txPromises);
      const transactions = txResults.flatMap((res) => res.items ?? []);

      return { transactions, wallets };
    },
    { immediate: true },
  );

  const groupedByDate = useMemo(() => {
    const txs = data?.transactions ?? [];
    return txs.reduce<Record<string, TransactionDto[]>>((acc, tx) => {
      const dateKey = new Date(tx.transactionDate).toLocaleDateString('vi-VN');
      return {
        ...acc,
        [dateKey]: [...(acc[dateKey] ?? []), tx],
      };
    }, {});
  }, [data?.transactions]);

  return useMemo(
    () => ({
      transactions: data?.transactions ?? [],
      wallets: data?.wallets ?? [],
      groupedByDate,
      loading,
      refreshing,
      error,
      refresh,
    }),
    [data, groupedByDate, loading, refreshing, error, refresh],
  );
}
