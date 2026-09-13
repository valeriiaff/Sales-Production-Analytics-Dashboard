export interface SalesItem {
  id: string;
  product: string;
  productEn: string;
  planQty: number;
  planPrice: number;
  planTotal: number;
  factQty: number;
  factPrice: number;
  factTotal: number;
  varianceTotal: number;
  varianceVolume: number;
  variancePrice: number;
  variancePercent: number;
  volumeChangePercent: number;
  priceChangePercent: number;
  comment: string;
  commentEn: string;
  status: 'positive' | 'negative' | 'critical';
}

export interface LaborItem {
  id: string;
  role: string;
  roleEn: string;
  planHoursPerTon: number;
  planHourlyRate: number;
  planRatePerHour: number;
  planTotal: number;
  factHoursPerTon: number;
  factHourlyRate: number;
  factRatePerHour: number;
  factTotal: number;
  varianceTotal: number;
  varianceVolume: number;
  varianceHours: number;
  varianceRate: number;
  variancePercent: number;
  hoursChangePercent: number;
  rateChangePercent: number;
  comment: string;
  commentEn: string;
  status: 'positive' | 'negative' | 'critical';
}

export interface SalesTotalSummary {
  planQty: number;
  planTotal: number;
  factQty: number;
  factTotal: number;
  varianceTotal: number;
  varianceVolume: number;
  variancePrice: number;
  variancePercent: number;
}

export interface LaborTotalSummary {
  planHours: number;
  planTotal: number;
  factHours: number;
  factTotal: number;
  varianceTotal: number;
  varianceVolume: number;
  varianceHours: number;
  varianceRate: number;
  variancePercent: number;
}

export type ActiveTab = 'overview' | 'sales' | 'labor' | 'factor-bridge' | 'matrix' | 'simulator' | 'table' | 'insights';

export type Language = 'uk' | 'en';
