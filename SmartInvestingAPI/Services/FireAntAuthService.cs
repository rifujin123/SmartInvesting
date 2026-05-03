using System.Net.Http.Json;
using System.Text.Json;

namespace SmartInvestingAPI.Services
{
    public class FireAntAuthService
    {
        private readonly HttpClient httpClient;
        private readonly IConfiguration configuration;
        private string? cachedToken;

        public FireAntAuthService(HttpClient httpClient, IConfiguration configuration)
        {
            this.httpClient = httpClient;
            this.configuration = configuration;
        }

        public async Task<string> GetTokenAsync()
        {
            if (!string.IsNullOrEmpty(cachedToken))
                return cachedToken;

            var email = configuration["FireAnt:Username"];
            var password = configuration["FireAnt:Password"];
            var loginData = new { email, password, rememberMe = false };
            var response = await httpClient.PostAsJsonAsync("https://api.fireant.vn/authentication/login", loginData);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"FireAnt login failed ({(int)response.StatusCode}): {json}");

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            string? token = null;
            if (root.TryGetProperty("accessToken", out var at) && at.ValueKind == JsonValueKind.String)
                token = at.GetString();
            if (string.IsNullOrWhiteSpace(token) && root.TryGetProperty("access_token", out var at2) && at2.ValueKind == JsonValueKind.String)
                token = at2.GetString();

            if (string.IsNullOrWhiteSpace(token))
                throw new InvalidOperationException($"FireAnt login response missing access token. Body: {json}");

            cachedToken = token;
            return cachedToken;
        }
    }
}
