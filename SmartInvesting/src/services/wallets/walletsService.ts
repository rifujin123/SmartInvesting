import { request } from "../api/client";
import type { WalletDto } from "./types";

export const walletsService = {
  getMyWallets(token: string, page = 1, pageSize = 20) {
    return request<{ items: WalletDto[]; totalCount: number }>(
      `/api/wallets?page=${page}&pageSize=${pageSize}`,
      { token },
    );
  },

  getWalletById(token: string, id: string) {
    return request<WalletDto>(`/api/wallets/${id}`, { token });
  },

  createWallet(token: string, body: { name: string; balance: number; currency: string; isPaper: boolean }) {
    return request<WalletDto>("/api/wallets", { method: "POST", body, token });
  },

  disableWallet(token: string, id: string) {
    return request<WalletDto>(`/api/wallets/${id}`, { method: "DELETE", token });
  },
};
