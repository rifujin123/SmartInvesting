export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Finance: undefined;
  Portfolio: undefined;
  Transactions: undefined;
};

export type TabParamList = {
  dashboard: undefined;
  finance: undefined;
  portfolio: undefined;
  transactions: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
