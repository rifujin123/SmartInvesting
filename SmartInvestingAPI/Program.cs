using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi.Models;
using SmartInvestingAPI.Repositories;
using SmartInvestingAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (corsOrigins.Length > 0)
            policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod();
        else
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
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
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddDbContext<AppIdentityDbcontext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AuthConnection")));

//automapper
builder.Services.AddAutoMapper(cfg => { }, typeof(Program).Assembly);

//Repositories
builder.Services.AddScoped<ITokenRepository, TokenRepository>();
builder.Services.AddScoped<IWalletRepository, SQLWalletRepository>();
builder.Services.AddScoped<ITransactionRepository, SQLTransactionRepository>();
builder.Services.AddScoped<ICategoryRepository, SQLCategoryRepository>();
builder.Services.AddScoped<IBudgetRepository, SQLBudgetRepository>();
builder.Services.AddScoped<IAssetRepository, SQLAssetRepository>();
builder.Services.AddScoped<IPortfolioRepository, SQLPortfolioRepository>();
builder.Services.AddScoped<IInvestmentOrderRepository, SQLInvestmentOrderRepository>();
builder.Services.AddScoped<IIncomeEventRepository, SQLIncomeEventRepository>();
builder.Services.AddScoped<IInvestmentOrderService, InvestmentOrderService>();

// FireAnt market price
builder.Services.AddHttpClient<FireAntAuthService>()
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler();
        if (builder.Environment.IsDevelopment() && builder.Configuration.GetValue<bool>("FireAnt:SkipSslValidation"))
        {
            handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
        }
        return handler;
    });

builder.Services.AddHttpClient<FireAntService>()
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler();
        if (builder.Environment.IsDevelopment() && builder.Configuration.GetValue<bool>("FireAnt:SkipSslValidation"))
        {
            handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
        }
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
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

//Identity Configuration 
builder.Services.AddIdentityCore<IdentityUser<Guid>>()
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AppIdentityDbcontext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("UserOnly", policy => policy.RequireRole("User"));
    options.AddPolicy("PremiumUser", policy => policy.RequireRole("Premium"));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

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
