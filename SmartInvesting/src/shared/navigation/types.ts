import { AssetType } from "../../features/investing/data/investableAssets";

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: { successMessage?: string } | undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AppTabParamList = {
  Dashboard: undefined;
  Finance: undefined;
  Portfolio: undefined;
  Transactions: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  BuyAssets: { initialAssetType?: AssetType };
  GoalDetail: { goalId: number };
  BudgetDetail: { budgetId: number };
  Profile: undefined;
  PersonalInformation: undefined;
  Security: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  AuthStack: undefined;
  AppStack: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
