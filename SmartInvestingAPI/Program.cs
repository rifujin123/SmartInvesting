using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using SmartInvestingAPI.Database;
using Microsoft.IdentityModel.Tokens;
using System.Net.Security;
using System.Security.Authentication;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi.Models;
using CloudinaryDotNet;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Repositories;
using SmartInvestingAPI.Services;
using SmartInvestingAPI.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Load .env.local file for development (load before other config sources)
DotNetEnv.Env.Load(".env.local");
builder.Configuration.AddEnvironmentVariables();

// Load secrets: User Secrets (dev) → Environment Variables → Config file
// if (builder.Environment.IsDevelopment())
// {
//     builder.Configuration.AddUserSecrets<Program>();
// }
// Note: .env.local is loaded via DotNetEnv above, not via UserSecrets

var connectionString = GetRequiredEnvOrConfig(builder, "ConnectionStrings:DefaultConnection", "SQL_CONNECTION_STRING");
var authConnectionString = GetRequiredEnvOrConfig(builder, "ConnectionStrings:AuthConnection", "SQL_AUTH_CONNECTION_STRING");
var jwtKey = GetRequiredEnvOrConfig(builder, "Jwt:Key", "JWT_SECRET_KEY");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "SmartInvestingAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "SmartInvestingAPI";
var jwtDurationMinutes = builder.Configuration.GetValue<int>("Jwt:DurationInMinutes", 60);
var resetPasswordUrlBase = builder.Configuration["Frontend:ResetPasswordUrlBase"] ?? "smartinvesting://reset-password";
var cloudinaryCloudName = GetRequiredEnvOrConfig(builder, "Cloudinary:CloudName", "CLOUDINARY_CLOUD_NAME");
var cloudinaryApiKey = GetRequiredEnvOrConfig(builder, "Cloudinary:ApiKey", "CLOUDINARY_API_KEY");
var cloudinaryApiSecret = GetRequiredEnvOrConfig(builder, "Cloudinary:ApiSecret", "CLOUDINARY_API_SECRET");

var fireAntUsername = GetRequiredEnvOrConfig(builder, "FireAnt:Username", "FIREANT_USERNAME");
var fireAntPassword = GetRequiredEnvOrConfig(builder, "FireAnt:Password", "FIREANT_PASSWORD");
var fireAntSkipSsl = builder.Configuration.GetValue<bool>("FireAnt:SkipSslValidation", false);

var skipSslForDev = builder.Environment.IsDevelopment() && fireAntSkipSsl;

// Add services to the container.
builder.Services.AddControllers();

var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (corsOrigins.Length > 0)
            policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod();
        else if (builder.Environment.IsDevelopment())
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        else
            policy.SetIsOriginAllowed(_ => false);
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SmartInvesting API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

//DI dbcontext
builder.Services.AddDbContext<AppDbcontext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDbContext<AppIdentityDbcontext>(options =>
    options.UseSqlServer(authConnectionString));

//automapper
builder.Services.AddAutoMapper(cfg => { }, typeof(Program).Assembly);

//Repositories
builder.Services.AddScoped<ITokenRepository, TokenRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, SQLRefreshTokenRepository>();
builder.Services.AddScoped<IWalletRepository, SQLWalletRepository>();
builder.Services.AddScoped<ITransactionRepository, SQLTransactionRepository>();
builder.Services.AddScoped<ICategoryRepository, SQLCategoryRepository>();
builder.Services.AddScoped<IBudgetRepository, SQLBudgetRepository>();
builder.Services.AddScoped<IGoalRepository, SQLGoalRepository>();
builder.Services.AddScoped<IAssetRepository, SQLAssetRepository>();
builder.Services.AddScoped<IPortfolioRepository, SQLPortfolioRepository>();
builder.Services.AddScoped<IInvestmentOrderRepository, SQLInvestmentOrderRepository>();
builder.Services.AddScoped<IIncomeEventRepository, SQLIncomeEventRepository>();
builder.Services.AddScoped<IInvestmentOrderService, InvestmentOrderService>();
builder.Services.AddSingleton(_ =>
{
    var account = new Account(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret);
    return new Cloudinary(account) { Api = { Secure = true } };
});
builder.Services.AddScoped<IAvatarStorageService, CloudinaryAvatarStorageService>();

// FireAnt market price - SSL validation only skipped in dev with explicit flag
builder.Services.AddHttpClient<FireAntAuthService>()
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler
        {
            SslProtocols = SslProtocols.Tls12,
            ServerCertificateCustomValidationCallback = skipSslForDev
                ? HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                : null,
        };
        if (skipSslForDev)
        {
            Console.WriteLine("WARNING: SSL certificate validation is DISABLED for FireAnt API (Development only)");
        }
        return handler;
    });

builder.Services.AddHttpClient<FireAntService>()
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler
        {
            SslProtocols = SslProtocols.Tls12,
            ServerCertificateCustomValidationCallback = skipSslForDev
                ? HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                : null,
        };
        return handler;
    });
builder.Services.AddScoped<IFireAntService>(sp => sp.GetRequiredService<FireAntService>());

// Market price: FireAnt + fallback DB giá; hoặc chỉ dùng giá DB khi Simulation:UseLocalPrices = true
var useLocalPricesOnly = builder.Configuration.GetValue<bool>("Simulation:UseLocalPrices");
if (useLocalPricesOnly)
{
    builder.Services.AddScoped<IMarketPriceProvider, LocalSimulationPriceProvider>();
}
else
{
    builder.Services.AddScoped<IMarketPriceProvider, FireAntMarketPriceProvider>();
    builder.Services.AddScoped<IMarketPriceProvider, DbStoredPriceMarketPriceProvider>();
}

builder.Services.AddScoped<IMarketPriceService, MarketPriceService>();
builder.Services.AddScoped<IEmailService, ConsoleEmailService>();

//Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

//Identity Configuration
builder.Services.AddIdentityCore<User>()
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AppIdentityDbcontext>()
    .AddDefaultTokenProviders()
    .AddSignInManager<SignInManager<User>>();

builder.Services.AddScoped<SignInManager<User>>();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("UserOnly", policy => policy.RequireRole("User"));
    options.AddPolicy("PremiumUser", policy => policy.RequireRole("Premium"));
});

//Health Checks
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy())
    .AddDbContextCheck<AppDbcontext>("database")
    .AddDbContextCheck<AppIdentityDbcontext>("identity_database");

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseGlobalExceptionHandler();  // Must be first to catch all exceptions
app.UseRequestLogging();          // Log all requests
app.UseRateLimiting();            // Rate limiting for auth endpoints

app.UseHttpsRedirection();

app.UseSecurityHeaders();

app.UseCors();

if (app.Configuration.GetValue<bool>("SeedDemoAssets"))
{
    using var scope = app.Services.CreateScope();
    var appDb = scope.ServiceProvider.GetRequiredService<AppDbcontext>();
    await DemoDataSeeder.SeedDemoAssetsIfEmptyAsync(appDb);
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

/// <summary>
/// Helper function to load required secrets from environment variables or config
/// </summary>
static string GetRequiredEnvOrConfig(WebApplicationBuilder builder, string configPath, string envVarName)
{
    var value = Environment.GetEnvironmentVariable(envVarName)
        ?? builder.Configuration[configPath];

    if (string.IsNullOrWhiteSpace(value))
    {
        throw new InvalidOperationException(
            $"Required configuration '{configPath}' is missing. " +
            $"Set the '{envVarName}' environment variable or add the value to your secrets provider.");
    }

    return value;
}
