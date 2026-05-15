import { request } from "../api/client";
import {
  AddBudgetRequestDto,
  AddGoalContributionRequestDto,
  AddGoalRequestDto,
  BudgetDto,
  BudgetSummaryDto,
  CategoryDto,
  DashboardSummaryDto,
  GoalDto,
  UpdateBudgetRequestDto,
  UpdateGoalRequestDto,
} from "./types";

export const financeService = {
  getCategories(token: string) {
    return request<CategoryDto[]>("/api/categories", { token });
  },

  getBudgets(token: string) {
    return request<BudgetDto[]>("/api/budgets", { token });
  },

  getBudget(token: string, id: number) {
    return request<BudgetDto>(`/api/budgets/${id}`, { token });
  },

  getBudgetSummary(token: string, id: number) {
    return request<BudgetSummaryDto>(`/api/budgets/${id}/summary`, { token });
  },

  createBudget(token: string, body: AddBudgetRequestDto) {
    return request<BudgetDto>("/api/budgets", { method: "POST", body, token });
  },

  updateBudget(token: string, id: number, body: UpdateBudgetRequestDto) {
    return request<BudgetDto>(`/api/budgets/${id}`, { method: "PUT", body, token });
  },

  deleteBudget(token: string, id: number) {
    return request<BudgetDto>(`/api/budgets/${id}`, { method: "DELETE", token });
  },

  getGoals(token: string) {
    return request<GoalDto[]>("/api/goals", { token });
  },

  getGoal(token: string, id: number) {
    return request<GoalDto>(`/api/goals/${id}`, { token });
  },

  createGoal(token: string, body: AddGoalRequestDto) {
    return request<GoalDto>("/api/goals", { method: "POST", body, token });
  },

  updateGoal(token: string, id: number, body: UpdateGoalRequestDto) {
    return request<GoalDto>(`/api/goals/${id}`, { method: "PUT", body, token });
  },

  addGoalContribution(token: string, id: number, body: AddGoalContributionRequestDto) {
    return request<GoalDto>(`/api/goals/${id}/contributions`, { method: "POST", body, token });
  },

  deleteGoal(token: string, id: number) {
    return request<GoalDto>(`/api/goals/${id}`, { method: "DELETE", token });
  },

  getDashboardSummary(
    token: string,
    params: { month: number; year: number; refreshMarketPrices?: boolean },
  ) {
    const { month, year, refreshMarketPrices = false } = params;
    const query = `?month=${month}&year=${year}&refreshMarketPrices=${refreshMarketPrices}`;
    return request<DashboardSummaryDto>(`/api/dashboard${query}`, { token });
  },
};
