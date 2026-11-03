import React, { useMemo } from 'react';
import { Category, MonthData, UserSettings } from '../types/finance';
import { formatCurrency } from '../utils/storage';
import {
  Wallet,
  AlertTriangle,
  Plus,
  Utensils,
  ShoppingCart,
  Car,
  Film,
  PiggyBank,
  Lightbulb,
  Clock,
  TrendingUp,
  CheckCircle,
  Scale,
  Sparkles,
} from 'lucide-react';
import { SAMI_LOGO_DATA_URL } from '../constants/logo';

interface PresupuestosViewProps {
  categories: Category[];
  currentMonthData: MonthData;
  settings: UserSettings;
  onOpenNewLimit: () => void;
  onApplySavingsChallenge: (amount: number, title: string) => void;
}

export const PresupuestosView: React.FC<PresupuestosViewProps> = ({
  categories,
  currentMonthData,
  settings,
  onOpenNewLimit,
  onApplySavingsChallenge,
}) => {
  const currencySymbol = settings.currencySymbol || '$';
  const totalLimit = settings.monthlyBudgetTotal || 2000;
  const totalSpent = currentMonthData.totalExpense;
  const remaining = Math.max(0, totalLimit - totalSpent);
  const spentPercent = totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1) : '0.0';

  // Active budget category cards computed dynamically
  const budgetCards = useMemo(() => {
    const budgeted = categories.filter(
      (c) => c.type === 'expense' && c.monthlyBudget && c.monthlyBudget > 0
    );

    const activeList =
      budgeted.length > 0
        ? budgeted
        : [
            { id: 'cat_alim', name: 'Comida fuera', monthlyBudget: 350, spent: 0 },
            { id: 'cat_super', name: 'Supermercado', monthlyBudget: 600, spent: 0 },
            { id: 'cat_trans', name: 'Transporte', monthlyBudget: 250, spent: 0 },
            { id: 'cat_ocio', name: 'Ocio y Entretenimiento', monthlyBudget: 200, spent: 0 },
          ];

    return activeList.map((card) => {
      const limit = card.monthlyBudget || 300;
      const spent = card.spent !== undefined ? card.spent : 0;
      const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
      const left = Math.max(0, limit - spent);

      let badgeText = 'Sin gastos';
      let badgeIcon = <CheckCircle className="w-3 h-3 text-emerald-600" />;
      let badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      let pillClass = 'text-emerald-700 bg-emerald-100';
      let barClass = 'bg-emerald-600';
      let icon = <Utensils className="w-5 h-5 text-rose-600" />;
      let iconBg = 'bg-rose-100/80';

      const n = card.name.toLowerCase();
      if (n.includes('comida') || n.includes('restaurante')) {
        icon = <Utensils className="w-5 h-5 text-rose-600" />;
        iconBg = 'bg-rose-100/80';
      } else if (n.includes('supermercado') || n.includes('compra')) {
        icon = <ShoppingCart className="w-5 h-5 text-emerald-600" />;
        iconBg = 'bg-emerald-100/80';
      } else if (n.includes('transporte') || n.includes('auto') || n.includes('vuelo')) {
        icon = <Car className="w-5 h-5 text-sky-600" />;
        iconBg = 'bg-sky-100/80';
      } else if (n.includes('ocio') || n.includes('cine') || n.includes('entretenimiento')) {
        icon = <Film className="w-5 h-5 text-purple-600" />;
        iconBg = 'bg-purple-100/80';
      }

      if (percent >= 80) {
        badgeText = 'Quedan 10 días';
        badgeIcon = <Clock className="w-3 h-3 text-rose-600" />;
        badgeClass = 'text-rose-600 bg-rose-50 border-rose-200';
        pillClass = 'text-rose-700 bg-rose-100';
        barClass = 'bg-rose-600';
      } else if (percent >= 60) {
        badgeText = 'Buen ritmo';
        badgeIcon = <TrendingUp className="w-3 h-3 text-emerald-600" />;
        badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        pillClass = 'text-emerald-700 bg-emerald-100';
        barClass = 'bg-emerald-600';
      } else if (percent > 0) {
        badgeText = 'En orden';
        badgeIcon = <CheckCircle className="w-3 h-3 text-sky-600" />;
        badgeClass = 'text-sky-700 bg-sky-50 border-sky-200';
        pillClass = 'text-sky-700 bg-sky-100';
        barClass = 'bg-sky-500';
      }

      return {
        id: card.id,
        name: card.name,
        limit,
        spent,
        percent,
        left,
        badgeText,
        badgeIcon,
        badgeClass,
        pillClass,
        barClass,
        icon,
        iconBg,
      };
    });
  }, [categories]);

  // Alert check: find any category over 80%
  const highExpenseCategory = budgetCards.find((c) => c.percent >= 80);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Hero Card: PRESUPUESTO MENSUAL */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block tracking-wider uppercase">
              PRESUPUESTO MENSUAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 font-sans">
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
            {formatCurrency(remaining, currencySymbol)} restantes
          </div>
        </div>
      </div>

      {/* 2. Warning Alert Card (Shown if threshold reached, or celebratory card if empty) */}
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

      {/* 3. Header: Categorías Activas + Nuevo Límite */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-base font-bold text-neutral-900 tracking-tight">
          Categorías Activas
        </h3>

        <button
          type="button"
          onClick={onOpenNewLimit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Límite</span>
        </button>
      </div>

      {/* 4. Active Category Cards */}
      <div className="space-y-3">
        {budgetCards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-100 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
                >
                  {card.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">
                    {card.name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Límite: {formatCurrency(card.limit, currencySymbol)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-neutral-900 block">
                  {formatCurrency(card.spent, currencySymbol)}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${card.pillClass}`}
                >
                  {card.percent}%
                </span>
              </div>
            </div>

            {/* Individual Progress bar */}
            <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${card.barClass}`}
                style={{ width: `${card.percent}%` }}
              />
            </div>

            {/* Bottom Row: Restan + Badge */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="font-semibold text-neutral-700">
                Restan {formatCurrency(card.left, currencySymbol)}
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

      {/* 5. Sugerencias de Ahorro Sami */}
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
