export interface AssetSearchResult {
  id: number;
  symbol: string;
  name: string;
  description?: string | null;
  latestPrice?: number | null;
  currentPrice?: number | null;
  imageUrl?: string | null;
  type?: "stock" | "etf" | "gold";
}