# SmartInvesting Mobile - Agent-Ready Development Plan

> Purpose: This document is written for autonomous coding agents. Follow tasks in order. Do not skip verification.
> Product: Mobile app for manual expense tracking + investment order management.
> Design style: Calm Utility, white-first, dense but readable, minimal color.
> Current stack: React Native / Expo frontend + ASP.NET Core backend.
> Target frontend root: `SmartInvesting/src`.

---

## 0. Global Rules For Agent

### 0.1 Product Rules

- Expense tracking is manual only. Do not design bank/card auto-sync.
- Normal spending does not require user to deposit real money into app.
- Investment buying/selling must use backend investment order API, not normal transaction API.
- User can manage wallets manually. Wallet balance is backend state.
- Stocks/ETF/gold are discovered through third-party-backed asset APIs.

### 0.2 UI Rules

- Background must be white: `#FFFFFF`.
- Avoid gradients.
- Avoid decorative heavy visuals.
- Prefer border over heavy shadow.
- Use blue only for primary action/selected state.
- Use green only for income/profit.
- Use red only for expense/loss/delete.
- Use amber only for warning/near-budget-limit.
- Money must be visually aligned right in rows.
- Screens must have loading, empty, error, and pull-refresh states when data-driven.
- All tappable controls must be at least 44px tall/wide.

### 0.3 Implementation Rules

- Reuse existing services before creating new ones.
- Do not keep mock portfolio/asset/transaction data if backend API exists.
- Keep changes scoped.
- Do not change backend unless a frontend blocker proves backend contract is missing.
- Prefer shared components for repeated card/button/progress/money patterns.
- Do not introduce a new UI library unless explicitly needed.
- Use Ionicons currently present in the app.

### 0.4 Backend Contracts To Use

Existing APIs:

- Auth:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`

- Profile:
  - `GET /api/profile/me`
  - `PUT /api/profile/me`
  - `PUT /api/profile/email`
  - `PUT /api/profile/password`
  - `POST /api/profile/me/avatar`

- Wallets:
  - `GET /api/wallets?page&pageSize`
  - `GET /api/wallets/{id}`
  - `POST /api/wallets`
  - `DELETE /api/wallets/{id}`

- Transactions:
  - `GET /api/wallets/{walletId}/transactions?page&pageSize`
  - `GET /api/wallets/{walletId}/transactions/{transactionId}`
  - `POST /api/wallets/{walletId}/transactions`
  - `PUT /api/wallets/{walletId}/transactions/{transactionId}`
  - `DELETE /api/wallets/{walletId}/transactions/{transactionId}`

- Budgets:
  - `GET /api/budgets`
  - `GET /api/budgets/{id}`
  - `GET /api/budgets/{id}/summary`
  - `POST /api/budgets`
  - `PUT /api/budgets/{id}`
  - `DELETE /api/budgets/{id}`

- Goals:
  - `GET /api/goals`
  - `GET /api/goals/{id}`
  - `POST /api/goals`
  - `PUT /api/goals/{id}`
  - `POST /api/goals/{id}/contributions`
  - `DELETE /api/goals/{id}`

- Categories:
  - `GET /api/categories`

- Assets:
  - `GET /api/assets/stocks?limit&offset`
  - `GET /api/assets/search?keyword&limit&offset`

- Investment Orders:
  - `POST /api/investment-orders`
  - `GET /api/investment-orders`
  - `GET /api/investment-orders/{id}`

- Holdings:
  - `GET /api/holdings/types/{typeId}?refreshMarketPrice=true|false`

- Dashboard:
  - `GET /api/dashboard?month&year&refreshMarketPrices`

---

## 1. Milestone A - Theme Foundation

### Task A1 - Replace Color Tokens

**Files:**
- `SmartInvesting/src/theme/colors.ts`

**Action:**
Replace existing color token system with Calm Utility tokens.

**Required export:**

```ts
export const colors = {
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceSoft: "#F1F5F9",
  card: "#FFFFFF",

  border: "#E2E8F0",
  borderSoft: "#F1F5F9",

  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textInverse: "#FFFFFF",

  primary: "#2563EB",
  primarySoft: "#EFF6FF",
  primaryPressed: "#1D4ED8",

  success: "#16A34A",
  successSoft: "#F0FDF4",

  danger: "#DC2626",
  dangerSoft: "#FEF2F2",

  warning: "#D97706",
  warningSoft: "#FFFBEB",

  neutralDark: "#111827",
  overlay: "rgba(15, 23, 42, 0.45)",
};
```

**Compatibility requirement:**
If existing code references old aliases like `colors.loss`, `colors.heroText`, `colors.primaryLight`, `colors.surfaceCard`, or `colors.figma`, keep aliases temporarily to avoid app-wide breakage.

**Verification:**
- TypeScript compile should not fail due to missing color keys.
- `rg "colors\." SmartInvesting/src` to confirm no unresolved aliases.

---

### Task A2 - Replace Typography Tokens

**Files:**
- `SmartInvesting/src/theme/typography.ts`

**Action:**
Create compact readable typography tokens.

**Required tokens:**
- `screenTitle`: 24/32/700
- `sectionTitle`: 16/24/700
- `cardTitle`: 15/22/600
- `body`: 14/21/400
- `bodyMedium`: 14/21/500
- `bodyStrong`: 14/21/600
- `label`: 12/18/500
- `caption`: 12/18/400
- `moneyLarge`: 32/40/700
- `moneyMedium`: 18/26/700
- `moneySmall`: 14/21/600
- `button`: 14/21/600

**Compatibility requirement:**
Preserve old tokens used by current code as aliases when needed, e.g. `title`, `sectionHeader`.

**Verification:**
- No TS errors from missing typography keys.

---

### Task A3 - Add Radius And Shadow Tokens

**Files:**
- Add `SmartInvesting/src/theme/radius.ts`
- Add `SmartInvesting/src/theme/shadows.ts`
- Update `SmartInvesting/src/theme/index.ts`

**Action:**
Add reusable radius/shadow tokens.

**Required radius:**
```ts
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, full: 999 };
```

**Required shadows:**
- `none`
- `sm`: subtle elevation only
- `md`: modal/hero use only

**Verification:**
- Imports from `theme` barrel work.

---

## 2. Milestone B - Shared UI Components

### Task B1 - Create Card Component

**Files:**
- Add `SmartInvesting/src/shared/components/Card.tsx`
- Update `SmartInvesting/src/shared/components/index.ts`

**Action:**
Create reusable `Card` with variants:
- `default`: white card + border
- `soft`: surface background, no shadow
- `danger`: red soft background + red border
- `warning`: amber soft background + amber border

**Props:**
```ts
type CardVariant = "default" | "soft" | "danger" | "warning";
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
}
```

**Behavior:**
- If `onPress` exists use `TouchableOpacity`; otherwise use `View`.
- Border radius = `radius.lg`.
- Padding default = `spacing.md`.

**Verification:**
- Can render Card in any screen without layout shift.

---

### Task B2 - Create AppButton Component

**Files:**
- Add `SmartInvesting/src/shared/components/AppButton.tsx`
- Update shared index.

**Props:**
```ts
type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";
interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}
```

**Behavior:**
- Primary = blue bg white text.
- Secondary = white/surface bg + border.
- Danger = red bg white text.
- Loading shows spinner.
- Disabled opacity 0.5.
- Minimum height: sm 36, md 44, lg 52.

**Verification:**
- Touch target >=44 except `sm`, which is allowed only for compact list actions.

---

### Task B3 - Create MoneyText Replacement

**Files:**
- Add `SmartInvesting/src/shared/components/MoneyDisplay.tsx`

**Props:**
```ts
interface MoneyDisplayProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "success" | "danger" | "inverse";
  showSign?: boolean;
  currency?: "VND" | "USD";
  align?: "left" | "right";
  style?: StyleProp<TextStyle>;
}
```

**Behavior:**
- Format using `Intl.NumberFormat("vi-VN")` for VND.
- Negative sign should be `−`, not hyphen.
- If `showSign` and amount > 0 prefix `+`.
- Default align right.

**Verification:**
- `1000000` -> `1.000.000 ₫` or equivalent vi-VN currency output.
- `-1000000` -> `−1.000.000 ₫`.

---

### Task B4 - Create ProgressBar Component

**Files:**
- Add `SmartInvesting/src/shared/components/ProgressBar.tsx`

**Props:**
```ts
interface ProgressBarProps {
  value: number;
  height?: number;
  tone?: "success" | "warning" | "danger" | "primary";
}
```

**Behavior:**
- Clamp width from 0 to 100.
- Default height 8.
- Track color = `colors.surfaceSoft`.

**Verification:**
- Passing `150` does not overflow beyond parent width.

---

### Task B5 - Create State Components

**Files:**
- Add `SmartInvesting/src/shared/components/EmptyState.tsx`
- Add `SmartInvesting/src/shared/components/ErrorBanner.tsx`

**EmptyState props:**
```ts
interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**ErrorBanner props:**
```ts
interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}
```

**Verification:**
- Screens can use consistent no-data and error state.

---

## 3. Milestone C - Service Layer Completion

### Task C1 - Add Investment Order Service

**Files:**
- Add `SmartInvesting/src/services/investmentOrders/types.ts`
- Add `SmartInvesting/src/services/investmentOrders/investmentOrdersService.ts`

**Required types:**
```ts
export type OrderType = 0 | 1; // 0 = Buy, 1 = Sell. Confirm enum mapping from backend if needed.

export interface AddInvestmentOrderRequestDto {
  walletId: string;
  assetId: number;
  orderType: OrderType;
  quantity: number;
  price: number;
  fee?: number;
  orderDate?: string;
}

export interface InvestmentOrderDto {
  id: string;
  walletId: string;
  assetId: number;
  assetTicker?: string;
  assetName?: string;
  orderType: OrderType;
  quantity: number;
  price: number;
  fee: number;
  totalAmount: number;
  orderDate: string;
}
```

**Required service methods:**
- `create(token, body)` -> `POST /api/investment-orders`
- `getAll(token)` -> `GET /api/investment-orders`
- `getById(token, id)` -> `GET /api/investment-orders/{id}`

**Verification:**
- BuyAssetsScreen must call this service, not `transactionsService.createTransaction`.

---

### Task C2 - Add Holdings Service

**Files:**
- Add `SmartInvesting/src/services/holdings/types.ts`
- Add `SmartInvesting/src/services/holdings/holdingsService.ts`

**Required service methods:**
- `getByType(token, typeId, refreshMarketPrice = false)` -> `/api/holdings/types/{typeId}?refreshMarketPrice=...`

**Type guidance:**
Use fields from backend `PortfolioDto`. If exact DTO differs, inspect `SmartInvestingAPI/Model/DTOs/PortfolioDto.cs` and mirror it.

**Verification:**
- PortfolioScreen loads holdings from `holdingsService`, not mock data.

---

## 4. Milestone D - Dashboard Screen

### Task D1 - Rebuild DashboardScreen Around `/api/dashboard`

**Files:**
- `SmartInvesting/src/features/dashboard/screens/DashboardScreen.tsx`

**Data source:**
- Primary: `dashboardService.getSummary(token, month, year, false)`
- Secondary: `walletsService.getMyWallets(token)` if wallet list display needs pagination details.

**Layout order:**
1. `AppHeader`
2. Dark hero card
3. Monthly spending card
4. Budget alerts section
5. Quick actions grid
6. Wallet list preview

**Hero content:**
- Label: `Total Wealth`
- Main amount: `summary.totalWealth`
- Sub row: `Cash summary.totalCashBalance` and `Portfolio summary.portfolioNav`
- P/L chip: `summary.portfolioProfitLoss` and percent

**Monthly spending card:**
- Amount: `summary.totalExpenseThisMonth`
- Tone: danger
- On press: navigate to Transactions tab.

**Budget alerts:**
- Sort `summary.budgets` by highest usage percent.
- Show max 3 rows.
- Usage percent = `totalSpent / amountLimit * 100`.
- Tone: danger when >= 100, warning when >= 80, default otherwise.

**Quick actions:**
- `Add Tx`: navigate to Transactions and open add sheet if possible; otherwise navigate to Transactions.
- `Buy Asset`: navigate to `BuyAssets`.
- `Budgets`: navigate to Finance tab.
- `Profile`: navigate to Profile.

**States:**
- Loading: 4 skeleton cards.
- Empty: no wallets -> CTA create wallet.
- Error: ErrorBanner with retry.
- Pull refresh reloads summary.

**Acceptance criteria:**
- Dashboard no longer computes monthly spend by fetching every wallet's transactions.
- Dashboard uses backend summary.
- No mock assets.
- UI background white.

---

## 5. Milestone E - Finance Screen

### Task E1 - Rework Finance Tabs

**Files:**
- `SmartInvesting/src/features/finance/screens/FinanceScreen.tsx`

**Tabs:**
- `Overview`
- `Budgets`
- `Goals`

**Remove/avoid:**
- Do not keep Transactions as an embedded Finance tab; Transactions already has own bottom tab.

**Overview content:**
1. Month selector row.
2. Dark hero: `Remaining this month`.
3. Two compact KPI cards: `Spent`, `Budget`.
4. Recent transactions preview, max 5.
5. Goals preview, max 3.

**Budget summary computation:**
- Load budgets with `financeService.getBudgets(token)`.
- Filter current month/year.
- For each budget load summary.
- `totalBudget = sum(amountLimit)`.
- `totalSpent = sum(totalSpent)`.
- `remaining = totalBudget - totalSpent`.

**Budgets tab:**
- Header with `+ New Cap`.
- List all current-month budgets.
- Each row: icon, category, spent/limit, remaining, ProgressBar.
- Tap row -> `BudgetDetail` route with id.
- Empty -> EmptyState with create CTA.

**Goals tab:**
- Header with `+ New Goal`.
- Segmented filter: Active / Completed.
- Row: icon/color, name, current/target, progress percent.
- Tap row -> `GoalDetail` route with id.
- Empty -> EmptyState with create CTA.

**Create Budget modal:**
- Fields: category, month, year, amountLimit.
- Category list from `/api/categories`, only expense categories if category type is available.
- Validation: amountLimit > 0, category selected.
- On success: close modal, refresh budgets.

**Create Goal modal:**
- Fields: name, targetAmount, deadline optional, icon, color.
- Validation: name non-empty, targetAmount > 0.
- On success: close modal, refresh goals.

**States:**
- Loading skeleton.
- Error banner with retry.
- Pull refresh refreshes wallets, budgets, summaries, goals, recent transactions.
- Empty wallet -> CTA create wallet.

**Acceptance criteria:**
- Goal rows navigate to GoalDetail.
- Budget rows navigate to BudgetDetail.
- No TODO left in handlers.

---

## 6. Milestone F - Transactions Screen

### Task F1 - Full CRUD Transactions UI

**Files:**
- `SmartInvesting/src/features/transactions/screens/TransactionsScreen.tsx`

**Data:**
- Wallet list from `walletsService.getMyWallets`.
- Active wallet defaults to first wallet.
- Transactions from `transactionsService.getTransactionsByWallet(token, walletId, page, 20)`.

**Layout order:**
1. `AppHeader`
2. Cashflow summary card
3. Wallet selector if more than one wallet
4. Filter chips: All / Income / Expense
5. Grouped transaction list by date
6. Floating add button

**Pagination:**
- Maintain `page`, `hasNext`, `loadingMore`.
- Load more appends items, does not replace.
- Pull refresh resets page to 1.

**Transaction row:**
- Left: icon tinted success/danger.
- Middle: note first, category below.
- Right: amount + short date.
- Tap: open detail sheet.

**Add/Edit sheet:**
- Type segmented: Income / Expense.
- Amount input.
- Category picker.
- Wallet picker.
- Note input.
- Save calls create or update.
- For expense, submit negative amount.
- For income, submit positive amount.

**Detail sheet:**
- Show category, amount, date, wallet, note.
- Actions: Edit, Delete.
- Delete requires confirmation.

**States:**
- No wallet -> EmptyState create wallet CTA.
- No transactions -> EmptyState add transaction CTA.
- Error -> ErrorBanner.

**Acceptance criteria:**
- Create transaction refreshes list and Dashboard reflects after refocus.
- Edit transaction updates row.
- Delete removes row.

---

## 7. Milestone G - Portfolio Screen

### Task G1 - Replace Asset Discovery With Holdings View

**Files:**
- `SmartInvesting/src/features/portfolio/screens/PortfolioScreen.tsx`

**Data source:**
- Summary from `dashboardService.getSummary(token, undefined, undefined, false)`.
- Holdings from `holdingsService.getByType(token, typeId, refresh)`.

**Type ids:**
- Inspect backend `AssetType` enum before hardcoding.
- Required tabs: Stocks / ETF / Gold.
- Map each tab to backend type id.

**Layout order:**
1. `AppHeader`
2. Portfolio hero card
3. Type tabs
4. Holdings list
5. Bottom actions: Refresh prices, Buy assets

**Hero:**
- Portfolio NAV: `summary.portfolioNav`
- Investment: `summary.portfolioInvestment`
- P/L amount and percent.

**Holding row:**
- Ticker and asset name.
- Quantity.
- Average price.
- Current price.
- Market value.
- P/L %.

**Refresh prices:**
- Call holdings with `refreshMarketPrice=true`.
- Also refresh dashboard summary with `refreshMarketPrices=true`.

**Empty state:**
- No holdings -> CTA `Buy your first asset`.

**Acceptance criteria:**
- PortfolioScreen no longer lists FireAnt search assets.
- PortfolioScreen no longer opens buy modal directly except via BuyAssets route.
- No mock holdings.

---

## 8. Milestone H - BuyAssets Screen

### Task H1 - Use Investment Orders API

**Files:**
- `SmartInvesting/src/features/investing/screens/BuyAssetsScreen.tsx`

**Data source:**
- Search/list assets from existing `assetService`.
- Wallets from `walletsService`.
- Orders created via new `investmentOrdersService.create`.

**Layout order:**
1. Header with back button/title.
2. Search input.
3. Asset type tabs.
4. Asset list.
5. Buy order sheet.

**Asset list behavior:**
- If search query length >= 2 use search endpoint.
- Else use stocks endpoint for default listing.
- Pagination via offset/limit.

**Buy order sheet fields:**
- Selected asset summary.
- Wallet picker.
- Quantity.
- Price.
- Fee optional, default 0.
- Computed total = quantity * price + fee.
- Confirm button disabled if no wallet, invalid quantity, invalid price, or wallet balance < total.

**Submit body:**
```ts
{
  walletId,
  assetId,
  orderType: 0,
  quantity,
  price,
  fee,
  orderDate: new Date().toISOString()
}
```

**On success:**
- Close sheet.
- Show success state.
- Navigate back to Portfolio or stay and reset form.
- Refresh wallet balances when returning.

**Acceptance criteria:**
- No `transactionsService.createTransaction` in BuyAssetsScreen.
- Insufficient wallet balance blocked before submit.

---

## 9. Milestone I - Detail Screens

### Task I1 - BudgetDetailScreen

**Files:**
- `SmartInvesting/src/features/finance/screens/BudgetDetailScreen.tsx`

**Data:**
- `financeService.getBudgetSummary(token, id)`.

**Layout:**
1. Back header.
2. Category summary card.
3. Limit/spent/remaining table.
4. ProgressBar.
5. Edit limit action.
6. Delete budget action.

**Edit:**
- Inline modal with amountLimit.
- Calls `PUT /api/budgets/{id}` preserving category/month/year.

**Delete:**
- Confirmation required.
- On success navigate back.

**Acceptance criteria:**
- Pull refresh reloads summary.
- Over-budget shows danger tone.

---

### Task I2 - GoalDetailScreen

**Files:**
- `SmartInvesting/src/features/finance/screens/GoalDetailScreen.tsx`

**Data:**
- `financeService.getGoal(token, id)`.

**Layout:**
1. Back header.
2. Goal summary card.
3. Current/target/progress.
4. Contribution input.
5. Edit action.
6. Delete action.

**Contribution:**
- Validate amount > 0.
- Calls `POST /api/goals/{id}/contributions`.
- Refresh goal after success.

**Edit:**
- Modal fields: name, targetAmount, deadline, icon, color.
- Calls `PUT /api/goals/{id}`.

**Delete:**
- Confirmation required.
- On success navigate back.

**Acceptance criteria:**
- Progress clamps visually at 100%.
- Completed state visible when `isCompleted`.

---

## 10. Milestone J - Supporting Screens

### Task J1 - Create Wallet Flow

**Preferred implementation:**
- Add reusable `CreateWalletSheet` component first.
- Use from Finance empty wallet state, Dashboard empty wallet state, and Transactions empty wallet state.

**Fields:**
- Name.
- Initial balance.
- Currency: VND default.
- Wallet type: Real / Paper.

**Submit:**
- `walletsService.createWallet`.

**Acceptance criteria:**
- After wallet creation, calling screen refreshes and selects new wallet.

---

### Task J2 - Order History Screen

**Files:**
- Add `SmartInvesting/src/features/investing/screens/OrderHistoryScreen.tsx`
- Update navigation types and RootNavigator.

**Data:**
- `investmentOrdersService.getAll(token)`.

**Layout:**
- List orders newest first.
- Row: ticker, Buy/Sell, quantity, price, total, date.

**Acceptance criteria:**
- Accessible from Portfolio quick action.

---

### Task J3 - Sell Asset Flow

**Preferred implementation:**
- In Portfolio holding row, add action `Sell`.
- Open Sell sheet.

**Fields:**
- Quantity to sell.
- Price default to current price.
- Fee optional.
- Wallet picker.

**Submit body:**
Same as buy but `orderType: 1`.

**Validation:**
- Quantity > 0.
- Quantity <= holding quantity.
- Price > 0.

**Acceptance criteria:**
- Successful sell refreshes holdings and dashboard summary.

---

## 11. Milestone K - Auth/Profile Polish

### Task K1 - Reset Password Screen

**Files:**
- Add `SmartInvesting/src/features/reset-password/screens/ResetPasswordScreen.tsx`
- Update navigation types.

**Fields:**
- Email or token if app receives link params.
- New password.
- Confirm password.

**Submit:**
- `authService.resetPassword`.

**Acceptance criteria:**
- User can reach it from ForgotPassword success if deep link is not available.

---

### Task K2 - Profile Screens Consistency

**Files:**
- Existing profile/settings/security screens.

**Action:**
- Apply shared Card/Button/Input style.
- Ensure avatar upload uses existing `profileService.uploadAvatar`.
- Ensure password change uses `profileService.changePassword`.

**Acceptance criteria:**
- Profile screens visually match finance screens.

---

## 12. Final QA Checklist

Before marking complete, run all relevant checks.

### Build/type checks

- `npm run lint` if script exists.
- `npm test` if script exists.
- `npx tsc --noEmit` if project supports it.
- `npm start` or Expo dev server check if feasible.

### Manual app scenarios

1. Login.
2. Create wallet.
3. Add income transaction.
4. Add expense transaction.
5. Create budget.
6. Verify budget progress updates.
7. Create goal.
8. Add goal contribution.
9. Search asset.
10. Buy asset via investment order.
11. Verify portfolio holding appears.
12. Sell partial holding.
13. Verify dashboard wealth updates.
14. Logout/login again.

### Visual QA

- No dark full-screen backgrounds.
- No gradient backgrounds.
- Money aligned consistently.
- No clipped text on small phone viewport.
- All empty/error/loading states are present.
- Buttons are not dead.

---

## 13. Known Decisions

- Design system: Calm Utility.
- Layout density: operational dense.
- Investment buy/sell: use `/api/investment-orders`.
- Expense tracking: manual transactions only.
- Dashboard: backend summary is source of truth.
- Portfolio: holdings endpoint is source of truth.
- Asset discovery: BuyAssets screen only.
- Do not show fake/mock holdings.

---

## 14. Suggested Execution Order For Agents

1. Milestone A.
2. Milestone B.
3. Milestone C.
4. Milestone D.
5. Milestone E.
6. Milestone F.
7. Milestone G.
8. Milestone H.
9. Milestone I.
10. Milestone J.
11. Milestone K.
12. Final QA.

If task becomes too large, split into separate PRs by milestone.
