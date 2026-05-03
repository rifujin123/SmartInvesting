using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;

namespace SmartInvestingAPI.Services
{
    public class FireAntService : IFireAntService
    {
        private readonly HttpClient httpClient;
        private readonly FireAntAuthService fireAntAuthService;

        public FireAntService(HttpClient httpClient, FireAntAuthService fireAntAuthService)
        {
            this.httpClient = httpClient;
            this.httpClient.BaseAddress = new Uri("https://api.fireant.vn/");
            this.fireAntAuthService = fireAntAuthService;
        }

        public async Task<decimal> GetCurrentPriceAsync(string symbol)
        {
            var token = await fireAntAuthService.GetTokenAsync();

            var endDate = DateTime.UtcNow;
            var startDate = endDate.AddDays(-10);
            var url =
                $"symbols/{Uri.EscapeDataString(symbol)}/historical-quotes" +
                $"?startDate={Uri.EscapeDataString(startDate.ToString("O"))}" +
                $"&endDate={Uri.EscapeDataString(endDate.ToString("O"))}";

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await httpClient.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"FireAnt price request failed for symbol '{symbol}' ({(int)response.StatusCode}): {body}");

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (root.ValueKind != JsonValueKind.Array)
                throw new InvalidOperationException($"FireAnt historical quotes response is not an array for symbol '{symbol}'. Body: {body}");

            JsonElement? latest = null;
            var latestDate = DateTime.MinValue;

            foreach (var item in root.EnumerateArray())
            {
                if (item.ValueKind != JsonValueKind.Object)
                    continue;

                if (!TryGetDate(item, out var dt))
                    continue;

                if (dt > latestDate)
                {
                    latestDate = dt;
                    latest = item;
                }
            }

            if (latest is null)
                throw new InvalidOperationException($"FireAnt historical quotes response has no usable items for symbol '{symbol}'. Body: {body}");

            if (TryGetDecimalPrice(latest.Value, out var price))
                return price;

            throw new InvalidOperationException($"FireAnt historical quote missing expected price fields for symbol '{symbol}'. Body: {body}");
        }

        private static bool TryGetDate(JsonElement element, out DateTime date)
        {
            date = default;

            if (!element.TryGetProperty("date", out var d) && !element.TryGetProperty("Date", out d))
                return false;

            if (d.ValueKind == JsonValueKind.String && DateTime.TryParse(d.GetString(), out var parsed))
            {
                date = parsed.ToUniversalTime();
                return true;
            }

            return false;
        }

        private static bool TryGetDecimalPrice(JsonElement element, out decimal price)
        {
            price = 0;

            if (element.TryGetProperty("priceClose", out var pClose) || element.TryGetProperty("PriceClose", out pClose))
            {
                price = pClose.GetDecimal();
                return true;
            }

            if (element.TryGetProperty("priceAverage", out var pAvg) || element.TryGetProperty("PriceAverage", out pAvg))
            {
                price = pAvg.GetDecimal();
                return true;
            }

            if (element.TryGetProperty("priceBasic", out var pBasic) || element.TryGetProperty("PriceBasic", out pBasic))
            {
                price = pBasic.GetDecimal();
                return true;
            }

            if (element.TryGetProperty("priceOpen", out var pOpen) || element.TryGetProperty("PriceOpen", out pOpen))
            {
                price = pOpen.GetDecimal();
                return true;
            }

            return false;
        }
    }
}
