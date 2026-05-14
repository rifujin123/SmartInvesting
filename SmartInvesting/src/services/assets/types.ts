export interface AssetSearchResult {
  symbol: string;
  name: string;
  description?: string | null;
  latestPrice?: number | null;
  imageUrl?: string | null;
}