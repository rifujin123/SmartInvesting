import { request } from "../api/client";
import {
  AddTransactionRequestDto,
  PagedResponse,
  TransactionDto,
  UpdateTransactionRequestDto,
} from "./types";

export const transactionsService = {
  getTransactionsByWallet(
    token: string,
    walletId: string,
    page: number,
    pageSize: number,
  ) {
    return request<PagedResponse<TransactionDto>>(
      `/api/wallets/${walletId}/transactions?page=${page}&pageSize=${pageSize}`,
      { token },
    );
  },

  getTransactionById(
    token: string,
    walletId: string,
    transactionId: string,
  ) {
    return request<TransactionDto>(
      `/api/wallets/${walletId}/transactions/${transactionId}`,
      { token },
    );
  },

  createTransaction(
    token: string,
    walletId: string,
    body: AddTransactionRequestDto,
  ) {
    return request<TransactionDto>(
      `/api/wallets/${walletId}/transactions`,
      { method: "POST", body, token },
    );
  },

  updateTransaction(
    token: string,
    walletId: string,
    transactionId: string,
    body: UpdateTransactionRequestDto,
  ) {
    return request<TransactionDto>(
      `/api/wallets/${walletId}/transactions/${transactionId}`,
      { method: "PUT", body, token },
    );
  },

  deleteTransaction(
    token: string,
    walletId: string,
    transactionId: string,
  ) {
    return request<TransactionDto>(
      `/api/wallets/${walletId}/transactions/${transactionId}`,
      { method: "DELETE", token },
    );
  },
};
