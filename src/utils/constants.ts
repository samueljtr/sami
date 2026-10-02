import { Category, PaymentMethod, Transaction, UserSettings } from '../types/finance';

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'USD',
  currencySymbol: '$',
  monthlySavingsTarget: 500,
  personName: 'Josué',
};

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'Efectivo', icon: 'Banknote' },
  { id: 'debit', label: 'Tarjeta de Débito', icon: 'CreditCard' },
  { id: 'credit', label: 'Tarjeta de Crédito', icon: 'CreditCard' },
  { id: 'transfer', label: 'Transferencia Bancaria', icon: 'Building2' },
  { id: 'digital_wallet', label: 'Billetera Digital', icon: 'Smartphone' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // Gastos
  { id: 'cat_alim', name: 'Alimentación y Supermercado', type: 'expense', icon: 'Utensils', color: '#F97316', monthlyBudget: 400 },
  { id: 'cat_viv', name: 'Vivienda y Servicios', type: 'expense', icon: 'Home', color: '#3B82F6', monthlyBudget: 800 },
  { id: 'cat_trans', name: 'Transporte y Movilidad', type: 'expense', icon: 'Car', color: '#6366F1', monthlyBudget: 150 },
  { id: 'cat_salud', name: 'Salud y Farmacia', type: 'expense', icon: 'HeartPulse', color: '#EC4899', monthlyBudget: 100 },
  { id: 'cat_ocio', name: 'Entretenimiento y Ocio', type: 'expense', icon: 'Film', color: '#8B5CF6', monthlyBudget: 180 },
  { id: 'cat_educ', name: 'Educación y Libros', type: 'expense', icon: 'GraduationCap', color: '#14B8A6', monthlyBudget: 120 },
  { id: 'cat_compras', name: 'Ropa y Tecnología', type: 'expense', icon: 'ShoppingBag', color: '#EAB308', monthlyBudget: 150 },
  { id: 'cat_suscrip', name: 'Suscripciones y Software', type: 'expense', icon: 'Tv', color: '#06B6D4', monthlyBudget: 60 },
  { id: 'cat_otros_g', name: 'Otros Gastos', type: 'expense', icon: 'HelpCircle', color: '#64748B', monthlyBudget: 100 },

  // Ingresos
  { id: 'cat_salario', name: 'Salario / Nómina', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { id: 'cat_freelance', name: 'Freelance / Servicios', type: 'income', icon: 'Laptop', color: '#059669' },
  { id: 'cat_invers', name: 'Inversiones y Rendimientos', type: 'income', icon: 'TrendingUp', color: '#047857' },
  { id: 'cat_ventas', name: 'Ventas Ocasionales', type: 'income', icon: 'Store', color: '#14B8A6' },
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
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Format date helper: returns YYYY-MM-DD
  const formatD = (year: number, month: number, day: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const prev2Month = prevMonth === 0 ? 11 : prevMonth - 1;
  const prev2Year = prevMonth === 0 ? prevYear - 1 : prevYear;

  return [
    // Mes actual
    {
      id: 'demo_1',
      type: 'income',
      amount: 2400,
      category: 'Salario / Nómina',
      date: formatD(currentYear, currentMonth, 1),
      description: 'Pago de nómina quincenal principal',
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_2',
      type: 'expense',
      amount: 650,
      category: 'Vivienda y Servicios',
      date: formatD(currentYear, currentMonth, 2),
      description: 'Arriendo mensual del departamento',
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_3',
      type: 'expense',
      amount: 145.50,
      category: 'Alimentación y Supermercado',
      date: formatD(currentYear, currentMonth, 3),
      description: 'Compra semanal en supermercado',
      paymentMethod: 'debit',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_4',
      type: 'expense',
      amount: 45,
      category: 'Transporte y Movilidad',
      date: formatD(currentYear, currentMonth, 4),
      description: 'Recarga tarjeta de transporte y combustible',
      paymentMethod: 'cash',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_5',
      type: 'expense',
      amount: 18.99,
      category: 'Suscripciones y Software',
      date: formatD(currentYear, currentMonth, 5),
      description: 'Suscripción streaming y nube',
      paymentMethod: 'credit',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_6',
      type: 'income',
      amount: 450,
      category: 'Freelance / Servicios',
      date: formatD(currentYear, currentMonth, 8),
      description: 'Consultoría y desarrollo web freelance',
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_7',
      type: 'expense',
      amount: 82.30,
      category: 'Alimentación y Supermercado',
      date: formatD(currentYear, currentMonth, 10),
      description: 'Mercado de frutas, verduras y carnes',
      paymentMethod: 'debit',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_8',
      type: 'expense',
      amount: 55,
      category: 'Entretenimiento y Ocio',
      date: formatD(currentYear, currentMonth, 12),
      description: 'Cena con amigos y cine fin de semana',
      paymentMethod: 'credit',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_9',
      type: 'expense',
      amount: 32.50,
      category: 'Salud y Farmacia',
      date: formatD(currentYear, currentMonth, 15),
      description: 'Vitaminas y medicamentos recetados',
      paymentMethod: 'cash',
      createdAt: new Date().toISOString(),
    },

    // Mes anterior
    {
      id: 'demo_10',
      type: 'income',
      amount: 2400,
      category: 'Salario / Nómina',
      date: formatD(prevYear, prevMonth, 1),
      description: 'Salario mensual recibido',
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_11',
      type: 'income',
      amount: 320,
      category: 'Freelance / Servicios',
      date: formatD(prevYear, prevMonth, 12),
      description: 'Diseño de interfaz para cliente local',
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_12',
      type: 'expense',
      amount: 650,
      category: 'Vivienda y Servicios',
      date: formatD(prevYear, prevMonth, 2),
      description: 'Arriendo mensual',
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_13',
      type: 'expense',
      amount: 340,
      category: 'Alimentación y Supermercado',
      date: formatD(prevYear, prevMonth, 14),
      description: 'Mercado del mes completo',
      paymentMethod: 'debit',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_14',
      type: 'expense',
      amount: 110,
      category: 'Transporte y Movilidad',
      date: formatD(prevYear, prevMonth, 18),
      description: 'Mantenimiento preventivo moto/auto',
      paymentMethod: 'credit',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_15',
      type: 'expense',
      amount: 95,
      category: 'Entretenimiento y Ocio',
      date: formatD(prevYear, prevMonth, 22),
      description: 'Paseo de fin de semana y comida',
      paymentMethod: 'credit',
      createdAt: new Date().toISOString(),
    },

    // 2 meses atrás
    {
      id: 'demo_16',
      type: 'income',
      amount: 2400,
      category: 'Salario / Nómina',
      date: formatD(prev2Year, prev2Month, 1),
      description: 'Salario mensual nómina',
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_17',
      type: 'expense',
      amount: 650,
      category: 'Vivienda y Servicios',
      date: formatD(prev2Year, prev2Month, 2),
      description: 'Arriendo mensual',
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_18',
      type: 'expense',
      amount: 310,
      category: 'Alimentación y Supermercado',
      date: formatD(prev2Year, prev2Month, 11),
      description: 'Alimentos y despensa',
      paymentMethod: 'debit',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_19',
      type: 'expense',
      amount: 120,
      category: 'Educación y Libros',
      date: formatD(prev2Year, prev2Month, 19),
      description: 'Curso en línea de finanzas y desarrollo',
      paymentMethod: 'credit',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_20',
      type: 'income',
      amount: 60,
      category: 'Inversiones y Rendimientos',
      date: formatD(prev2Year, prev2Month, 28),
      description: 'Dividendos de fondo indexado',
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
  ];
}
