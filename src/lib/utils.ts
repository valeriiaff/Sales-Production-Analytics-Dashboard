import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value?: number | null, language: 'uk' | 'en' = 'uk', decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return `0 ₴`;
  }
  const formatted = new Intl.NumberFormat(language === 'uk' ? 'uk-UA' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));

  const currencySymbol = '₴';
  if (value < 0) {
    return `-${formatted} ${currencySymbol}`;
  } else if (value > 0) {
    return `+${formatted} ${currencySymbol}`;
  }
  return `${formatted} ${currencySymbol}`;
}

export function formatNumber(value?: number | null, language: 'uk' | 'en' = 'uk', decimals: number = 0): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat(language === 'uk' ? 'uk-UA' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value?: number | null, withSign: boolean = true): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.0%';
  }
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function getStatusColor(status?: 'positive' | 'negative' | 'critical') {
  switch (status) {
    case 'positive':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'negative':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    case 'critical':
    default:
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
      };
  }
}
