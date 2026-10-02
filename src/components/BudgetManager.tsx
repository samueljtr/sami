import React, { useState } from 'react';
import { Category, Transaction, UserSettings } from '../types/finance';
import { formatCurrency } from '../utils/storage';
import { AVAILABLE_CURRENCIES } from '../utils/constants';
import {
  Target,
  PiggyBank,
  CheckCircle,
  AlertTriangle,
  Sliders,
  DollarSign,
  User,
  Save,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface BudgetManagerProps {
  categories: Category[];
  currentMonthTransactions: Transaction[];
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onUpdateCategoryBudget: (categoryId: string, newBudget: number) => void;
  onResetDefaults: () => void;
  onClearAllTransactions?: () => void;
  currencySymbol: string;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  categories,
  currentMonthTransactions,
  settings,
  onUpdateSettings,
  onUpdateCategoryBudget,
  onResetDefaults,
  onClearAllTransactions,
  currencySymbol,
}) => {
  const [personName, setPersonName] = useState(settings.personName);
  const [currency, setCurrency] = useState(settings.currency);
  const [savingsTarget, setSavingsTarget] = useState(settings.monthlySavingsTarget.toString());
  const [savedFeedback, setSavedFeedback] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Compute spent amount per category for the current month
  const spentPerCategory = new Map<string, number>();
  currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      spentPerCategory.set(t.category, (spentPerCategory.get(t.category) || 0) + t.amount);
    });

  const totalBudgetCeiling = expenseCategories.reduce(
    (sum, c) => sum + (c.monthlyBudget || 0),
    0
  );

  const totalSpent = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const currObj = AVAILABLE_CURRENCIES.find((c) => c.code === currency);
    const newSettings: UserSettings = {
      ...settings,
      personName: personName.trim() || 'Josué',
      currency,
      currencySymbol: currObj ? currObj.symbol : '$',
      monthlySavingsTarget: parseFloat(savingsTarget) || 0,
    };
    onUpdateSettings(newSettings);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Global Budget Health */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Límites de Presupuesto Mensual
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Controla y asigna límites máximos de gasto por categoría para mantener el orden de tus finanzas
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-neutral-500 uppercase tracking-wider block">
              Gasto Total vs Límite Total
            </span>
            <span className="text-lg font-bold font-mono text-neutral-900 tabular-nums">
              {formatCurrency(totalSpent, currencySymbol)}{' '}
              <span className="text-neutral-400 font-normal text-sm">
                / {formatCurrency(totalBudgetCeiling, currencySymbol)}
              </span>
            </span>
          </div>
        </div>

        {/* Categories Budget Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          {expenseCategories.map((cat) => {
            const spent = spentPerCategory.get(cat.name) || 0;
            const budget = cat.monthlyBudget || 0;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            const remaining = budget - spent;
            const isOverBudget = remaining < 0;
            const isWarning = percentage >= 80 && !isOverBudget;

            return (
              <div
                key={cat.id}
                className="bg-neutral-50/70 border border-neutral-200/80 rounded-xl p-4 transition-all hover:bg-neutral-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <h4 className="text-xs font-semibold text-neutral-900 truncate max-w-[160px]">
                      {cat.name}
                    </h4>
                  </div>
                  {isOverBudget ? (
                    <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Excedido
                    </span>
                  ) : isWarning ? (
                    <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                      Alerta &gt;80%
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-600">
                      En orden
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                    {formatCurrency(spent, currencySymbol)}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-neutral-400 font-mono">límite:</span>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={budget || ''}
                      onChange={(e) =>
                        onUpdateCategoryBudget(cat.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-0.5 text-xs font-mono font-medium rounded border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none text-right tabular-nums bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOverBudget
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2">
                  <span>{percentage.toFixed(0)}% utilizado</span>
                  <span className={isOverBudget ? 'text-rose-600 font-medium' : 'text-neutral-600'}>
                    {isOverBudget
                      ? `Excedido por ${formatCurrency(Math.abs(remaining), currencySymbol)}`
                      : `Disponible: ${formatCurrency(remaining, currencySymbol)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings & Customization Card */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
        <h3 className="text-base font-semibold text-neutral-900 tracking-tight flex items-center gap-2 mb-1">
          <Sliders className="w-5 h-5 text-neutral-700" />
          Ajustes de Moneda y Perfil Financiero
        </h3>
        <p className="text-xs text-neutral-500 mb-4">
          Configura tus preferencias que se almacenan automáticamente en tu navegador
        </p>

        <form onSubmit={handleSavePreferences} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Person Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Tu Nombre / Titular
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Ej. Josué"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Moneda Principal
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none bg-white cursor-pointer"
              >
                {AVAILABLE_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Savings Target */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Meta Mensual de Ahorro
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(e.target.value)}
                  placeholder="500"
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono font-medium rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar Preferencias
            </button>

            {savedFeedback && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Guardado correctamente
              </span>
            )}

            {onClearAllTransactions && (
              <button
                type="button"
                onClick={onClearAllTransactions}
                className="ml-auto text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Vaciar datos de prueba (Empezar de 0)
              </button>
            )}

            <button
              type="button"
              onClick={onResetDefaults}
              className={`${onClearAllTransactions ? '' : 'ml-auto'} text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer datos demo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
