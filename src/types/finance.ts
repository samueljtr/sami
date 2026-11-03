export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer' | 'digital_wallet';

export type AppTab = 'resumen' | 'movimientos' | 'graficos' | 'presupuestos' | 'medeben';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  monthlyBudget?: number;
  spent?: number;
  badgeLabel?: string;
  badgeType?: 'danger' | 'success' | 'info' | 'neutral';
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
  // Shared expenses and debt fields
  payer?: string; // e.g. "Tú", "Sofía", "Carlos", "Lucía", "Ana"
  splitStatus?: 'owe_me' | 'i_owe' | 'settled' | 'personal';
  splitAmount?: number;
  splitNote?: string;
  groupName?: string;
  friendName?: string;
}

export interface DebtAccount {
  id: string;
  type: 'owe_me' | 'i_owe' | 'settled'; // owe_me: "Te debe", i_owe: "Le debes", settled: "Al día"
  personName: string;
  concept: string;
  timeAgo: string;
  amount: number;
  statusText: string;
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColor?: string;
  isGroup?: boolean;
  groupMembers?: number;
  totalGroupExpense?: number;
  phone?: string;
}

export interface SharedFriendExpense {
  id: string;
  name: string;
  amount: number;
  avatarUrl?: string;
  avatarInitials?: string;
  color: string;
}

export interface UserSettings {
  currency: string;
  currencySymbol: string;
  monthlySavingsTarget: number;
  monthlyBudgetTotal?: number;
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
