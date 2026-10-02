import React, { useState } from 'react';
import { MonthData, Transaction } from '../types/finance';
import { formatCurrency } from '../utils/storage';
import { TrendingUp, PieChart, BarChart3, LineChart, Info } from 'lucide-react';

interface FinanceChartsProps {
  monthlyData: MonthData[];
  selectedMonthKey: string;
  onSelectMonth: (monthKey: string) => void;
  categoryExpenses: { name: string; amount: number; percentage: number; color: string; count: number }[];
  currentMonthTransactions: Transaction[];
  currencySymbol: string;
  daysInMonth: number;
}

export const FinanceCharts: React.FC<FinanceChartsProps> = ({
  monthlyData,
  selectedMonthKey,
  onSelectMonth,
  categoryExpenses,
  currentMonthTransactions,
  currencySymbol,
  daysInMonth,
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'categories' | 'daily'>('comparison');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Maximum value for bar chart scaling
  const maxBarValue = Math.max(
    ...monthlyData.map((d) => Math.max(d.totalIncome, d.totalExpense)),
    100
  );

  // Daily points for the line/area chart
  const dailyBreakdown = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayStr = String(day).padStart(2, '0');
    const dayTransactions = currentMonthTransactions.filter((t) => {
      const parts = t.date.split('-');
      return parts[2] === dayStr;
    });

    const income = dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      day,
      income,
      expense,
      count: dayTransactions.length,
    };
  });

  // Calculate cumulative for the month
  let runningIncome = 0;
  let runningExpense = 0;
  const cumulativeData = dailyBreakdown.map((d) => {
    runningIncome += d.income;
    runningExpense += d.expense;
    return {
      ...d,
      cumIncome: runningIncome,
      cumExpense: runningExpense,
    };
  });

  const maxCumulative = Math.max(
    ...cumulativeData.map((d) => Math.max(d.cumIncome, d.cumExpense)),
    50
  );

  // Total expenses for donut
  const totalExpenseSum = categoryExpenses.reduce((sum, c) => sum + c.amount, 0);

  // Calculate donut slices (SVG arcs)
  const donutRadius = 70;
  const donutInnerRadius = 45;
  const center = 100;

  let currentAngle = -Math.PI / 2;
  const slices = categoryExpenses.map((cat, idx) => {
    const fraction = totalExpenseSum > 0 ? cat.amount / totalExpenseSum : 0;
    const angle = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = center + donutRadius * Math.cos(startAngle);
    const y1 = center + donutRadius * Math.sin(startAngle);
    const x2 = center + donutRadius * Math.cos(endAngle);
    const y2 = center + donutRadius * Math.sin(endAngle);

    const ix1 = center + donutInnerRadius * Math.cos(endAngle);
    const iy1 = center + donutInnerRadius * Math.sin(endAngle);
    const ix2 = center + donutInnerRadius * Math.cos(startAngle);
    const iy2 = center + donutInnerRadius * Math.sin(startAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${donutRadius} ${donutRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${donutInnerRadius} ${donutInnerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');

    return {
      ...cat,
      index: idx,
      path: pathData,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs p-5 md:p-6 mb-8 transition-all">
      {/* Header and Visualizer Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neutral-700" />
            Análisis Gráfico de Finanzas
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Comportamiento comparativo, distribución por categorías y flujo temporal
          </p>
        </div>

        {/* View mode segmented switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Comparativa Mensual
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Por Categorías
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            Flujo Diario
          </button>
        </div>
      </div>

      {/* TAB 1: Comparativa Mensual (Income vs Expense Bars) */}
      {activeTab === 'comparison' && (
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-4 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
                <span>Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block"></span>
                <span>Gastos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
                <span>Mes Activo</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400">
              Haz clic en cualquier mes para explorar su detalle
            </p>
          </div>

          {/* Bar Chart Canvas */}
          <div className="relative h-64 w-full pt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
              {[1, 0.75, 0.5, 0.25, 0].map((step, i) => (
                <div key={i} className="flex items-center w-full">
                  <span className="text-[10px] text-neutral-400 font-mono w-16 text-right pr-3 tabular-nums">
                    {formatCurrency(maxBarValue * step, currencySymbol)}
                  </span>
                  <div className="flex-1 border-b border-neutral-100"></div>
                </div>
              ))}
            </div>

            <div className="relative h-full ml-16 flex items-end justify-around gap-2 sm:gap-4 pb-8 z-10">
              {monthlyData.map((data, idx) => {
                const isSelected = data.key === selectedMonthKey;
                const incomeHeight = maxBarValue > 0 ? (data.totalIncome / maxBarValue) * 100 : 0;
                const expenseHeight = maxBarValue > 0 ? (data.totalExpense / maxBarValue) * 100 : 0;
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={data.key}
                    onClick={() => onSelectMonth(data.key)}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-16 bg-neutral-900 text-white p-2 rounded-lg text-xs shadow-lg z-30 pointer-events-none whitespace-nowrap transition-opacity">
                        <div className="font-semibold">{data.label}</div>
                        <div className="text-emerald-400">
                          Ingresos: {formatCurrency(data.totalIncome, currencySymbol)}
                        </div>
                        <div className="text-rose-400">
                          Gastos: {formatCurrency(data.totalExpense, currencySymbol)}
                        </div>
                        <div className="text-neutral-300 font-mono">
                          Balance: {formatCurrency(data.netSavings, currencySymbol)}
                        </div>
                      </div>
                    )}

                    {/* Bars pair */}
                    <div className="flex items-end justify-center gap-1 sm:gap-1.5 w-full max-w-[50px] h-full pb-1">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${Math.max(incomeHeight, 2)}%` }}
                        className={`w-1/2 rounded-t-sm transition-all duration-300 ${
                          isSelected
                            ? 'bg-emerald-500 shadow-sm'
                            : 'bg-emerald-400/80 group-hover:bg-emerald-500'
                        }`}
                      />
                      {/* Expense Bar */}
                      <div
                        style={{ height: `${Math.max(expenseHeight, 2)}%` }}
                        className={`w-1/2 rounded-t-sm transition-all duration-300 ${
                          isSelected
                            ? 'bg-rose-500 shadow-sm'
                            : 'bg-rose-400/80 group-hover:bg-rose-500'
                        }`}
                      />
                    </div>

                    {/* X-axis Label */}
                    <div
                      className={`text-[11px] font-medium mt-2 truncate max-w-full transition-colors ${
                        isSelected
                          ? 'text-neutral-900 font-semibold underline underline-offset-4 decoration-2 decoration-neutral-900'
                          : 'text-neutral-500 group-hover:text-neutral-900'
                      }`}
                    >
                      {data.label.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Por Categorías (Donut + Detailed breakdown) */}
      {activeTab === 'categories' && (
        <div className="pt-6">
          {categoryExpenses.length === 0 ? (
            <div className="py-12 text-center">
              <Info className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-neutral-700">Sin gastos registrados este mes</p>
              <p className="text-xs text-neutral-400 mt-1">
                Registra un gasto para ver el gráfico de distribución por categorías
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Donut graphic */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-52 h-52">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {slices.map((slice) => {
                      const isHovered = hoveredSliceIndex === slice.index;
                      return (
                        <path
                          key={slice.name}
                          d={slice.path}
                          fill={slice.color}
                          stroke="#ffffff"
                          strokeWidth="2"
                          onMouseEnter={() => setHoveredSliceIndex(slice.index)}
                          onMouseLeave={() => setHoveredSliceIndex(null)}
                          className="cursor-pointer transition-transform duration-200"
                          style={{
                            transformOrigin: '100px 100px',
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                            filter: isHovered ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' : 'none',
                          }}
                        />
                      );
                    })}
                  </svg>

                  {/* Donut Center Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                    {hoveredSliceIndex !== null && slices[hoveredSliceIndex] ? (
                      <>
                        <span className="text-[11px] font-medium text-neutral-500 truncate max-w-[120px]">
                          {slices[hoveredSliceIndex].name}
                        </span>
                        <span className="text-sm font-semibold font-mono text-neutral-900 tabular-nums">
                          {formatCurrency(slices[hoveredSliceIndex].amount, currencySymbol)}
                        </span>
                        <span className="text-xs font-mono text-neutral-600 font-medium tabular-nums">
                          {slices[hoveredSliceIndex].percentage.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                          Total Gastos
                        </span>
                        <span className="text-base font-bold font-mono text-neutral-900 tabular-nums">
                          {formatCurrency(totalExpenseSum, currencySymbol)}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {categoryExpenses.length} categorías
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Breakdown Progress List */}
              <div className="md:col-span-7 space-y-3">
                {categoryExpenses.map((cat, idx) => {
                  const isHovered = hoveredSliceIndex === idx;
                  return (
                    <div
                      key={cat.name}
                      onMouseEnter={() => setHoveredSliceIndex(idx)}
                      onMouseLeave={() => setHoveredSliceIndex(null)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isHovered ? 'bg-neutral-50' : 'hover:bg-neutral-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-xs shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-medium text-neutral-800">{cat.name}</span>
                          <span className="text-neutral-400 text-[11px]">
                            ({cat.count} mov.)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-neutral-500 tabular-nums">
                            {cat.percentage.toFixed(1)}%
                          </span>
                          <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                            {formatCurrency(cat.amount, currencySymbol)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(cat.percentage, 100)}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Flujo Diario (Cumulative Flow Area) */}
      {activeTab === 'daily' && (
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-4 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span>Ingreso Acumulado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span>Gasto Acumulado</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400">
              Evolución acumulativa día a día a lo largo del mes
            </p>
          </div>

          <div className="relative h-64 w-full pt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
              {[1, 0.75, 0.5, 0.25, 0].map((step, i) => (
                <div key={i} className="flex items-center w-full">
                  <span className="text-[10px] text-neutral-400 font-mono w-16 text-right pr-3 tabular-nums">
                    {formatCurrency(maxCumulative * step, currencySymbol)}
                  </span>
                  <div className="flex-1 border-b border-neutral-100"></div>
                </div>
              ))}
            </div>

            {/* Daily Steps */}
            <div className="relative h-full ml-16 flex items-end justify-between pb-8 z-10">
              {cumulativeData.map((d, idx) => {
                const incHeight = maxCumulative > 0 ? (d.cumIncome / maxCumulative) * 100 : 0;
                const expHeight = maxCumulative > 0 ? (d.cumExpense / maxCumulative) * 100 : 0;
                const isHovered = hoveredDayIndex === idx;

                return (
                  <div
                    key={d.day}
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    onMouseLeave={() => setHoveredDayIndex(null)}
                    className="relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                  >
                    {isHovered && (
                      <div className="absolute -top-16 bg-neutral-900 text-white p-2 rounded-lg text-xs shadow-lg z-30 pointer-events-none whitespace-nowrap">
                        <div className="font-semibold">Día {d.day}</div>
                        <div className="text-emerald-400">
                          Ingresos ac.: {formatCurrency(d.cumIncome, currencySymbol)}
                        </div>
                        <div className="text-rose-400">
                          Gastos ac.: {formatCurrency(d.cumExpense, currencySymbol)}
                        </div>
                        {d.expense > 0 && (
                          <div className="text-neutral-300 text-[10px]">
                            Gastado hoy: {formatCurrency(d.expense, currencySymbol)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step lines indicator */}
                    <div className="w-full flex items-end justify-center relative h-full">
                      {/* Income point */}
                      <div
                        style={{ bottom: `${incHeight}%` }}
                        className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500 -translate-x-0.5"
                      />
                      {/* Expense point */}
                      <div
                        style={{ bottom: `${expHeight}%` }}
                        className="absolute w-1.5 h-1.5 rounded-full bg-rose-500 translate-x-0.5"
                      />
                    </div>

                    {/* Day label every few days */}
                    <div className="text-[9px] font-mono text-neutral-400 mt-2">
                      {d.day === 1 || d.day % 5 === 0 || d.day === daysInMonth ? d.day : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
