import React, { useState } from 'react';
import { Category, TransactionType } from '../types/finance';
import { X, Plus, Trash2, ArrowDownRight, ArrowUpRight, Palette } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  currencySymbol: string;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#14B8A6',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  '#64748B', '#0F172A',
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  currencySymbol,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor escribe un nombre para la categoría');
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.type === type)) {
      setError('Ya existe una categoría con ese nombre');
      return;
    }

    onAddCategory({
      name: name.trim(),
      type,
      color,
      icon: 'Tag',
      monthlyBudget: type === 'expense' ? parseFloat(budget) || 0 : undefined,
    });

    setName('');
    setBudget('');
    setError('');
  };

  const expenseCats = categories.filter((c) => c.type === 'expense');
  const incomeCats = categories.filter((c) => c.type === 'income');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Gestión de Categorías
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Personaliza tus rubros de gastos e ingresos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Add Category Form */}
          <form onSubmit={handleAdd} className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-3">
            <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              Nueva Categoría
            </h4>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                {error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  type === 'income'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Ingreso
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Nombre de categoría..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none bg-white"
              />

              {type === 'expense' && (
                <input
                  type="number"
                  min="0"
                  step="10"
                  placeholder={`Presupuesto (${currencySymbol})`}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none bg-white tabular-nums"
                />
              )}
            </div>

            {/* Color Swatches */}
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Color representativo:</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-neutral-900' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear Categoría
            </button>
          </form>

          {/* List of Existing Categories */}
          <div className="space-y-4">
            <div>
              <h5 className="text-xs font-semibold text-neutral-600 mb-2">
                Categorías de Gastos ({expenseCats.length})
              </h5>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {expenseCats.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 text-xs border border-neutral-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-medium text-neutral-800">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {cat.monthlyBudget ? (
                        <span className="font-mono text-neutral-500 text-[11px]">
                          Límite: {currencySymbol} {cat.monthlyBudget}
                        </span>
                      ) : null}
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-neutral-600 mb-2">
                Categorías de Ingresos ({incomeCats.length})
              </h5>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {incomeCats.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 text-xs border border-neutral-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-medium text-neutral-800">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
