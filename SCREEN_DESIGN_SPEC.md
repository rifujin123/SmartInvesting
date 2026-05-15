# SmartInvesting — Detailed Screen Design & Implementation Plan

> Phiên bản: v1.0 | Ngày: 2026-05-15 | Scope: Full Product (Auth → Invest)
> Chiến lược: Calm Utility Design + Dense Layout + Investment-Orders API

---

## PHASE 1: Design Token Foundation (1-2 ngày)

### 1.1 Update 	heme/colors.ts

**File:** SmartInvesting/src/theme/colors.ts

Thay thế toàn bộ bằng:

\\\	ypescript
export const colors = {
  // Backgrounds
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceSoft: "#F1F5F9",
  card: "#FFFFFF",

  // Borders
  border: "#E2E8F0",
  borderSoft: "#F1F5F9",

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textInverse: "#FFFFFF",

  // Primary Action
  primary: "#2563EB",
  primarySoft: "#EFF6FF",
  primaryPressed: "#1D4ED8",

  // Semantic
  success: "#16A34A",
  successSoft: "#F0FDF4",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
  warning: "#D97706",
  warningSoft: "#FFFBEB",

  // Special
  neutralDark: "#111827",
  overlay: "rgba(15, 23, 42, 0.45)",
};

// Aliases for backward compatibility
export const figma = {
  appBg: colors.neutralDark,
  surface: colors.surface,
};
\\\

### 1.2 Update 	heme/typography.ts

**File:** SmartInvesting/src/theme/typography.ts

\\\	ypescript
export const typography = {
  screenTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700" as const,
  },

  cardTitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600" as const,
  },

  body: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400" as const,
  },

  bodyMedium: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500" as const,
  },

  bodyStrong: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600" as const,
  },

  label: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500" as const,
  },

  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "400" as const,
  },

  moneyLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },

  moneyMedium: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700" as const,
  },

  moneySmall: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600" as const,
  },

  button: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600" as const,
  },
};
\\\

### 1.3 Update 	heme/spacing.ts

\\\	ypescript
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};
\\\

### 1.4 Create 	heme/radius.ts

\\\	ypescript
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};
\\\

### 1.5 Create 	heme/shadows.ts

\\\	ypescript
export const shadows = {
  none: {},
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
};
\\\

### 1.6 Update 	heme/index.ts

\\\	ypescript
export { colors } from "./colors";
export { typography } from "./typography";
export { spacing } from "./spacing";
export { radius } from "./radius";
export { shadows } from "./shadows";
\\\

---

## PHASE 2: Shared Components & Utilities (2-3 ngày)

### 2.1 Create shared/components/Card.tsx

Wrapper component cho card chuẩn:

\\\	ypescript
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: "default" | "soft" | "bordered";
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = "default",
}) => {
  const variants = {
    default: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    soft: {
      backgroundColor: colors.surface,
      borderWidth: 0,
    },
    bordered: {
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.primary,
    },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        {
          borderRadius: radius.lg,
          padding: spacing.md,
          ...shadows.sm,
        },
        variants[variant],
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};
\\\

### 2.2 Create shared/components/Button.tsx

\\\	ypescript
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
}) => {
  const variants = {
    primary: {
      backgroundColor: colors.primary,
      textColor: colors.textInverse,
    },
    secondary: {
      backgroundColor: colors.surface,
      textColor: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    danger: {
      backgroundColor: colors.danger,
      textColor: colors.textInverse,
    },
  };

  const sizes = {
    sm: { height: 36, paddingHorizontal: spacing.md },
    md: { height: 44, paddingHorizontal: spacing.lg },
    lg: { height: 52, paddingHorizontal: spacing.xl },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        {
          borderRadius: radius.md,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
        },
        variants[variant],
        sizes[size],
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variants[variant].textColor} />
      ) : (
        <Text style={{ ...typography.button, color: variants[variant].textColor }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
\\\

### 2.3 Create shared/components/MoneyDisplay.tsx

Hiển thị tiền chuẩn (monospace, align right):

\\\	ypescript
interface MoneyDisplayProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  color?: "default" | "success" | "danger";
  showSign?: boolean;
  style?: TextStyle;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  amount,
  size = "md",
  color = "default",
  showSign = false,
  style,
}) => {
  const sizeMap = {
    sm: typography.moneySmall,
    md: typography.moneyMedium,
    lg: typography.moneyLarge,
  };

  const colorMap = {
    default: colors.textPrimary,
    success: colors.success,
    danger: colors.danger,
  };

  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  const sign = showSign && amount > 0 ? "+" : amount < 0 ? "−" : "";

  return (
    <Text
      style={[
        sizeMap[size],
        { color: colorMap[color], fontFamily: "monospace" },
        style,
      ]}
    >
      {sign}{formatted}
    </Text>
  );
};
\\\

### 2.4 Create shared/components/ProgressBar.tsx

\\\	ypescript
interface ProgressBarProps {
  value: number; // 0-100
  color?: "success" | "warning" | "danger";
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = "success",
  height = 8,
}) => {
  const colorMap = {
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  };

  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <View
      style={{
        height,
        backgroundColor: colors.surfaceSoft,
        borderRadius: radius.sm,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: \\%\,
          backgroundColor: colorMap[color],
          borderRadius: radius.sm,
        }}
      />
    </View>
  );
};
\\\

### 2.5 Create shared/components/EmptyState.tsx

\\\	ypescript
interface EmptyStateProps {
  icon: string; // Ionicons name
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  action,
}) => {
  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.xxl }}>
      <Ionicons name={icon as any} size={48} color={colors.textMuted} />
      <Text style={[typography.cardTitle, { color: colors.textPrimary, marginTop: spacing.md }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
          {subtitle}
        </Text>
      )}
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          style={{ marginTop: spacing.lg }}
        />
      )}
    </View>
  );
};
\\\

### 2.6 Update shared/components/index.ts

Export tất cả components mới.

---

## PHASE 3: Core Screens Implementation (5-7 ngày)

### 3.1 DashboardScreen (Ngày 1)

**File:** SmartInvesting/src/features/dashboard/screens/DashboardScreen.tsx

**Layout:**
- Hero Card (Dark): Net Worth + P/L
- Monthly Spend Card (Red border)
- Budget Alerts (Top 3 over-budget)
- Quick Actions (4 buttons)
- Wallets List (Compact)

**API Calls:**
- GET /api/dashboard?month=X&year=Y
- GET /api/wallets

**States:**
- Loading (skeleton)
- Error (retry banner)
- Empty (no wallet)
- Loaded

### 3.2 FinanceScreen (Ngày 2-3)

**File:** SmartInvesting/src/features/finance/screens/FinanceScreen.tsx

**3 Tabs:**
1. **Overview:** Hero progress + Recent Tx + Goals
2. **Budgets:** List + Create modal
3. **Goals:** List + Create modal

**API Calls:**
- GET /api/budgets
- GET /api/budgets/{id}/summary
- GET /api/goals
- GET /api/wallets/{id}/transactions?page=1&pageSize=5
- POST /api/budgets (create)
- POST /api/goals (create)

**Modals:**
- Create Budget (Category picker, Amount limit)
- Create Goal (Name, Target, Deadline, Icon, Color)

### 3.3 TransactionsScreen (Ngày 3-4)

**File:** SmartInvesting/src/features/transactions/screens/TransactionsScreen.tsx

**Layout:**
- Header: Net cashflow
- Filter chips: All / Income / Expense
- List: Grouped by date
- Pagination: Load more on scroll

**API Calls:**
- GET /api/wallets/{id}/transactions?page&pageSize
- POST /api/wallets/{id}/transactions (create)
- PUT /api/wallets/{id}/transactions/{txId} (edit)
- DELETE /api/wallets/{id}/transactions/{txId} (delete)

**Bottom Sheets:**
- Add/Edit Transaction Form
- Transaction Detail

### 3.4 PortfolioScreen (Ngày 4-5)

**File:** SmartInvesting/src/features/portfolio/screens/PortfolioScreen.tsx

**Layout:**
- Hero: NAV + Investment + P/L
- Holdings List: Ticker, Qty, Avg Price, Current Price, %
- Refresh button

**API Calls:**
- GET /api/holdings/types/{typeId}?refreshMarketPrice=true
- GET /api/dashboard (for NAV)

### 3.5 BuyAssetsScreen (Ngày 5-6)

**File:** SmartInvesting/src/features/investing/screens/BuyAssetsScreen.tsx

**Layout:**
- Search bar
- Filter tabs: All / Stocks / ETF / Gold
- Asset list (paginated)
- Buy modal

**API Calls:**
- GET /api/assets/search?keyword
- GET /api/assets/stocks?limit&offset
- POST /api/investment-orders (place order)

**Modal:**
- Asset detail + Order form (Qty, Price, Wallet)

### 3.6 BudgetDetailScreen & GoalDetailScreen (Ngày 6-7)

**BudgetDetailScreen:**
- Budget info + Progress
- Recent spending in category
- Edit / Delete buttons

**GoalDetailScreen:**
- Goal info + Progress bar
- Contribution form
- Contribution history
- Edit / Delete buttons

---

## PHASE 4: Supporting Screens (3-4 ngày)

### 4.1 CreateWalletScreen

Form tạo ví mới (Name, Balance, Currency, Type).

### 4.2 TransactionDetailSheet

Xem chi tiết transaction + Edit/Delete actions.

### 4.3 SellAssetScreen

Form bán tài sản từ portfolio.

### 4.4 OrderHistoryScreen

Lịch sử investment orders.

### 4.5 Profile & Settings

- Personal Info (Edit profile, Avatar)
- Security (Change password, Biometrics)
- Settings (Language, Notifications)

---

## PHASE 5: Integration & Polish (2-3 ngày)

### 5.1 Navigation Links

- Finance Goal row → GoalDetail
- Finance Budget row → BudgetDetail
- Dashboard Buy Asset → BuyAssets
- Dashboard Add Tx → Add Transaction sheet
- Portfolio Holdings → (Detail view)

### 5.2 Error Handling

- Network errors → Retry banner
- Validation errors → Inline messages
- 401 Unauthorized → Redirect to Login

### 5.3 Loading States

- Skeleton cards (not spinners)
- Pull-to-refresh on all list screens
- Pagination with "Load more"

### 5.4 Empty States

- No wallet → Create wallet CTA
- No budgets → Create budget CTA
- No goals → Create goal CTA
- No transactions → Empty message

---

## PHASE 6: Testing & QA (2-3 ngày)

### 6.1 Unit Tests

- MoneyDisplay formatting
- ProgressBar color logic
- Date grouping in Transactions

### 6.2 Integration Tests

- Dashboard data load flow
- Create budget → See in list
- Create transaction → Update dashboard
- Buy asset → Update portfolio

### 6.3 E2E Tests (Optional)

- Full user flow: Login → Create wallet → Add transaction → View dashboard

---

## Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| 1. Design Token | 1-2 days | Pending |
| 2. Shared Components | 2-3 days | Pending |
| 3. Core Screens | 5-7 days | Pending |
| 4. Supporting Screens | 3-4 days | Pending |
| 5. Integration & Polish | 2-3 days | Pending |
| 6. Testing & QA | 2-3 days | Pending |
| **Total** | **~18-22 days** | |

---

## Checklist

- [ ] Phase 1: Design Token
- [ ] Phase 2: Shared Components
- [ ] Phase 3: Core Screens
- [ ] Phase 4: Supporting Screens
- [ ] Phase 5: Integration
- [ ] Phase 6: Testing
- [ ] Deploy to staging
- [ ] User testing
- [ ] Production release

