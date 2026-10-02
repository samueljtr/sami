export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer' | 'digital_wallet';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  monthlyBudget?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string; // Category id or name
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface UserSettings {
  currency: string;
  currencySymbol: string;
  monthlySavingsTarget: number;
  personName: string;
  customLogoUrl?: string;
}

export interface MonthData {
  year: number;
  month: number; // 0-11
  key: string; // YYYY-MM
  label: string; // "Octubre 2026"
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // 0 - 100%
  transactionsCount: number;
}
