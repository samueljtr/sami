import { Category, DebtAccount, PaymentMethod, SharedFriendExpense, Transaction, UserSettings } from '../types/finance';

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'USD',
  currencySymbol: '$',
  monthlySavingsTarget: 500,
  monthlyBudgetTotal: 2000,
  personName: 'Josué',
};

export const DEFAULT_DEBTS: DebtAccount[] = [
  {
    id: 'debt_1',
    type: 'owe_me',
    personName: 'Carlos Mendoza',
    concept: 'Cena de sushi y bebidas',
    timeAgo: 'Hace 2 días',
    amount: 150.00,
    statusText: 'Te debe',
    avatarInitials: 'CM',
    avatarColor: 'from-emerald-400 to-teal-500',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    phone: '+34600112233',
  },
  {
    id: 'debt_2',
    type: 'i_owe',
    personName: 'Ana Torres',
    concept: 'Uber al aeropuerto',
    timeAgo: 'Ayer',
    amount: 45.00,
    statusText: 'Le debes',
    avatarInitials: 'AT',
    avatarColor: 'from-rose-400 to-pink-500',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    phone: '+34611223344',
  },
  {
    id: 'debt_3',
    type: 'settled',
    personName: 'Viaje a Playa del Carmen',
    concept: 'Grupo de 4 personas • Saldo grupal',
    timeAgo: 'Saldo grupal',
    amount: 0.00,
    statusText: 'Al día',
    isGroup: true,
    groupMembers: 4,
    totalGroupExpense: 1240.00,
  },
];

export const DEFAULT_SHARED_FRIENDS: SharedFriendExpense[] = [
  { id: 'f_1', name: 'Sofía Valdés', amount: 540.00, color: '#4F46E5', avatarInitials: 'SV', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
  { id: 'f_2', name: 'Mateo Rossi', amount: 410.20, color: '#10B981', avatarInitials: 'MR', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { id: 'f_3', name: 'Lucía Méndez', amount: 325.00, color: '#06B6D4', avatarInitials: 'LM', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  { id: 'f_4', name: 'Carlos Ruiz', amount: 207.30, color: '#8B5CF6', avatarInitials: 'CR', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'Efectivo', icon: 'Banknote' },
  { id: 'debit', label: 'Tarjeta de Débito', icon: 'CreditCard' },
  { id: 'credit', label: 'Tarjeta de Crédito', icon: 'CreditCard' },
  { id: 'transfer', label: 'Transferencia Bancaria', icon: 'Building2' },
  { id: 'digital_wallet', label: 'Billetera Digital', icon: 'Smartphone' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // Gastos con presupuestos activos como en la imagen
  { id: 'cat_alim', name: 'Comida fuera', type: 'expense', icon: 'Utensils', color: '#EF4444', monthlyBudget: 350, spent: 308, badgeLabel: 'Quedan 10 días', badgeType: 'danger' },
  { id: 'cat_super', name: 'Supermercado', type: 'expense', icon: 'ShoppingCart', color: '#10B981', monthlyBudget: 600, spent: 380, badgeLabel: 'Buen ritmo', badgeType: 'success' },
  { id: 'cat_trans', name: 'Transporte', type: 'expense', icon: 'Car', color: '#06B6D4', monthlyBudget: 250, spent: 140, badgeLabel: 'En orden', badgeType: 'info' },
  { id: 'cat_ocio', name: 'Ocio y Entretenimiento', type: 'expense', icon: 'Film', color: '#8B5CF6', monthlyBudget: 200, spent: 122, badgeLabel: 'Estable', badgeType: 'neutral' },
  { id: 'cat_viv', name: 'Vivienda y Servicios', type: 'expense', icon: 'Home', color: '#3B82F6', monthlyBudget: 600, spent: 310.50 },
  { id: 'cat_otros_g', name: 'Otros Gastos', type: 'expense', icon: 'HelpCircle', color: '#64748B', monthlyBudget: 150, spent: 148.30 },

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

  const currentDay = now.getDate();
  const dToday = formatD(currentYear, currentMonth, currentDay);
  const dYesterday = formatD(currentYear, currentMonth, Math.max(1, currentDay - 1));
  const d3DaysAgo = formatD(currentYear, currentMonth, Math.max(1, currentDay - 3));
  const d4DaysAgo = formatD(currentYear, currentMonth, Math.max(1, currentDay - 4));
  const d5DaysAgo = formatD(currentYear, currentMonth, Math.max(1, currentDay - 5));

  return [
    // Mes actual - Movimientos destacados de los screenshots
    {
      id: 'demo_1',
      type: 'expense',
      amount: 64.00,
      category: 'Comida fuera',
      date: dToday,
      description: 'Cena de Tapas en La Terraza',
      paymentMethod: 'credit',
      payer: 'Tú',
      splitStatus: 'owe_me',
      splitAmount: 48.00,
      splitNote: 'Te deben 48.00',
      friendName: 'Carlos Mendoza',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_2',
      type: 'expense',
      amount: 85.20,
      category: 'Vivienda y Servicios',
      date: dToday,
      description: 'Factura de Luz – Endesa',
      paymentMethod: 'debit',
      payer: 'Sofía',
      splitStatus: 'i_owe',
      splitAmount: 28.40,
      splitNote: 'Debes tu parte',
      friendName: 'Sofía Valdés',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_3',
      type: 'expense',
      amount: 240.00,
      category: 'Transporte',
      date: dYesterday,
      description: 'Vuelos a Roma (Escapada)',
      paymentMethod: 'transfer',
      payer: 'Carlos',
      splitStatus: 'settled',
      splitAmount: 0,
      splitNote: 'Liquidado',
      friendName: 'Carlos Ruiz',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_4',
      type: 'expense',
      amount: 54.30,
      category: 'Supermercado',
      date: dYesterday,
      description: 'Compra semanal en Carrefour',
      paymentMethod: 'debit',
      payer: 'Tú',
      splitStatus: 'owe_me',
      splitAmount: 36.20,
      splitNote: 'Dividido con 2 amigos',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_5',
      type: 'expense',
      amount: 28.00,
      category: 'Ocio y Entretenimiento',
      date: d3DaysAgo,
      description: 'Entradas de Cine IMAX y Popcorn',
      paymentMethod: 'digital_wallet',
      payer: 'Lucía',
      splitStatus: 'i_owe',
      splitAmount: 14.00,
      splitNote: 'Debes tu parte',
      friendName: 'Lucía Méndez',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_6',
      type: 'expense',
      amount: 45.00,
      category: 'Comida fuera',
      date: d4DaysAgo,
      description: 'Cena en Pizzería Napolitana',
      paymentMethod: 'credit',
      payer: 'Tú',
      splitStatus: 'owe_me',
      splitAmount: 22.50,
      splitNote: 'Te deben $22.50',
      friendName: 'Carlos Mendoza',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_7',
      type: 'expense',
      amount: 34.00,
      category: 'Supermercado',
      date: d3DaysAgo,
      description: 'Supermercado Semanal',
      paymentMethod: 'debit',
      payer: 'Ana',
      splitStatus: 'i_owe',
      splitAmount: 34.00,
      splitNote: 'Debes tu parte',
      friendName: 'Ana Torres',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_8',
      type: 'expense',
      amount: 28.50,
      category: 'Transporte',
      date: d5DaysAgo,
      description: 'Uber al Aeropuerto',
      paymentMethod: 'digital_wallet',
      payer: 'Tú',
      splitStatus: 'settled',
      splitAmount: 0,
      splitNote: 'Saldado',
      friendName: 'Ana Torres',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_income_1',
      type: 'income',
      amount: 2400.00,
      category: 'Salario / Nómina',
      date: formatD(currentYear, currentMonth, 1),
      description: 'Nómina mensual de trabajo',
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_income_2',
      type: 'income',
      amount: 450.00,
      category: 'Freelance / Servicios',
      date: formatD(currentYear, currentMonth, 10),
      description: 'Proyecto de consultoría digital',
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_sub_1',
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
