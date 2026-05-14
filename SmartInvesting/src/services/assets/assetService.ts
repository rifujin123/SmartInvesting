import { request } from "../api/client";
import { AssetSearchResult } from "./types";

export function searchAssets(keyword: string, limit = 20, offset = 0) {
  const params = new URLSearchParams({
    keyword,
    limit: String(limit),
    offset: String(offset),
  });

  return request<AssetSearchResult[]>(`/api/assets/search?${params.toString()}`);
}

export function getStocks(limit = 20, offset = 0): Promise<AssetSearchResult[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  return request<AssetSearchResult[]>(`/api/assets/stocks?${params.toString()}`);
}