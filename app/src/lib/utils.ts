import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: string = 'USD',
  showSign: boolean = false
): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  if (showSign) {
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  }
  return value < 0 ? `-${formatted}` : formatted;
}

export function formatPercent(value: number, showSign: boolean = false): string {
  const formatted = `${Math.abs(value).toFixed(2)}%`;
  if (showSign) {
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  }
  return formatted;
}

export function formatDate(date: string | Date, fmt: string = 'MMM dd, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm');
}

export function getPnLColor(value: number): string {
  if (value > 0) return 'text-success';
  if (value < 0) return 'text-loss';
  return 'text-muted-foreground';
}

export function getPnLBgColor(value: number): string {
  if (value > 0) return 'bg-success/10 text-success';
  if (value < 0) return 'bg-loss/10 text-loss';
  return 'bg-muted text-muted-foreground';
}

export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return (wins / total) * 100;
}

export function calculateProfitFactor(grossProfit: number, grossLoss: number): number {
  if (grossLoss === 0) return grossProfit > 0 ? 999 : 0;
  return grossProfit / Math.abs(grossLoss);
}

export function calculateRR(pnl: number, risk: number): number {
  if (risk === 0) return 0;
  return pnl / Math.abs(risk);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  return eachDayOfInterval({ start, end });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const COMMON_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD',
  'US30', 'US100', 'US500', 'GER40', 'UK100',
  'USOIL', 'UKOIL',
];

export const BROKERS = [
  'FTMO', 'Blue Guardian', 'Goat Funded', 'FundedNext', 'MyForexFunds',
  'The5ers', 'Fidelcrest', 'E8 Funding', 'Apex Trader Funding',
  'Interactive Brokers', 'Pepperstone', 'IC Markets', 'XM', 'Exness',
  'Personal / Retail',
];
