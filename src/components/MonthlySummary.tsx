import React from 'react';
import { MonthData, UserSettings } from '../types/finance';
import { formatCurrency } from '../utils/storage';
import { MONTH_NAMES_ES } from '../utils/constants';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface MonthlySummaryProps {
  currentMonthData: MonthData;
  availableMonths: { key: string; label: string }[];
  onSelectMonth: (monthKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
  isCurrentRealMonth: boolean;
  settings: UserSettings;
  onClearAllTransactions?: () => void;
  totalTransactionsCount?: number;
  onResetDemoData?: () => void;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  currentMonthData,
  availableMonths,
  onSelectMonth,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
  isCurrentRealMonth,
  settings,
  onClearAllTransactions,
  totalTransactionsCount = 0,
  onResetDemoData,
}) => {
  const { totalIncome, totalExpense, netSavings, savingsRate, label } = currentMonthData;
  const isSurplus = netSavings >= 0;
  const hasSavingsTarget = settings.monthlySavingsTarget > 0;
  const savingsTargetProgress = hasSavingsTarget
    ? Math.min((Math.max(netSavings, 0) / settings.monthlySavingsTarget) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Month Navigator Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900">
                {label}
              </h1>
              {isCurrentRealMonth && (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Mes en curso
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              {currentMonthData.transactionsCount} movimientos registrados
            </p>
          </div>
        </div>

        {/* Month Switching Controls */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          {totalTransactionsCount > 0 && onClearAllTransactions && (
            <button
              onClick={onClearAllTransactions}
              title="Vaciar todos los datos de prueba y comenzar de 0 en limpio"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar datos de prueba</span>
            </button>
          )}

          {totalTransactionsCount === 0 && onResetDemoData && (
            <button
              onClick={onResetDemoData}
              title="Cargar datos de prueba de ejemplo"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cargar datos de ejemplo</span>
            </button>
          )}

          {!isCurrentRealMonth && (
            <button
              onClick={onCurrentMonth}
              className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/70 rounded-md transition-colors whitespace-nowrap"
            >
              Ir a Mes Actual
            </button>
          )}

          <div className="flex items-center gap-1 border border-neutral-200 rounded-lg p-0.5">
            <button
              onClick={onPrevMonth}
              aria-label="Mes anterior"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Month Select dropdown */}
            <select
              value={currentMonthData.key}
              onChange={(e) => onSelectMonth(e.target.value)}
              className="text-xs font-medium text-neutral-800 bg-transparent py-1 px-1.5 focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>

            <button
              onClick={onNextMonth}
              aria-label="Mes siguiente"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards (4 cards in responsive grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ingresos Totales */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Ingresos Totales
            </span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 tabular-nums">
            {formatCurrency(totalIncome, settings.currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1">
            <span className="font-medium text-emerald-600">Entradas del periodo</span>
          </div>
        </div>

        {/* Card 2: Gastos Totales */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Gastos Totales
            </span>
            <span className="p-1.5 rounded-md bg-rose-50 text-rose-600">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 tabular-nums">
            {formatCurrency(totalExpense, settings.currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1">
            <span className="font-medium text-rose-600">Salidas acumuladas</span>
          </div>
        </div>

        {/* Card 3: Balance Neto */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Balance Neto
            </span>
            <span
              className={`p-1.5 rounded-md ${
                isSurplus ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
              isSurplus ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {formatCurrency(netSavings, settings.currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {isSurplus ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Superávit financiero
              </span>
            ) : (
              <span className="text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Déficit (gastos &gt; ingresos)
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Tasa de Ahorro */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Tasa de Ahorro
            </span>
            <span className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
              <PiggyBank className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 tabular-nums">
            {savingsRate.toFixed(1)}%
          </div>
          <div className="mt-2">
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  savingsRate >= 20 ? 'bg-emerald-500' : savingsRate > 0 ? 'bg-amber-500' : 'bg-neutral-300'
                }`}
                style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-neutral-400 mt-1.5 flex justify-between">
              <span>Meta rec.: 20%</span>
              {hasSavingsTarget && (
                <span className="text-neutral-600">
                  Obj: {formatCurrency(settings.monthlySavingsTarget, settings.currencySymbol)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
