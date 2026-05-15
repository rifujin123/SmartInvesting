# SmartInvesting — Personal Finance Platform

Full-stack mobile app combining manual expense tracking with simulated investment trading. Built with ASP.NET Core 8 backend, React Native frontend, and designed for financial discipline and investment education.

**Status:** Active development — core backend complete, frontend-backend integration in progress.

## Quick Start

### Backend
```bash
cd SmartInvestingAPI
dotnet user-secrets set "JwtSettings:SecretKey" "your-secret-key"
dotnet run
```
Swagger API docs available at `http://localhost:5000/swagger`

### Frontend
```bash
cd SmartInvesting
npx expo start
```

## Key Features

**Finance Module**
- Manual expense tracking with wallet management
- Transaction history with category-based analytics
- Budget creation and monitoring
- Financial dashboard (income, expenses, net balance)

**Investment Module**
- Simulated stock, ETF, and gold trading (educational environment)
- Portfolio management with holdings and P&L tracking
- Real-time balance updates

**Technical Features**
- JWT authentication with refresh token rotation
- Role-based access control via ASP.NET Identity
- Secure mobile token storage (device-level encryption)
- Cross-platform UI with dark mode support

## Tech Stack

| Category | Tools |
|----------|-------|
| **Backend** | ASP.NET Core 8.0, Entity Framework Core 8.0, SQL Server |
| **Frontend** | React Native, Expo, TypeScript |
| **Authentication** | JWT Bearer, BCrypt, ASP.NET Identity |
| **Tools** | Swagger/OpenAPI, AutoMapper, Cloudinary |
| **Architecture** | Repository Pattern, SOLID principles, clean separation of concerns |
| **AI-Assisted Development** | Claude (Anthropic) — architectural design, code patterns, technical decisions |

## Project Structure

```text
SmartInvestingAPI/
├── SmartInvestingAPI/              # ASP.NET Core backend
│   ├── Controllers/                # REST API endpoints
│   ├── Model/DTOs/                 # Request/response contracts
│   ├── Services/                   # Business logic
│   ├── Program.cs                  # DI, middleware, auth config
│   └── appsettings.json            # Configuration
│
├── SmartInvesting/                 # React Native mobile app
│   ├── App.tsx                     # Entry point
│   └── src/
│       ├── features/               # Feature-based screens
│       ├── services/               # API service layer
│       ├── context/                # Auth state management
│       └── shared/                 # Reusable components
│
└── SmartInvestingAPI.Tests/        # Backend unit tests
```

## API Modules

Auth • Profile • Wallets • Transactions • Budgets • Goals • Categories • Assets • Investment Orders • Holdings • Dashboard

---

## CV Highlights

- Built full-stack finance management system using **ASP.NET Core 8**, **SQL Server**, and **React Native**.
- Implemented **JWT authentication** with refresh-token session renewal and secure mobile token storage.
- Designed **RESTful APIs** for wallets, transactions, budgets, goals, investment orders, and portfolio analytics.
- Developed **React Native** app with feature-based architecture, typed service layer, and reusable UI components.
- Integrated portfolio tracking with investment order flow, profit/loss calculations, and real-time updates.
- Leveraged **AI-assisted development** (Claude) for architectural decisions and code patterns while maintaining full manual ownership of business logic.
