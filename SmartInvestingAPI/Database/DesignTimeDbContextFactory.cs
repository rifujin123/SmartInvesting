using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using DotNetEnv;

namespace SmartInvestingAPI.Database;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbcontext>
{
    public AppDbcontext CreateDbContext(string[] args)
    {
        var envPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".env.local");
        envPath = Path.GetFullPath(envPath);
        if (File.Exists(envPath))
        {
            Env.Load(envPath);
        }
        else
        {
            Console.WriteLine($"[DEBUG] .env.local not found at: {envPath}");
        }
        
        Console.WriteLine($"[DEBUG] SQL_CONNECTION_STRING = {Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING")}");

        var optionsBuilder = new DbContextOptionsBuilder<AppDbcontext>();

        var connectionString = Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING")
            ?? "Server=localhost;Database=SmartInvesting;Trusted_Connection=true;TrustServerCertificate=True";

        optionsBuilder.UseSqlServer(connectionString);
        return new AppDbcontext(optionsBuilder.Options);
    }
}
