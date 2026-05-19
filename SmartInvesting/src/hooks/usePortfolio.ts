import { useMemo } from 'react';
import { useAsyncState } from './useAsyncState';
import { tokenStorage } from '../services/auth/tokenStorage';
import { request } from '../services/api/client';
import type { DashboardSummaryDto } from '../services/dashboard/dashboardService';

export interface PortfolioHolding {
  id: string;
  assetId: number;
  ticker: string;
  assetName: string;
  assetType?: number;
  totalQuantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface InvestmentOrderRow {
  id: string;
  assetTicker?: string;
  assetName?: string;
  quantity: number;
  price: number;
  fee: number;
  orderType: 0 | 1;
  orderDate: string;
  realizedProfitLoss?: number | null;
}

interface PortfolioData {
  summary: {
    totalValue: number;
    totalCost: number;
    totalUnrealizedPnL: number;
    totalUnrealizedPnLPercent: number;
    totalRealizedPnL: number;
  };
  holdings: PortfolioHolding[];
  orders: InvestmentOrderRow[];
}

const emptySummary: PortfolioData['summary'] = {
  totalValue: 0,
  totalCost: 0,
  totalUnrealizedPnL: 0,
  totalUnrealizedPnLPercent: 0,
  totalRealizedPnL: 0,
};

export function usePortfolio() {
  const { data, loading, error, refreshing, refresh } = useAsyncState<PortfolioData>(
    async () => {
      const { accessToken } = await tokenStorage.getTokens();
      if (!accessToken) throw new Error('Not authenticated');

      const [summary, holdings, orders] = await Promise.all([
        request<DashboardSummaryDto>('/api/dashboard?refreshMarketPrices=true', { token: accessToken }),
        request<PortfolioHolding[]>('/api/holdings/types/3?refreshMarketPrice=true', { token: accessToken }).catch(() => []),
        request<InvestmentOrderRow[]>('/api/investment-orders', { token: accessToken }).catch(() => []),
      ]);

      const totalValue = summary.portfolioNav ?? holdings.reduce((sum, h) => sum + h.marketValue, 0);
      const totalCost = summary.portfolioInvestment ?? holdings.reduce((sum, h) => sum + h.costBasis, 0);
      const totalUnrealizedPnL = summary.portfolioProfitLoss ?? totalValue - totalCost;
      const totalUnrealizedPnLPercent = summary.portfolioProfitLossPercent ?? (totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0);
      const totalRealizedPnL = orders.reduce((sum, o) => sum + (o.realizedProfitLoss ?? 0), 0);

      return {
        summary: {
          totalValue,
          totalCost,
          totalUnrealizedPnL,
          totalUnrealizedPnLPercent,
          totalRealizedPnL,
        },
        holdings,
        orders,
      };
    },
    { immediate: true },
  );

  return useMemo(
    () => ({
      summary: data?.summary ?? emptySummary,
      holdings: data?.holdings ?? [],
      orders: data?.orders ?? [],
      loading,
      refreshing,
      error,
      refresh,
    }),
    [data, loading, refreshing, error, refresh],
  );
}
