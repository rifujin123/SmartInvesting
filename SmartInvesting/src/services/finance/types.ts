export interface BudgetDto {
  id: number;
  amountLimit: number;
  month: number;
  year: number;
  categoryId: number;
  categoryName: string;
  categoryType: number;
}

export interface BudgetSummaryDto extends BudgetDto {
  budgetId: number;
  totalSpent: number;
  remaining: number;
}

export interface AddBudgetRequestDto {
  amountLimit: number;
  month: number;
  year: number;
  categoryId: number;
}

export interface UpdateBudgetRequestDto extends AddBudgetRequestDto {}

export interface GoalDto {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  icon: string;
  color: string;
  progressPercent: number;
  isCompleted: boolean;
}

export interface AddGoalRequestDto {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string | null;
  icon?: string;
  color?: string;
}

export interface UpdateGoalRequestDto extends Required<AddGoalRequestDto> {}

export interface AddGoalContributionRequestDto {
  amount: number;
}

export interface CategoryDto {
  id: number;
  name: string;
  type: number;
  icon: string;
}

// Dashboard API types
export interface DashboardSummaryDto {
  year: number;
  month: number;
  totalCashBalance: number;
  portfolioNav: number;
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
