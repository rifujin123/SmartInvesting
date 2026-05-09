using System.Collections.Concurrent;
using System.Net;

namespace SmartInvestingAPI.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate next;
    private readonly ILogger<RateLimitingMiddleware> logger;
    private static readonly ConcurrentDictionary<string, RateLimitInfo> _clientRequests = new();

    private readonly int _maxRequests;
    private readonly TimeSpan _window;

    public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger, int maxRequests = 5, int windowSeconds = 60)
    {
        this.next = next;
        this.logger = logger;
        _maxRequests = maxRequests;
        _window = TimeSpan.FromSeconds(windowSeconds);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower() ?? "";

        if (!IsAuthEndpoint(path))
        {
            await next(context);
            return;
        }

        var clientIp = GetClientIp(context);
        var key = $"{clientIp}:{path}";

        CleanupOldEntries();

        var info = _clientRequests.GetOrAdd(key, _ => new RateLimitInfo());

        lock (info)
        {
            var now = DateTime.UtcNow;

            info.Requests.RemoveAll(t => t < now - _window);
            if (info.Requests.Count >= _maxRequests)
            {
                var retryAfter = (int)(_window - (now - info.Requests.First())).TotalSeconds;
                context.Response.Headers.Append("Retry-After", retryAfter.ToString());
                context.Response.Headers.Append("X-RateLimit-Limit", _maxRequests.ToString());
                context.Response.Headers.Append("X-RateLimit-Remaining", "0");
                context.Response.Headers.Append("X-RateLimit-Reset", retryAfter.ToString());

                logger.LogWarning("Rate limit exceeded for {ClientIp} on {Path}", clientIp, path);
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                return;
            }

            info.Requests.Add(now);
        }

        context.Response.Headers.Append("X-RateLimit-Limit", _maxRequests.ToString());
        context.Response.Headers.Append("X-RateLimit-Remaining", 
            (_maxRequests - (_clientRequests.TryGetValue(key, out var currentInfo) ? currentInfo.Requests.Count : 0)).ToString());

        await next(context);
    }

    private static bool IsAuthEndpoint(string path)
    {
        return path.Contains("/api/auth/login", StringComparison.OrdinalIgnoreCase) ||
               path.Contains("/api/auth/register", StringComparison.OrdinalIgnoreCase);
    }

    private static string GetClientIp(HttpContext context)
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private static void CleanupOldEntries()
    {
        var now = DateTime.UtcNow;
        var keysToRemove = _clientRequests
            .Where(kvp => kvp.Value.Requests.All(t => t < now - TimeSpan.FromMinutes(5)))
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in keysToRemove)
        {
            _clientRequests.TryRemove(key, out _);
        }
    }

    private class RateLimitInfo
    {
        public List<DateTime> Requests { get; } = new();
    }
}

public static class RateLimitingMiddlewareExtensions
{
    public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder app, int maxRequests = 5, int windowSeconds = 60)
    {
        return app.UseMiddleware<RateLimitingMiddleware>(maxRequests, windowSeconds);
    }
}
