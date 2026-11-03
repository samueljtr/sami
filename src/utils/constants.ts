import { Category, DebtAccount, PaymentMethod, SharedFriendExpense, Transaction, UserSettings } from '../types/finance';

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'USD',
  currencySymbol: '$',
  monthlySavingsTarget: 500,
  monthlyBudgetTotal: 2000,
  personName: 'Josué',
};

export const DEFAULT_DEBTS: DebtAccount[] = [];

export const DEFAULT_SHARED_FRIENDS: SharedFriendExpense[] = [];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'Efectivo', icon: 'Banknote' },
  { id: 'debit', label: 'Tarjeta de Débito', icon: 'CreditCard' },
  { id: 'credit', label: 'Tarjeta de Crédito', icon: 'CreditCard' },
  { id: 'transfer', label: 'Transferencia Bancaria', icon: 'Building2' },
  { id: 'digital_wallet', label: 'Billetera Digital', icon: 'Smartphone' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // Gastos
  { id: 'cat_alim', name: 'Comida fuera', type: 'expense', icon: 'Utensils', color: '#EF4444', monthlyBudget: 350, spent: 0 },
  { id: 'cat_super', name: 'Supermercado', type: 'expense', icon: 'ShoppingCart', color: '#10B981', monthlyBudget: 600, spent: 0 },
  { id: 'cat_trans', name: 'Transporte', type: 'expense', icon: 'Car', color: '#06B6D4', monthlyBudget: 250, spent: 0 },
  { id: 'cat_ocio', name: 'Ocio y Entretenimiento', type: 'expense', icon: 'Film', color: '#8B5CF6', monthlyBudget: 200, spent: 0 },
  { id: 'cat_viv', name: 'Vivienda y Servicios', type: 'expense', icon: 'Home', color: '#3B82F6', monthlyBudget: 600, spent: 0 },
  { id: 'cat_otros_g', name: 'Otros Gastos', type: 'expense', icon: 'HelpCircle', color: '#64748B', monthlyBudget: 150, spent: 0 },

  // Ingresos
  { id: 'cat_salario', name: 'Salario / Nómina', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { id: 'cat_freelance', name: 'Freelance / Servicios', type: 'income', icon: 'Laptop', color: '#059669' },
  { id: 'cat_invers', name: 'Inversiones y Rendimientos', type: 'income', icon: 'TrendingUp', color: '#047857' },
  { id: 'cat_otros_i', name: 'Otros Ingresos', type: 'income', icon: 'PlusCircle', color: '#3B82F6' },
];

export const AVAILABLE_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano ($)' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano ($)' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino ($)' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano (S/)' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno ($)' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina (£)' },
];

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function getInitialDemoTransactions(): Transaction[] {
  return [];
}
