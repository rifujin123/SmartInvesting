export interface WalletDto {
  id: string;
  name: string;
  balance: number;
  currency: string;
  isPaper: boolean;
}

export interface TransactionDto {
  id: string;
  amount: number;
  transactionDate: string;
  note: string;
  walletId: string;
  categoryId: number;
  categoryName: string;
  categoryType: number;
  categoryIcon: string;
  assetId: number | null;
  assetName: string;
}

export interface AddTransactionRequestDto {
  amount: number;
  note?: string;
  categoryId: number;
  assetId?: number;
}

export interface UpdateTransactionRequestDto {
  amount: number;
  note?: string;
  categoryId: number;
  assetId?: number;
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
