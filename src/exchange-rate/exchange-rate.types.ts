export interface ExchangeRateApiResponse {
  result: 'success' | 'error';
  base_code?: string;
  time_last_update_unix?: number;
  rates?: Record<string, number>;
  'error-type'?: string;
}

export interface ExchangeRateSnapshot {
  provider: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  rateUpdatedAt: Date;
  fetchedAt: Date;
}