# Project Structure Overview

```text
SmartInvestingAPI/
├─ SmartInvestingAPI/                # ASP.NET Core backend
│  ├─ Controllers/                   # HTTP endpoints
│  │  └─ AuthController.cs           # register/login/refresh/logout
│  ├─ Model/
│  │  └─ DTOs/                       # request payload contracts
│  │     ├─ LoginDto.cs
│  │     └─ RegisterDto.cs
│  ├─ Properties/
│  │  └─ launchSettings.json         # local ports/profiles
│  ├─ Program.cs                     # DI, auth, CORS, middleware
│  ├─ appsettings.json               # base config
│  └─ appsettings.Development.json   # dev config
│
└─ SmartInvesting/                   # Expo / React Native frontend
   ├─ App.tsx                        # app entry
   ├─ .env                           # EXPO_PUBLIC_API_BASE_URL
   └─ src/
      ├─ context/
      │  └─ AuthContext.tsx          # auth state + actions
      ├─ services/
      │  ├─ api/
      │  │  ├─ client.ts             # generic request wrapper
      │  │  ├─ config.ts             # env base URL
      │  │  └─ types.ts              # ApiResponse, ApiError
      │  └─ auth/
      │     ├─ authService.ts        # auth API methods
      │     ├─ tokenStorage.ts       # AsyncStorage tokens
      │     └─ types.ts              # LoginRequest/RegisterRequest/etc
      ├─ features/
      │  ├─ login/
      │  │  └─ screens/
      │  │     └─ LoginScreen.tsx
      │  └─ register/
      │     └─ screens/
      │        └─ RegisterScreen.tsx
      └─ shared/
         └─ navigation/
            └─ RootNavigator.tsx     # auth/app routing
```

## Feature Add Recipe

### 1. New backend endpoint
Add:
- DTO → `Model/DTOs/`
- action → `Controllers/...Controller.cs`

Pattern:
```csharp
[HttpPost("something")]
public async Task<IActionResult> Something([FromBody] SomethingDto request)
{
    if (!ModelState.IsValid)
        return BadRequest(ApiResponse.Fail(GetModelStateErrors()));

    // business logic

    return Ok(ApiResponse.Ok(data, "Success"));
}
```

### 2. New frontend service function
Add in `src/services/...`

Pattern:
```ts
something(payload: SomethingRequest) {
  return request<SomethingResponse>("/api/something", {
    method: "POST",
    body: payload,
  });
}
```

### 3. If app-wide state needed
Put in context:
- loading
- error
- selected entity
- refresh function

If local-to-screen only → keep inside screen.

### 4. Wire UI
Screen should:
- hold inputs
- validate locally
- call typed handler
- render loading/error from props/context

## Auth Sequence

### Register
```text
RegisterScreen
→ onRegister(payload)
→ RootNavigator.handleRegister
→ AuthContext.register
→ authService.register
→ request("/api/auth/register")
→ AuthController.Register
→ DB / Identity create user
→ success
→ back to login
```

### Login
```text
LoginScreen
→ onLogin(payload)
→ RootNavigator.handleLogin
→ AuthContext.login
→ authService.login
→ request("/api/auth/login")
→ AuthController.Login
→ JWT + refresh token
→ tokenStorage.saveTokens
→ status = authenticated
→ app area
```

### Relaunch
```text
App start
→ AuthProvider boot
→ tokenStorage.getTokens
→ authService.refresh(refreshToken)
→ save new tokens
→ authenticated
```

## Where to Put Code

- visual-only change → `features/*/screens/*`
- cross-screen auth/session → `context/AuthContext.tsx`
- any HTTP call → `services/*`
- base URL / generic fetch / error parsing → `services/api/*`
- route/screen switching → `shared/navigation/*`
- request contract / validation → backend DTOs
- endpoint behavior → backend Controllers

## Debug Checklist

### Frontend issue
Check:
1. `.env`
2. payload shape
3. request URL
4. phone reachability
5. `ApiError` message

### Backend issue
Check:
1. Swagger
2. DTO validation
3. controller branch
4. auth/token config
5. DB/user state

## Useful Rule

- UI wrong → screen
- state wrong → context
- network wrong → service/api
- route wrong → navigator/controller
- validation wrong → DTO + screen validators
