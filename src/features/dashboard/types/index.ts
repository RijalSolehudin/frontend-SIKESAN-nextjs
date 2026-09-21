export interface TreasurerMetrics {
  global_wallet_balance: number;
  spp?: {
    paid_this_year: number;
    paid_all_time: number;
  };
  expenses?: {
    this_year: number;
    all_time: number;
  };
  total_unpaid_spp_overall?: number;
  total_infaq_overall?: number;
}

export interface TreasurerMetricsResponse {
  message: string;
  data: TreasurerMetrics;
}
