import React, { useMemo } from 'react';
import { DebtAccount, MonthData, Transaction, UserSettings } from '../types/finance';
import { formatCurrency, formatDateES } from '../utils/storage';
import {
  Landmark,
  ArrowDown,
  ArrowUp,
  PlusCircle,
  Repeat,
  Lightbulb,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { SAMI_LOGO_DATA_URL } from '../constants/logo';

interface ResumenViewProps {
  currentMonthData: MonthData;
  settings: UserSettings;
  transactions: Transaction[];
  debts: DebtAccount[];
  onOpenNewExpense: () => void;
  onNavigateToDebts: () => void;
  onNavigateToTransactions: () => void;
}

export const ResumenView: React.FC<ResumenViewProps> = ({
  currentMonthData,
  settings,
  transactions,
  debts,
  onOpenNewExpense,
  onNavigateToDebts,
  onNavigateToTransactions,
}) => {
  const currencySymbol = settings.currencySymbol || '$';

  // Calculate debts summary directly from state
  const theyOweMeTotal = debts
    .filter((d) => d.type === 'owe_me')
    .reduce((sum, d) => sum + d.amount, 0);

  const iOweTotal = debts
    .filter((d) => d.type === 'i_owe')
    .reduce((sum, d) => sum + d.amount, 0);

  const pendingFriendsCount = debts.filter((d) => d.type === 'owe_me').length;
  const iOweAccountsCount = debts.filter((d) => d.type === 'i_owe').length;

  // Monthly budget calculation directly from real numbers
  const monthlyBudget = settings.monthlyBudgetTotal || 1200;
  const currentExpense = currentMonthData.totalExpense;
  const remainingBudget = Math.max(0, monthlyBudget - currentExpense);
  const budgetPercentUsed = monthlyBudget > 0 ? Math.min(100, Math.round((currentExpense / monthlyBudget) * 100)) : 0;

  // Category breakdown for the mini cards computed from real transactions
  const catBreakdown = useMemo(() => {
    const expenseTrans = transactions.filter((t) => t.type === 'expense');
    if (expenseTrans.length === 0) {
      return [
        { name: 'Comida', amount: 0 },
        { name: 'Hogar', amount: 0 },
        { name: 'Ocio', amount: 0 },
      ];
    }
    const map = new Map<string, number>();
    expenseTrans.forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    const sorted = Array.from(map.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    while (sorted.length < 3) {
      sorted.push({
        name: sorted.length === 1 ? 'Hogar' : 'Ocio',
        amount: 0,
      });
    }
    return sorted;
  }, [transactions]);

  // Pick top 3 recent transactions
  const recentTransactions = transactions.slice(0, 3);

  // Gradient generator for transaction avatars
  const getAvatarGradient = (idx: number) => {
    const gradients = [
      'from-cyan-500 to-teal-400',
      'from-emerald-500 to-teal-400',
      'from-indigo-500 to-purple-400',
      'from-rose-500 to-pink-400',
      'from-amber-500 to-orange-400',
    ];
    return gradients[idx % gradients.length];
  };

  const getInitials = (t: Transaction) => {
    if (t.friendName) {
      return t.friendName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    }
    if (t.payer && t.payer.toLowerCase() !== 'tú' && t.payer.toLowerCase() !== 'ti') {
      return t.payer.substring(0, 2).toUpperCase();
    }
    return t.description.substring(0, 2).toUpperCase() || 'TX';
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Hero Balance Total Actual Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        {/* Soft decorative background circles */}
        <div className="absolute -right-6 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute right-12 top-2 w-24 h-24 bg-white/5 rounded-full blur-md pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-blue-100 uppercase font-sans">
              BALANCE TOTAL ACTUAL
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 font-sans">
              {formatCurrency(currentMonthData.netSavings, currencySymbol)}
            </h2>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-xs">
            <Landmark className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Bottom controls */}
        <div className="mt-5 flex items-center justify-between gap-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-xs text-white text-xs px-3.5 py-1.5 rounded-full border border-white/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium">Sincronizado hace un momento</span>
          </div>

          <button
            type="button"
            onClick={onNavigateToTransactions}
            className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/20 transition-all cursor-pointer active:scale-95"
          >
            Detalles <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Side-by-side Debt Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Card: Te deben */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-xs relative overflow-hidden border-b-4 border-b-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-800">Te deben</span>
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold text-emerald-600 mt-2 tracking-tight">
            +{formatCurrency(theyOweMeTotal, currencySymbol)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {pendingFriendsCount} {pendingFriendsCount === 1 ? 'amigo pendiente' : 'amigos pendientes'}
          </p>
        </div>

        {/* Card: Debes */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-xs relative overflow-hidden border-b-4 border-b-rose-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-800">Debes</span>
            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
              <ArrowUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold text-rose-500 mt-2 tracking-tight">
            {formatCurrency(iOweTotal, currencySymbol)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {iOweAccountsCount} {iOweAccountsCount === 1 ? 'cuenta por saldar' : 'cuentas por saldar'}
          </p>
        </div>
      </div>

      {/* 3. Action Buttons Side-by-Side */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpenNewExpense}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-3.5 sm:p-4 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Agregar Gasto</span>
        </button>

        <button
          type="button"
          onClick={onNavigateToDebts}
          className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <Repeat className="w-4 h-4 text-neutral-600" />
          <span>Saldar Cuentas</span>
        </button>
      </div>

      {/* 4. Gastos del Mes Actual Card */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-xs space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
              Gastos del Mes Actual
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Presupuesto mensual: {formatCurrency(monthlyBudget, currencySymbol)}
            </p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3 py-1 rounded-full border border-indigo-100">
            {budgetPercentUsed}% Usado
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="font-bold text-neutral-900">
            {formatCurrency(currentExpense, currencySymbol)} gastados
          </span>
          <span className="text-neutral-500 font-medium">
            Restante: {formatCurrency(remainingBudget, currencySymbol)}
          </span>
        </div>

        {/* Gradient progress bar */}
        <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, budgetPercentUsed)}%` }}
          />
        </div>

        {/* 3 Category mini cards */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {catBreakdown.map((cat) => (
            <div
              key={cat.name}
              className="bg-neutral-50 rounded-2xl p-2.5 text-center border border-neutral-100/60"
            >
              <span className="text-[11px] font-medium text-neutral-500 block truncate">
                {cat.name}
              </span>
              <span className="text-xs font-bold text-neutral-900 block mt-0.5">
                {formatCurrency(cat.amount, currencySymbol)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Últimas Transacciones Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
            Últimas Transacciones
          </h3>
          <button
            type="button"
            onClick={onNavigateToTransactions}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            Ver todas
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-dashed border-neutral-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Receipt className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-neutral-800">
              No hay movimientos registrados
            </h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Tu historial está limpio. Haz clic abajo para registrar tu primer gasto o ingreso.
            </p>
            <button
              type="button"
              onClick={onOpenNewExpense}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              + Registrar Primer Gasto
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((t, idx) => {
              const isIncome = t.type === 'income';
              const isPositive = t.splitStatus === 'owe_me';
              const isLiquidated = t.splitStatus === 'settled';

              return (
                <div
                  key={t.id}
                  onClick={onNavigateToTransactions}
                  className="bg-white rounded-2xl p-3.5 border border-neutral-100 shadow-xs flex items-center justify-between gap-3 hover:border-neutral-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                        idx
                      )} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {getInitials(t)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                        {t.description}
                      </h4>
                      <p className="text-[11px] text-neutral-500 truncate">
                        Pagado por {t.payer || 'ti'} • {formatDateES(t.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-bold block ${
                        isIncome
                          ? 'text-emerald-600'
                          : isPositive
                          ? 'text-blue-600'
                          : 'text-neutral-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount, currencySymbol)}
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5 font-medium">
                      {isLiquidated
                        ? 'Saldado'
                        : isPositive
                        ? `Te deben ${formatCurrency(t.splitAmount || t.amount * 0.5, currencySymbol)}`
                        : t.splitStatus === 'i_owe'
                        ? 'Debes tu parte'
                        : t.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Consejo Sami Card */}
      <div className="bg-emerald-50/80 border border-emerald-100 rounded-3xl p-4 flex items-start gap-4 shadow-xs">
        <div className="w-15 h-15 rounded-2xl bg-white border border-emerald-200/80 p-1 shrink-0 shadow-xs flex items-center justify-center overflow-hidden">
          <img
            src={SAMI_LOGO_DATA_URL}
            alt="Sami Logo Oficial"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
            <span>Consejo Sami</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          </h4>
          <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
            {debts.length > 0
              ? 'Tienes cuentas pendientes con amigos. ¡Un recordatorio amable nunca está de más!'
              : 'Tus cuentas están al día. ¡Registra tus gastos en el momento para no olvidar ningún detalle!'}
          </p>
        </div>
      </div>
    </div>
  );
};
