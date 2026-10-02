import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, PaymentMethod, Category } from '../types/finance';
import { formatCurrency, formatDateES, getPaymentMethodLabel } from '../utils/storage';
import { PAYMENT_METHODS } from '../utils/constants';
import {
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  Copy,
  SlidersHorizontal,
  ChevronDown,
  Inbox,
  CreditCard,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currencySymbol: string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (transaction: Transaction) => void;
  onAddNew: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  currencySymbol,
  onEdit,
  onDelete,
  onDuplicate,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered and sorted list
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        // Category filter
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        // Method filter
        if (methodFilter !== 'all' && t.paymentMethod !== methodFilter) return false;
        // Search text
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchDesc = t.description.toLowerCase().includes(query);
          const matchCat = t.category.toLowerCase().includes(query);
          const matchNotes = (t.notes || '').toLowerCase().includes(query);
          if (!matchDesc && !matchCat && !matchNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, typeFilter, categoryFilter, methodFilter, searchTerm, sortBy]);

  // Subtotals
  const totalIncomeFiltered = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenseFiltered = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Map category to color
  const categoryColorMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.name, c.color));
    return map;
  }, [categories]);

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeletingId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden transition-all">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-neutral-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 tracking-tight">
              Movimientos del Periodo
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {filteredTransactions.length} de {transactions.length} registros listados
            </p>
          </div>

          {/* Quick Filter Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                typeFilter === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                typeFilter === 'expense'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-neutral-600 hover:text-rose-700'
              }`}
            >
              Solo Gastos
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-neutral-600 hover:text-emerald-700'
              }`}
            >
              Solo Ingresos
            </button>
          </div>
        </div>

        {/* Search and Secondary Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descripción, categoría, notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none bg-white transition-colors cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none bg-white transition-colors cursor-pointer"
            >
              <option value="all">Todos los métodos</option>
              {PAYMENT_METHODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none bg-white transition-colors cursor-pointer"
            >
              <option value="date_desc">Más recientes</option>
              <option value="date_asc">Más antiguos</option>
              <option value="amount_desc">Monto mayor</option>
              <option value="amount_asc">Monto menor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table / Empty State */}
      {filteredTransactions.length === 0 ? (
        <div className="py-14 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-neutral-800">
            No se encontraron movimientos
          </h4>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchTerm || categoryFilter !== 'all' || methodFilter !== 'all'
              ? 'Prueba modificando tus filtros de búsqueda para ver más resultados.'
              : 'Aún no has registrado ingresos o gastos para este periodo.'}
          </p>
          <button
            onClick={onAddNew}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
          >
            + Registrar primer movimiento
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-32">Fecha</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4 w-44">Categoría</th>
                <th className="py-3 px-4 w-36">Método</th>
                <th className="py-3 px-4 w-32 text-right">Monto</th>
                <th className="py-3 px-4 w-28 text-center no-print">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredTransactions.map((t) => {
                const isIncome = t.type === 'income';
                const catColor = categoryColorMap.get(t.category) || '#94A3B8';

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-neutral-50/70 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-neutral-600 tabular-nums whitespace-nowrap">
                      {formatDateES(t.date)}
                    </td>

                    {/* Description & optional notes */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-900 line-clamp-1">
                        {t.description}
                      </div>
                      {t.notes && (
                        <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                          {t.notes}
                        </div>
                      )}
                    </td>

                    {/* Category (unboxed text with colored indicator dot as per Zero-Pill) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: catColor }}
                        />
                        <span className="text-neutral-700 font-medium truncate max-w-[150px]">
                          {t.category}
                        </span>
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                      {getPaymentMethodLabel(t.paymentMethod)}
                    </td>

                    {/* Amount */}
                    <td
                      className={`py-3 px-4 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(t.amount, currencySymbol)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center no-print whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onDuplicate(t)}
                          title="Duplicar movimiento"
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(t)}
                          title="Editar movimiento"
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(t.id)}
                          title="Eliminar movimiento"
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 max-w-sm w-full shadow-lg">
            <h4 className="text-sm font-semibold text-neutral-900 mb-1">
              ¿Eliminar este movimiento?
            </h4>
            <p className="text-xs text-neutral-500 mb-4">
              Esta acción eliminará el registro de forma permanente de tu almacenamiento local.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(deletingId)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
