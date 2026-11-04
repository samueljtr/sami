import React, { useState, useMemo } from 'react';
import { Transaction, UserSettings } from '../types/finance';
import { formatCurrency } from '../utils/storage';
import {
  Search,
  Calendar,
  Wallet,
  Utensils,
  Zap,
  Plane,
  ShoppingCart,
  Film,
  Home,
  Tag,
  ArrowUpDown,
} from 'lucide-react';
import { renderCategoryIcon } from '../utils/categoryIcons';
import { Category } from '../types/finance';

interface MovimientosViewProps {
  transactions: Transaction[];
  categories?: Category[];
  settings: UserSettings;
  onOpenNewExpense: () => void;
  onSelectTransaction?: (t: Transaction) => void;
}

export const MovimientosView: React.FC<MovimientosViewProps> = ({
  transactions,
  categories = [],
  settings,
  onOpenNewExpense,
  onSelectTransaction,
}) => {
  const currencySymbol = settings.currencySymbol || '€';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Filter chips
  const categoryFilters = [
    { id: 'todos', label: 'Todos', icon: null },
    { id: 'comida', label: '🍔 Comida', icon: null },
    { id: 'viajes', label: '✈️ Viajes', icon: null },
    { id: 'hogar', label: '🏠 Hogar', icon: null },
    { id: 'servicios', label: '⚡ Servicios', icon: null },
    { id: 'ocio', label: '🎬 Ocio', icon: null },
  ];

  // Helper to get category icon and color
  const getCategoryIconDetails = (catName: string, desc: string) => {
    const matching = categories.find(
      (c) => c.name.toLowerCase() === catName.toLowerCase()
    );
    if (matching) {
      return {
        icon: renderCategoryIcon(matching.icon, 'w-5 h-5 text-white'),
        bg: '',
        bgColor: matching.color || '#4F46E5',
        isCustom: true,
      };
    }

    const text = (catName + ' ' + desc).toLowerCase();
    if (text.includes('comida') || text.includes('tapa') || text.includes('restaurante') || text.includes('pizza') || text.includes('aliment')) {
      return {
        icon: <Utensils className="w-5 h-5 text-orange-600" />,
        bg: 'bg-orange-100/80',
      };
    }
    if (text.includes('luz') || text.includes('servicio') || text.includes('electric') || text.includes('factura')) {
      return {
        icon: <Zap className="w-5 h-5 text-amber-600" />,
        bg: 'bg-amber-100/80',
      };
    }
    if (text.includes('vuelo') || text.includes('viaje') || text.includes('roma') || text.includes('avion')) {
      return {
        icon: <Plane className="w-5 h-5 text-sky-600" />,
        bg: 'bg-sky-100/80',
      };
    }
    if (text.includes('supermercado') || text.includes('compra') || text.includes('carrefour') || text.includes('mercado')) {
      return {
        icon: <ShoppingCart className="w-5 h-5 text-emerald-600" />,
        bg: 'bg-emerald-100/80',
      };
    }
    if (text.includes('cine') || text.includes('ocio') || text.includes('pelicula') || text.includes('entretenimiento')) {
      return {
        icon: <Film className="w-5 h-5 text-purple-600" />,
        bg: 'bg-purple-100/80',
      };
    }
    if (text.includes('vivienda') || text.includes('hogar') || text.includes('arriendo')) {
      return {
        icon: <Home className="w-5 h-5 text-blue-600" />,
        bg: 'bg-blue-100/80',
      };
    }
    return {
      icon: <Tag className="w-5 h-5 text-neutral-600" />,
      bg: 'bg-neutral-100',
    };
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.payer && t.payer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.friendName && t.friendName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (selectedCategory === 'todos') return true;
      const combined = (t.category + ' ' + t.description).toLowerCase();
      if (selectedCategory === 'comida') return combined.includes('comida') || combined.includes('restaurante') || combined.includes('tapa');
      if (selectedCategory === 'viajes') return combined.includes('viaje') || combined.includes('vuelo') || combined.includes('transporte');
      if (selectedCategory === 'hogar') return combined.includes('hogar') || combined.includes('vivienda');
      if (selectedCategory === 'servicios') return combined.includes('luz') || combined.includes('servicio') || combined.includes('factura');
      if (selectedCategory === 'ocio') return combined.includes('ocio') || combined.includes('cine') || combined.includes('entretenimiento');
      return true;
    });
  }, [transactions, searchQuery, selectedCategory]);

  // Group transactions into HOY, AYER, and Other Dates
  const groupedTransactions = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const groups: { [title: string]: Transaction[] } = {};

    filteredTransactions.forEach((t) => {
      let groupTitle = '14 DE OCTUBRE';
      if (t.date === todayStr) {
        groupTitle = 'HOY';
      } else if (t.date === yesterdayStr) {
        groupTitle = 'AYER';
      } else {
        try {
          const parts = t.date.split('-');
          if (parts.length === 3) {
            const dayNum = parseInt(parts[2], 10);
            groupTitle = `${dayNum} DE OCTUBRE`;
          }
        } catch {
          groupTitle = 'ANTERIORES';
        }
      }

      if (!groups[groupTitle]) {
        groups[groupTitle] = [];
      }
      groups[groupTitle].push(t);
    });

    return groups;
  }, [filteredTransactions]);

  const netMonthlyBalance = useMemo(() => {
    return transactions.reduce(
      (acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount),
      0
    );
  }, [transactions]);

  const pendingCollectionCount = useMemo(() => {
    return transactions.filter((t) => t.splitStatus === 'owe_me').length;
  }, [transactions]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Search Bar & Calendar Button */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 bg-white rounded-2xl border border-neutral-200/90 py-2.5 px-3.5 flex items-center gap-2.5 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar movimientos, amigos o cc..."
            className="w-full bg-transparent text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none font-sans"
          />
        </div>

        <button
          type="button"
          onClick={onOpenNewExpense}
          title="Filtro de fecha o añadir"
          className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Horizontally scrollable Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categoryFilters.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 3. Blue Banner Card: Balance del mes */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              Balance del mes
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              {pendingCollectionCount} {pendingCollectionCount === 1 ? 'transacción pendiente' : 'transacciones pendientes'} de cobro
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black tracking-tight block">
            {netMonthlyBalance >= 0 ? '+' : ''}{formatCurrency(netMonthlyBalance, currencySymbol)}
          </span>
        </div>
      </div>

      {/* 4. Grouped Transactions by Date */}
      <div className="space-y-4 pt-1">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-neutral-100 shadow-xs">
            <p className="text-sm font-semibold text-neutral-700">
              No se encontraron movimientos
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Prueba cambiando la búsqueda o añade un nuevo gasto
            </p>
            <button
              type="button"
              onClick={onOpenNewExpense}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
            >
              + Agregar Gasto
            </button>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-800 tracking-wider uppercase px-1">
                {dateLabel}
              </h4>

              <div className="space-y-2">
                {items.map((t) => {
                  const iconDetails = getCategoryIconDetails(t.category, t.description);
                  const isPositive = t.splitStatus === 'owe_me';
                  const isLiquidated = t.splitStatus === 'settled';

                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTransaction?.(t)}
                      className="bg-white rounded-2xl p-3.5 border border-neutral-100 shadow-xs flex items-center justify-between gap-3 hover:border-neutral-200 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl ${iconDetails.bg || ''} flex items-center justify-center shrink-0 shadow-xs`}
                          style={iconDetails.bgColor ? { backgroundColor: iconDetails.bgColor } : undefined}
                        >
                          {iconDetails.icon}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                            {t.description}
                          </h5>
                          <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                            Pagado por {t.payer || 'Tú'} • {t.splitNote || t.category}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-neutral-900 block">
                          {t.amount.toFixed(2)} {currencySymbol}
                        </span>

                        {isLiquidated ? (
                          <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            Liquidado
                          </span>
                        ) : isPositive ? (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            +{t.splitAmount?.toFixed(2) || (t.amount * 0.75).toFixed(2)} {currencySymbol}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            -{t.splitAmount?.toFixed(2) || (t.amount * 0.33).toFixed(2)} {currencySymbol}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
