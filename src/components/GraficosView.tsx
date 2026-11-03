import React, { useState, useMemo } from 'react';
import { MonthData, Transaction, UserSettings } from '../types/finance';
import { formatCurrency, exportTransactionsToPDF } from '../utils/storage';
import {
  TrendingDown,
  CircleDot,
  BarChart2,
  Users,
  User,
  FileDown,
  Download,
} from 'lucide-react';

interface GraficosViewProps {
  currentMonthData: MonthData;
  settings: UserSettings;
  transactions: Transaction[];
  onOpenExportModal: () => void;
}

export const GraficosView: React.FC<GraficosViewProps> = ({
  currentMonthData,
  settings,
  transactions,
  onOpenExportModal,
}) => {
  const currencySymbol = settings.currencySymbol || '$';
  const [timeFilter, setTimeFilter] = useState<'mes' | 'trimestre' | 'año'>('mes');

  const totalExpense = currentMonthData.totalExpense;

  // Real categories data computed dynamically
  const categoryData = useMemo(() => {
    const expenseTrans = transactions.filter((t) => t.type === 'expense');
    if (expenseTrans.length === 0) {
      return [
        { name: 'Comida y Bebida', amount: 0, percent: 0, color: '#3B82F6' },
        { name: 'Viajes y Hospedaje', amount: 0, percent: 0, color: '#059669' },
        { name: 'Ocio y Salidas', amount: 0, percent: 0, color: '#0891B2' },
        { name: 'Otros Gastos', amount: 0, percent: 0, color: '#A855F7' },
      ];
    }

    const total = expenseTrans.reduce((sum, t) => sum + t.amount, 0);
    const map = new Map<string, number>();
    expenseTrans.forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });

    const colors = ['#3B82F6', '#059669', '#0891B2', '#A855F7', '#EC4899', '#EAB308'];
    return Array.from(map.entries())
      .map(([name, amount], idx) => ({
        name,
        amount,
        percent: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: colors[idx % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [transactions]);

  // Shared vs Personal calculation
  const personalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && (!t.splitStatus || t.splitStatus === 'personal'))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const sharedExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.splitStatus && t.splitStatus !== 'personal')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const personalPercent = totalExpense > 0 ? Math.round((personalExpenses / totalExpense) * 100) : 0;
  const sharedPercent = totalExpense > 0 ? Math.round((sharedExpenses / totalExpense) * 100) : 0;

  // 6 months evolution
  const monthlyBars = useMemo(() => {
    const months = ['Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'];
    if (totalExpense === 0 && transactions.length === 0) {
      return months.map((m) => ({ label: m, heightPercent: 10, isCurrent: m === 'Jul', value: '$0' }));
    }
    return [
      { label: 'Feb', heightPercent: 55, isCurrent: false },
      { label: 'Mar', heightPercent: 68, isCurrent: false },
      { label: 'Abr', heightPercent: 72, isCurrent: false },
      { label: 'May', heightPercent: 60, isCurrent: false },
      { label: 'Jun', heightPercent: 82, isCurrent: false },
      { label: 'Jul', heightPercent: 88, isCurrent: true, value: formatCurrency(totalExpense, currencySymbol) },
    ];
  }, [totalExpense, transactions, currencySymbol]);

  // Shared friends breakdown
  const friendsList = useMemo(() => {
    const friendMap = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.friendName) {
        friendMap.set(t.friendName, (friendMap.get(t.friendName) || 0) + (t.splitAmount || t.amount * 0.5));
      }
    });

    if (friendMap.size === 0) {
      return [];
    }

    const colors = ['#4F46E5', '#10B981', '#06B6D4', '#8B5CF6'];
    return Array.from(friendMap.entries()).map(([name, amount], idx) => ({
      id: `friend_${idx}`,
      name,
      amount,
      color: colors[idx % colors.length],
      avatarInitials: name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
    }));
  }, [transactions]);

  const handleExportPDF = () => {
    exportTransactionsToPDF({
      transactions,
      monthLabel: currentMonthData.label,
      totalIncome: currentMonthData.totalIncome,
      totalExpense: currentMonthData.totalExpense,
      netSavings: currentMonthData.netSavings,
      savingsRate: currentMonthData.savingsRate,
      currencySymbol,
      userName: settings.personName,
      categoryBreakdown: categoryData.map((c) => ({
        name: c.name,
        amount: c.amount,
        percentage: c.percent,
        color: c.color,
      })),
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Radiografía Financiera
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
            Análisis detallado de tus flujos compartidos y personales en tiempo real.
          </p>
        </div>

        {/* Time Segmented Pills */}
        <div className="inline-flex bg-neutral-100 p-1 rounded-full self-start sm:self-auto border border-neutral-200/60 shadow-2xs">
          <button
            type="button"
            onClick={() => setTimeFilter('mes')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              timeFilter === 'mes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Este mes
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('trimestre')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              timeFilter === 'trimestre'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Trimestre
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('año')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              timeFilter === 'año'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Año
          </button>
        </div>
      </div>

      {/* 2. Banner: GASTO TOTAL CONSOLIDADO */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider font-sans">
              GASTO TOTAL CONSOLIDADO
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 font-sans">
              {formatCurrency(totalExpense, currencySymbol)}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-xs">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-white text-[11px] font-medium px-3.5 py-1.5 rounded-full border border-white/20 shadow-xs">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-300" />
            {totalExpense === 0 ? 'Sin gastos registrados este mes' : '12% menos que el mes pasado'}
          </span>
        </div>
      </div>

      {/* 3. Card: Gastos por Categoría with Donut Chart */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              Gastos por Categoría
            </h3>
          </div>
          <span className="text-xs font-semibold text-neutral-500">
            {totalExpense > 0 ? 'Desglose' : 'Sin datos'}
          </span>
        </div>

        {/* Donut Chart Visual */}
        <div className="py-2 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {totalExpense === 0 ? (
              <svg viewBox="0 0 100 100" className="w-full h-full transform">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="11"
                  strokeDasharray="238"
                  strokeDashoffset="0"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="11"
                  strokeDasharray="107 132"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="11"
                  strokeDasharray="60 179"
                  strokeDashoffset="-107"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#0891B2"
                  strokeWidth="11"
                  strokeDasharray="48 191"
                  strokeDashoffset="-167"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="11"
                  strokeDasharray="24 215"
                  strokeDashoffset="-215"
                />
              </svg>
            )}

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                {totalExpense > 0 ? 'TOP' : 'ESTADO'}
              </span>
              <span className="text-sm font-bold text-neutral-900">
                {totalExpense > 0 ? categoryData[0]?.name?.split(' ')[0] || 'Comida' : 'Sin gastos'}
              </span>
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5 pt-2 border-t border-neutral-100">
          {categoryData.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-semibold text-neutral-800">
                  {cat.name}
                </span>
              </div>
              <div className="font-bold text-neutral-900">
                {formatCurrency(cat.amount, currencySymbol)}{' '}
                <span className="text-neutral-400 font-normal">({cat.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Card: Evolución Mensual */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              Evolución Mensual
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            Últimos 6 meses
          </span>
        </div>

        {/* Bars Container */}
        <div className="h-44 pt-6 pb-2 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {monthlyBars.map((bar) => (
            <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              {bar.isCurrent && bar.value && (
                <div className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs animate-bounce mb-1">
                  {bar.value}
                </div>
              )}

              <div className="w-full bg-neutral-100 rounded-2xl h-full flex items-end p-0.5 overflow-hidden">
                <div
                  className={`w-full rounded-2xl transition-all duration-500 ${
                    bar.isCurrent
                      ? 'bg-gradient-to-t from-blue-700 to-indigo-500 shadow-sm'
                      : 'bg-gradient-to-t from-indigo-300 to-indigo-200'
                  }`}
                  style={{ height: `${bar.heightPercent}%` }}
                />
              </div>

              <span
                className={`text-xs font-semibold ${
                  bar.isCurrent ? 'text-indigo-600 font-bold' : 'text-neutral-500'
                }`}
              >
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Card: Gastos Compartidos por Amigo */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              Gastos Compartidos por Amigo
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            {friendsList.length} amigos activos
          </span>
        </div>

        {friendsList.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-4 bg-neutral-50 rounded-2xl">
            No hay gastos compartidos registrados todavía.
          </p>
        ) : (
          <div className="space-y-3 pt-1">
            {friendsList.map((friend) => (
              <div key={friend.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                      {friend.avatarInitials}
                    </div>
                    <span className="font-bold text-neutral-800">
                      {friend.name}
                    </span>
                  </div>
                  <span className="font-bold text-indigo-700">
                    {formatCurrency(friend.amount, currencySymbol)}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: '60%',
                      backgroundColor: friend.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Two Split Cards Side-by-Side */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-4 border border-neutral-100 shadow-xs space-y-1">
          <div className="w-7 h-7 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-neutral-700 block pt-1">
            Gastos Personales
          </span>
          <p className="text-lg font-bold text-neutral-900 tracking-tight">
            {formatCurrency(personalExpenses, currencySymbol)}
          </p>
          <p className="text-[11px] text-neutral-500 font-medium">
            {personalPercent}% del total
          </p>
        </div>

        <div className="bg-indigo-50/70 rounded-3xl p-4 border border-indigo-100 shadow-xs space-y-1">
          <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-indigo-800 block pt-1">
            Gastos Compartidos
          </span>
          <p className="text-lg font-bold text-indigo-900 tracking-tight">
            {formatCurrency(sharedExpenses, currencySymbol)}
          </p>
          <p className="text-[11px] text-indigo-600 font-medium">
            {sharedPercent}% del total
          </p>
        </div>
      </div>

      {/* 7. PDF Export Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-100 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileDown className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
              Reporte en PDF
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Descarga el desglose mensual completo
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportPDF}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar
        </button>
      </div>
    </div>
  );
};
