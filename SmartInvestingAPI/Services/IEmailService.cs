namespace SmartInvestingAPI.Services;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string email, string resetUrl);
}
