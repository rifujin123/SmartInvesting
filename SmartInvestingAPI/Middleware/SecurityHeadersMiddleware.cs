namespace SmartInvestingAPI.Middleware;

public static class SecurityHeadersMiddleware
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
        {
            // Prevent clickjacking
            context.Response.Headers.Append("X-Frame-Options", "DENY");

            // Prevent MIME type sniffing
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

            // XSS protection
            context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");

            // Referrer policy
            context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

            // Content Security Policy
            context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'");

            // Permissions Policy
            context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

            await next();
        });
    }

    private static string GetCspPolicy(string host)
    {
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

        if (isDevelopment)
        {
            return "default-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                   "connect-src 'self' ws://localhost:* http://localhost:* https://localhost:*; " +
                   "img-src 'self' data: https:; " +
                   "font-src 'self' data:;";
        }

        return "default-src 'self'; " +
               "frame-ancestors 'none'; " +
               "form-action 'self';";
    }
}
