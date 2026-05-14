namespace SmartInvestingAPI.Services;

public class ConsoleEmailService(ILogger<ConsoleEmailService> logger) : IEmailService
{
    public Task SendPasswordResetEmailAsync(string email, string resetUrl)
    {
        logger.LogInformation("Password reset link for {Email}: {ResetUrl}", email, resetUrl);
        return Task.CompletedTask;
    }
}
