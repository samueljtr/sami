import React, { useMemo, useState } from 'react';
import { Category, MonthData, UserSettings } from '../types/finance';
import { formatCurrency } from '../utils/storage';
import {
  Wallet,
  AlertTriangle,
  Plus,
  PiggyBank,
  Lightbulb,
  Clock,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Edit3,
  Target,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { SAMI_LOGO_DATA_URL } from '../constants/logo';
import { renderCategoryIcon } from '../utils/categoryIcons';

interface PresupuestosViewProps {
  categories: Category[];
  currentMonthData: MonthData;
  settings: UserSettings;
  onOpenNewLimit: () => void;
  onApplySavingsChallenge: (amount: number, title?: string) => void;
  onUpdateSettings?: (newSettings: UserSettings) => void;
}

export const PresupuestosView: React.FC<PresupuestosViewProps> = ({
  categories,
  currentMonthData,
  settings,
  onOpenNewLimit,
  onApplySavingsChallenge,
  onUpdateSettings,
}) => {
  const currencySymbol = settings.currencySymbol || '$';
  const totalLimit = settings.monthlyBudgetTotal || 2000;
  const totalSpent = currentMonthData.totalExpense;
  const remaining = Math.max(0, totalLimit - totalSpent);
  const spentPercent = totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1) : '0.0';

  const savingsTarget = settings.monthlySavingsTarget || 500;
  const netSavings = currentMonthData.netSavings;
  const savingsProgressPercent =
    savingsTarget > 0 ? Math.min(100, Math.max(0, Math.round((netSavings / savingsTarget) * 100))) : 0;

  // Editing budget & savings target modals/states
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetVal, setNewBudgetVal] = useState(String(totalLimit));

  const [isEditingSavings, setIsEditingSavings] = useState(false);
  const [newSavingsVal, setNewSavingsVal] = useState(String(savingsTarget));

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newBudgetVal);
    if (!isNaN(val) && val > 0 && onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        monthlyBudgetTotal: val,
      });
    }
    setIsEditingBudget(false);
  };

  const handleSaveSavings = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newSavingsVal);
    if (!isNaN(val) && val > 0 && onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        monthlySavingsTarget: val,
      });
    }
    setIsEditingSavings(false);
  };

  // Active budget category cards computed dynamically from user categories
  const budgetCards = useMemo(() => {
    const expenseCategories = categories.filter((c) => c.type === 'expense');

    return expenseCategories.map((card) => {
      const limit = card.monthlyBudget || 0;
      const spent = card.spent !== undefined ? card.spent : 0;
      const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
      const left = Math.max(0, limit - spent);

      let badgeText = 'Sin gastos';
      let badgeIcon = <CheckCircle className="w-3 h-3 text-emerald-600" />;
      let badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      let pillClass = 'text-emerald-700 bg-emerald-100';
      let barClass = 'bg-emerald-600';

      if (limit === 0) {
        badgeText = 'Sin límite fijado';
        badgeIcon = <Layers className="w-3 h-3 text-neutral-500" />;
        badgeClass = 'text-neutral-600 bg-neutral-100 border-neutral-200';
        pillClass = 'text-neutral-600 bg-neutral-100';
        barClass = 'bg-indigo-500';
      } else if (percent >= 90) {
        badgeText = 'Límite casi alcanzado';
        badgeIcon = <Clock className="w-3 h-3 text-rose-600" />;
        badgeClass = 'text-rose-600 bg-rose-50 border-rose-200';
        pillClass = 'text-rose-700 bg-rose-100';
        barClass = 'bg-rose-600';
      } else if (percent >= 70) {
        badgeText = 'Consumo moderado';
        badgeIcon = <TrendingUp className="w-3 h-3 text-amber-600" />;
        badgeClass = 'text-amber-700 bg-amber-50 border-amber-200';
        pillClass = 'text-amber-700 bg-amber-100';
        barClass = 'bg-amber-500';
      } else if (percent > 0) {
        badgeText = 'En orden';
        badgeIcon = <CheckCircle className="w-3 h-3 text-emerald-600" />;
        badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        pillClass = 'text-emerald-700 bg-emerald-100';
        barClass = 'bg-emerald-500';
      }

      return {
        id: card.id,
        name: card.name,
        icon: card.icon,
        color: card.color || '#4F46E5',
        limit,
        spent,
        percent,
        left,
        badgeText,
        badgeIcon,
        badgeClass,
        pillClass,
        barClass,
      };
    });
  }, [categories]);

  // Alert check: find any category over 90%
  const highExpenseCategory = budgetCards.find((c) => c.limit > 0 && c.percent >= 90);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Hero Card: PRESUPUESTO MENSUAL TOTAL */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block tracking-wider uppercase">
                PRESUPUESTO MENSUAL
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewBudgetVal(String(totalLimit));
                  setIsEditingBudget(true);
                }}
                className="text-[11px] text-blue-100 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                title="Editar presupuesto mensual"
              >
                <Edit3 className="w-3 h-3" />
                <span>Editar límite</span>
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 font-sans">
              {formatCurrency(totalSpent, currencySymbol)}{' '}
              <span className="text-blue-200 text-lg sm:text-xl font-medium">
                / {formatCurrency(totalLimit, currencySymbol)}
              </span>
            </h2>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mt-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-300 to-white transition-all duration-500"
            style={{ width: `${Math.min(100, parseFloat(spentPercent))}%` }}
          />
        </div>

        {/* Bottom chips */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="bg-white/15 backdrop-blur-xs text-white text-xs px-3.5 py-1.5 rounded-full border border-white/20 font-medium">
            {spentPercent}% gastado este mes
          </div>
          <div className="bg-white/15 backdrop-blur-xs text-white text-xs px-3.5 py-1.5 rounded-full border border-white/20 font-medium">
            {formatCurrency(remaining, currencySymbol)} disponibles
          </div>
        </div>
      </div>

      {/* Edit Budget Total Modal */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full border border-neutral-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-neutral-900">
                Ajustar Presupuesto Total del Mes
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBudget} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Monto Máximo de Gasto ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={newBudgetVal}
                  onChange={(e) => setNewBudgetVal(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold font-mono rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Guardar Presupuesto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. META DE AHORRO MENSUAL CARD (Moved from Profile to Presupuestos as requested) */}
      <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-sm relative overflow-hidden space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                Objetivo Financiero
              </span>
              <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">
                Meta de Ahorro Mensual
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewSavingsVal(String(savingsTarget));
              setIsEditingSavings(true);
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Ajustar Meta</span>
          </button>
        </div>

        {/* Current Target vs Saved */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
            <span className="text-[11px] font-medium text-neutral-500 block">Meta mensual fijada</span>
            <span className="text-lg font-extrabold text-neutral-900 mt-0.5 block">
              {formatCurrency(savingsTarget, currencySymbol)}
            </span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-medium text-emerald-800 block">Ahorro neto actual</span>
            <span className="text-lg font-extrabold text-emerald-900 mt-0.5 block">
              {formatCurrency(Math.max(0, netSavings), currencySymbol)}
            </span>
          </div>
        </div>

        {/* Savings Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-600">Progreso de ahorro</span>
            <span className="font-bold text-indigo-600">{savingsProgressPercent}% alcanzado</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${savingsProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Edit Savings Target Modal */}
      {isEditingSavings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full border border-neutral-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-neutral-900">
                Ajustar Meta de Ahorro Mensual
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingSavings(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSavings} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Tu meta mensual a ahorrar ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="10"
                  step="25"
                  required
                  value={newSavingsVal}
                  onChange={(e) => setNewSavingsVal(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold font-mono rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Guardar Meta de Ahorro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Warning Alert Card */}
      {highExpenseCategory ? (
        <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-rose-950">
              ¡Cuidado con {highExpenseCategory.name}!
            </h4>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
              Has consumido el {highExpenseCategory.percent}% de tu límite en esta categoría con días restantes de ciclo.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
              {totalSpent === 0 ? '¡Presupuesto 100% disponible!' : '¡Tus límites están en orden!'}
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
              {totalSpent === 0
                ? 'No tienes gastos registrados este mes. Dispones del total asignado.'
                : 'Mantienes un ritmo de consumo financiero adecuado.'}
            </p>
          </div>
        </div>
      )}

      {/* 4. Header: Categorías Activas + Botón Crear Categoría */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            Categorías y Presupuestos
          </h3>
          <p className="text-[11px] text-neutral-500">
            Crea categorías personalizadas con íconos de Lucide Icons
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewLimit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* 5. Dynamic Category Cards with Lucide Icons */}
      <div className="space-y-3">
        {budgetCards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-100 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: card.color }}
                >
                  {renderCategoryIcon(card.icon, 'w-5 h-5 text-white')}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">
                    {card.name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {card.limit > 0
                      ? `Límite: ${formatCurrency(card.limit, currencySymbol)}`
                      : 'Sin límite establecido'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-neutral-900 block">
                  {formatCurrency(card.spent, currencySymbol)}
                </span>
                {card.limit > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${card.pillClass}`}
                  >
                    {card.percent}%
                  </span>
                )}
              </div>
            </div>

            {/* Individual Progress bar */}
            {card.limit > 0 && (
              <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${card.barClass}`}
                  style={{ width: `${card.percent}%` }}
                />
              </div>
            )}

            {/* Bottom Row: Restan + Badge */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="font-semibold text-neutral-700">
                {card.limit > 0
                  ? `Restan ${formatCurrency(card.left, currencySymbol)}`
                  : 'Gasto acumulado'}
              </span>

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${card.badgeClass}`}
              >
                {card.badgeIcon}
                {card.badgeText}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Sugerencias de Ahorro Sami */}
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center">
          <Lightbulb className="w-4 h-4" />
        </div>

        <div className="flex items-start gap-4 pr-8">
          <div className="w-15 h-15 rounded-2xl bg-white border border-emerald-200/80 p-1 shrink-0 shadow-xs flex items-center justify-center overflow-hidden">
            <img
              src={SAMI_LOGO_DATA_URL}
              alt="Sami Logo Oficial"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900">
              Sugerencia Sami: Optimiza tus pedidos
            </h4>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Cocinar 2 días más por semana en casa podría ahorrarte hasta $65 antes del cierre de ciclo mensual.
            </p>

            <button
              type="button"
              onClick={() => onApplySavingsChallenge(65, 'Optimiza tus pedidos a domicilio')}
              className="mt-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              Aplicar Reto de Ahorro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
