# Finance Management & Investing App — Feature Flowcharts

---

## 1. Onboarding & Authentication

```mermaid
flowchart TD
    A([Open app]) --> B{Returning user?}
    B -->|No| C[Sign up screen]
    B -->|Yes| D[Login screen]
    C --> E[Enter name / email / password]
    E --> F[Verify email]
    F --> G{Verified?}
    G -->|No| F
    G -->|Yes| H[Set up profile]
    H --> I[Link bank account / card]
    I --> J[Choose currency & language]
    J --> K[Set financial goals — optional]
    K --> L([Go to Dashboard])
    D --> M[Enter credentials]
    M --> N{Auth OK?}
    N -->|No| O[Show error]
    O --> M
    N -->|Yes| P{Biometrics enabled?}
    P -->|Yes| Q[Biometric prompt]
    Q --> L
    P -->|No| L
```

---

## 2. Dashboard & Overview

```mermaid
flowchart TD
    A([Open Dashboard]) --> B[Load user data]
    B --> C[Fetch account balances]
    B --> D[Fetch recent transactions]
    B --> E[Fetch portfolio snapshot]
    B --> F[Fetch goal progress]
    C & D & E & F --> G[Render overview cards]
    G --> H[Net worth · Budget · Portfolio · Goals]
    H --> I{User action?}
    I -->|Tap budget card| J[Go to Budget]
    I -->|Tap portfolio| K[Go to Investments]
    I -->|Tap transaction| L[View transaction detail]
    I -->|Tap goal| M[Go to Goals]
    I -->|Pull to refresh| B
```

---

## 3. Budget Management

```mermaid
flowchart TD
    A([Open Budget]) --> B[Show budget categories]
    B --> C{Action?}
    C -->|Create budget| D[Select category]
    D --> E[Set monthly limit]
    E --> F[Set alert threshold %]
    F --> G[Save budget]
    G --> B
    C -->|Edit budget| H[Modify limit or category]
    H --> G
    C -->|View spending| I[Show category breakdown]
    I --> J[Bar chart: spent vs limit]
    J --> K{Over budget?}
    K -->|Yes| L[Highlight in red · send alert]
    K -->|No| M[Show progress bar]
    C -->|Delete budget| N[Confirm deletion]
    N --> G
```

---

## 4. Expense Tracking

```mermaid
flowchart TD
    A([Add Expense]) --> B{Entry method?}
    B -->|Manual| C[Enter amount · category · date · note]
    B -->|Scan receipt| D[Camera / upload image]
    D --> E[OCR extracts data]
    E --> F[Review & confirm]
    F --> C
    B -->|Bank sync| G[Auto-import from linked account]
    G --> H[Auto-categorise with AI]
    H --> I{Category correct?}
    I -->|No| J[User corrects category]
    J --> K[Save transaction]
    I -->|Yes| K
    C --> K
    K --> L[Update budget totals]
    L --> M[Update dashboard]
    M --> N{Budget threshold hit?}
    N -->|Yes| O[Send push notification]
    N -->|No| P([Done])
    O --> P
```

---

## 5. Investment Portfolio

```mermaid
flowchart TD
    A([Open Portfolio]) --> B[Load holdings]
    B --> C[Fetch live market prices]
    C --> D[Calculate P&L per holding]
    D --> E[Render portfolio summary]
    E --> F{User action?}
    F -->|View holding| G[Show detail: price · chart · news]
    F -->|Buy asset| H[Search asset ticker / name]
    H --> I[Enter quantity & price]
    I --> J[Review order]
    J --> K{Confirm?}
    K -->|Yes| L[Execute / log trade]
    L --> M[Update holdings]
    M --> E
    K -->|No| F
    F -->|Sell asset| N[Select holding & quantity]
    N --> J
    F -->|Rebalance| O[Show target vs actual allocation]
    O --> P[Suggest trades to rebalance]
    P --> J
```

---

## 6. Goals & Savings

```mermaid
flowchart TD
    A([Open Goals]) --> B[List active goals]
    B --> C{Action?}
    C -->|Create goal| D[Name the goal]
    D --> E[Set target amount]
    E --> F[Set target date]
    F --> G[Link savings account — optional]
    G --> H[Set auto-contribution — optional]
    H --> I[Save goal]
    I --> B
    C -->|View goal| J[Show progress bar & timeline]
    J --> K[Projected completion date]
    K --> L{On track?}
    L -->|Yes| M[Show encouragement]
    L -->|No| N[Suggest increase in contribution]
    C -->|Add funds| O[Enter amount]
    O --> P[Update goal balance]
    P --> B
    C -->|Complete goal| Q[Mark as achieved]
    Q --> R[Celebration screen]
    R --> B
```

---

## 7. Reports & Analytics

```mermaid
flowchart TD
    A([Open Reports]) --> B{Report type?}
    B -->|Spending report| C[Select date range]
    C --> D[Aggregate transactions by category]
    D --> E[Render pie chart + bar chart]
    E --> F[Show top spending categories]
    B -->|Income vs expense| G[Select period]
    G --> H[Compare income streams to expenses]
    H --> I[Show net savings rate]
    B -->|Investment report| J[Select portfolio]
    J --> K[Show returns: daily · monthly · YTD]
    K --> L[Benchmark comparison]
    B -->|Net worth trend| M[Plot assets minus liabilities over time]
    E & I & L & M --> N{Export?}
    N -->|Yes| O[Generate PDF / CSV]
    O --> P[Share or download]
    N -->|No| Q([Done])
    P --> Q
```

---

## 8. Notifications & Alerts

```mermaid
flowchart TD
    A([Notifications Engine]) --> B{Trigger type?}
    B -->|Budget alert| C{Spending > threshold?}
    C -->|Yes| D[Push: budget warning]
    C -->|No| E([Idle])
    B -->|Bill reminder| F[Check upcoming bills]
    F --> G{Due in ≤ 3 days?}
    G -->|Yes| H[Push: bill due reminder]
    G -->|No| E
    B -->|Goal milestone| I{Progress ≥ 25/50/75/100%?}
    I -->|Yes| J[Push: milestone reached]
    I -->|No| E
    B -->|Market alert| K{Price change > set %?}
    K -->|Yes| L[Push: price movement alert]
    K -->|No| E
    B -->|Large transaction| M{Amount > set limit?}
    M -->|Yes| N[Push: unusual activity alert]
    M -->|No| E
    D & H & J & L & N --> O[User taps notification]
    O --> P[Deep-link to relevant screen]
```
