using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using SmartInvestingAPI.Model.DTOs;

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
            return await GetCurrentPriceAsync(symbol, CancellationToken.None);
        }

        public async Task<List<FireAntSymbolResponse>> GetSymbolsAsync(int limit, int offset = 0, CancellationToken cancellationToken = default)
        {
            limit = Math.Clamp(limit, 1, 100);
            offset = Math.Max(offset, 0);
            return await FetchSymbolsAsync(null, limit, offset, includePrices: true, cancellationToken);
        }

        public async Task<List<FireAntSymbolResponse>> SearchSymbolsAsync(string keyword, int limit, int offset = 0, CancellationToken cancellationToken = default)
        {
            keyword = keyword.Trim();
            if (keyword.Length < 2)
                return new List<FireAntSymbolResponse>();

            limit = Math.Clamp(limit, 1, 100);
            offset = Math.Max(offset, 0);
            return await FetchSymbolsAsync(keyword, limit, offset, includePrices: false, cancellationToken);
        }

        private async Task<List<FireAntSymbolResponse>> FetchSymbolsAsync(string? keyword, int limit, int offset, bool includePrices, CancellationToken cancellationToken)
        {
            var token = await fireAntAuthService.GetTokenAsync();
            var sourceLimit = includePrices ? Math.Clamp((offset + limit) * 3, limit, 100) : limit;
            var url = string.IsNullOrWhiteSpace(keyword)
                ? $"symbols/search?keywords=&type=stock&offset=0&limit={sourceLimit}"
                : $"symbols/search?keywords={Uri.EscapeDataString(keyword)}&type=stock&offset={offset}&limit={limit}";

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await httpClient.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"FireAnt search request failed ({(int)response.StatusCode}): {body}");

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (root.ValueKind != JsonValueKind.Array)
                throw new InvalidOperationException($"FireAnt search response is not an array. Body: {body}");

            var results = new List<FireAntSymbolResponse>();
            foreach (var item in root.EnumerateArray())
            {
                if (item.ValueKind != JsonValueKind.Object)
                    continue;

                var symbol = GetFirstStringProperty(item, "symbol", "Symbol", "key");
                if (string.IsNullOrWhiteSpace(symbol) || !IsStock(item))
                    continue;

                decimal? latestPrice = null;
                if (includePrices)
                {
                    try
                    {
                        latestPrice = await GetCurrentPriceAsync(symbol, cancellationToken);
                    }
                    catch
                    {
                        latestPrice = null;
                    }
                }

                var tradingValue = GetNullableDecimalProperty(item, "tradingValue", "TradingValue", "value", "Value", "matchedValue", "MatchedValue", "totalValue", "TotalValue", "marketValue", "MarketValue");
                var volume = GetNullableDecimalProperty(item, "volume", "Volume", "matchedVolume", "MatchedVolume", "totalVolume", "TotalVolume");
                var hotScore = GetHotScore(item, latestPrice);

                results.Add(new FireAntSymbolResponse
                {
                    Symbol = symbol,
                    Name = GetFirstStringProperty(item, "name", "Name") ?? symbol,
                    Description = GetFirstStringProperty(item, "description", "Description", "exchange", "Exchange"),
                    LatestPrice = latestPrice,
                    HotScore = hotScore,
                    TradingValue = tradingValue,
                    Volume = volume,
                    ImageUrl = GetFirstStringProperty(item, "logo", "logoUrl", "image", "imageUrl", "icon", "avatar", "companyLogo", "thumbnail"),
                });
            }

            if (includePrices)
            {
                return results
                    .GroupBy(item => item.Symbol, StringComparer.OrdinalIgnoreCase)
                    .Select(group => group.First())
                    .OrderBy(item => item.LatestPrice.HasValue ? 0 : 1)
                    .ThenByDescending(item => item.LatestPrice)
                    .ThenBy(item => item.Symbol)
                    .Skip(offset)
                    .Take(limit)
                    .ToList();
            }

            return results
                .GroupBy(item => item.Symbol, StringComparer.OrdinalIgnoreCase)
                .Select(group => group.First())
                .OrderBy(item => item.HotScore.HasValue ? 0 : 1)
                .ThenByDescending(item => item.HotScore)
                .ThenBy(item => item.Symbol)
                .ToList();
        }

        private async Task<decimal> GetCurrentPriceAsync(string symbol, CancellationToken cancellationToken)
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

            var response = await httpClient.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
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

        private static string? GetStringProperty(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String
                ? property.GetString()
                : null;
        }

        private static string? GetFirstStringProperty(JsonElement element, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                var value = GetStringProperty(element, propertyName);
                if (!string.IsNullOrWhiteSpace(value))
                    return value;
            }

            return null;
        }

        private static decimal? GetNullableDecimalProperty(JsonElement element, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                if (!element.TryGetProperty(propertyName, out var property))
                    continue;

                if (property.ValueKind == JsonValueKind.Number && property.TryGetDecimal(out var number))
                    return number;

                if (property.ValueKind == JsonValueKind.String && decimal.TryParse(property.GetString(), out var parsed))
                    return parsed;
            }

            return null;
        }

        private static decimal? GetHotScore(JsonElement element, decimal? latestPrice)
        {
            return GetNullableDecimalProperty(element, "tradingValue", "TradingValue", "value", "Value", "matchedValue", "MatchedValue", "totalValue", "TotalValue", "marketValue", "MarketValue")
                ?? GetNullableDecimalProperty(element, "volume", "Volume", "matchedVolume", "MatchedVolume", "totalVolume", "TotalVolume")
                ?? GetNullableDecimalProperty(element, "score", "Score", "rank", "Rank", "searchCount", "SearchCount", "popularity", "Popularity")
                ?? latestPrice;
        }

        private static bool IsStock(JsonElement element)
        {
            var name = GetFirstStringProperty(element, "name", "Name") ?? string.Empty;
            var description = GetFirstStringProperty(element, "description", "Description") ?? string.Empty;
            var type = GetFirstStringProperty(element, "type", "Type") ?? string.Empty;
            var text = $"{name} {description}";

            if (type.Equals("stock", StringComparison.OrdinalIgnoreCase))
                return true;

            return text.Contains("CTCP", StringComparison.OrdinalIgnoreCase)
                && !text.Contains("chứng quyền", StringComparison.OrdinalIgnoreCase)
                && !text.Contains("covered warrant", StringComparison.OrdinalIgnoreCase)
                && !text.Contains("hợp đồng tương lai", StringComparison.OrdinalIgnoreCase)
                && !text.Contains("Chỉ số", StringComparison.OrdinalIgnoreCase)
                && !text.Contains("future", StringComparison.OrdinalIgnoreCase)
                && !text.Contains("futures", StringComparison.OrdinalIgnoreCase);
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

        private static decimal ToVndPrice(decimal fireAntPrice)
        {
            return fireAntPrice * 1000;
        }

        private static bool TryGetDecimalPrice(JsonElement element, out decimal price)
        {
            price = 0;

            if (element.TryGetProperty("priceClose", out var pClose) || element.TryGetProperty("PriceClose", out pClose))
            {
                price = ToVndPrice(pClose.GetDecimal());
                return true;
            }

            if (element.TryGetProperty("priceAverage", out var pAvg) || element.TryGetProperty("PriceAverage", out pAvg))
            {
                price = ToVndPrice(pAvg.GetDecimal());
                return true;
            }

            if (element.TryGetProperty("priceBasic", out var pBasic) || element.TryGetProperty("PriceBasic", out pBasic))
            {
                price = ToVndPrice(pBasic.GetDecimal());
                return true;
            }

            if (element.TryGetProperty("priceOpen", out var pOpen) || element.TryGetProperty("PriceOpen", out pOpen))
            {
                price = ToVndPrice(pOpen.GetDecimal());
                return true;
            }

            return false;
        }
    }
}
