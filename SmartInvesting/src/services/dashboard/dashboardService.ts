import { request } from "../api/client";

export interface DashboardSummaryDto {
  year: number;
  month: number;
  totalCashBalance: number;
  portfolioNav: number;
  portfolioInvestment: number;
  portfolioProfitLoss: number;
  portfolioProfitLossPercent: number;
  totalWealth: number;
  totalExpenseThisMonth: number;
  wallets: DashboardWalletRowDto[];
  budgets: DashboardBudgetRowDto[];
}

export interface DashboardWalletRowDto {
  id: string;
  name: string;
  balance: number;
  currency: string;
  isPaper: boolean;
}

export interface DashboardBudgetRowDto {
  budgetId: number;
  categoryName: string;
  amountLimit: number;
  totalSpent: number;
  remaining: number;
}

export const dashboardService = {
  getSummary(
    token: string,
    month?: number,
    year?: number,
    refreshMarketPrices = false
  ): Promise<DashboardSummaryDto> {
    const params = new URLSearchParams();
    if (month !== undefined) params.append("month", String(month));
    if (year !== undefined) params.append("year", String(year));
    if (refreshMarketPrices) params.append("refreshMarketPrices", "true");

    const query = params.toString();
    const path = query ? `/api/dashboard?${query}` : "/api/dashboard";

    return request<DashboardSummaryDto>(path, { token });
  },
};
