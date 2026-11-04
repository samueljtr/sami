import React, { useState } from 'react';
import { Category, TransactionType } from '../types/finance';
import {
  X,
  Plus,
  Trash2,
  Palette,
  Search,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import {
  CATEGORY_ICON_CATALOG,
  getCategoryLucideIcon,
  renderCategoryIcon,
} from '../utils/categoryIcons';

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
  const [selectedIconName, setSelectedIconName] = useState('Utensils');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');

  // Icon picker search and group filter
  const [iconSearch, setIconSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  if (!isOpen) return null;

  const groups = ['Todos', 'Alimentación', 'Hogar y Servicios', 'Transporte', 'Compras', 'Ocio', 'Salud', 'Finanzas', 'Trabajo y Educación'];

  const filteredIcons = CATEGORY_ICON_CATALOG.filter((item) => {
    const matchSearch = item.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
      item.name.toLowerCase().includes(iconSearch.toLowerCase());
    const matchGroup = selectedGroup === 'Todos' || item.group === selectedGroup;
    return matchSearch && matchGroup;
  });

  const SelectedIconComponent = getCategoryLucideIcon(selectedIconName);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor escribe un nombre para la categoría');
      return;
    }
    if (
      categories.some(
        (c) =>
          c.name.toLowerCase() === name.trim().toLowerCase() && c.type === type
      )
    ) {
      setError('Ya existe una categoría con ese nombre');
      return;
    }

    onAddCategory({
      name: name.trim(),
      type,
      color,
      icon: selectedIconName,
      monthlyBudget: type === 'expense' ? parseFloat(budget) || 0 : undefined,
    });

    setName('');
    setBudget('');
    setError('');
    setIsIconPickerOpen(false);
  };

  const expenseCats = categories.filter((c) => c.type === 'expense');
  const incomeCats = categories.filter((c) => c.type === 'income');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Crear y Gestionar Categorías
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Personaliza tus categorías e íconos de Lucide Icons
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Add Category Form */}
          <form
            onSubmit={handleAdd}
            className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-neutral-200/80 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Nueva Categoría
              </h4>
              <span className="text-[10px] font-semibold text-neutral-500">
                Librería: Lucide Icons
              </span>
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium leading-snug">
                {error}
              </p>
            )}

            {/* Type selector: Gasto vs Ingreso */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-200/60 rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Categoría de Gasto
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Categoría de Ingreso
              </button>
            </div>

            {/* Name and Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Restaurantes, Gimnasio..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white"
                />
              </div>

              {type === 'expense' && (
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    Límite mensual opcional ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    placeholder="Ej. 250"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold font-mono rounded-xl border border-neutral-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white tabular-nums"
                  />
                </div>
              )}
            </div>

            {/* Icon Picker Accordion */}
            <div className="border border-neutral-200 rounded-2xl bg-white p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">
                  Ícono de la Categoría (Lucide Icons)
                </span>
                <button
                  type="button"
                  onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isIconPickerOpen ? 'Cerrar selector' : 'Elegir ícono'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isIconPickerOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Current Icon Preview Badge */}
              <div
                onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                className="flex items-center gap-3 p-2 bg-neutral-50 hover:bg-neutral-100 rounded-xl cursor-pointer border border-neutral-200/70 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                  style={{ backgroundColor: color }}
                >
                  <SelectedIconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-neutral-900 block truncate">
                    {CATEGORY_ICON_CATALOG.find((i) => i.name === selectedIconName)?.label || selectedIconName}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Lucide: {selectedIconName} · Haz clic para cambiar
                  </span>
                </div>
              </div>

              {/* Collapsible Lucide Icons Grid */}
              {isIconPickerOpen && (
                <div className="pt-2 border-t border-neutral-100 space-y-2.5 animate-in fade-in duration-150">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar ícono por nombre o tema..."
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Group filters */}
                  <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                    {groups.map((grp) => (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => setSelectedGroup(grp)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                          selectedGroup === grp
                            ? 'bg-indigo-600 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {grp}
                      </button>
                    ))}
                  </div>

                  {/* Icon Grid */}
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-44 overflow-y-auto p-1 bg-neutral-50/70 rounded-xl border border-neutral-100">
                    {filteredIcons.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = selectedIconName === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setSelectedIconName(item.name);
                            setIsIconPickerOpen(false);
                          }}
                          title={`${item.label} (${item.name})`}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs scale-105'
                              : 'bg-white text-neutral-700 border border-neutral-200/60 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Color Swatches */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1.5">
                Color de la Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                      color === c
                        ? 'scale-125 ring-2 ring-offset-2 ring-indigo-600 shadow-xs'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Categoría con Ícono</span>
            </button>
          </form>

          {/* List of Existing Categories */}
          <div className="space-y-4">
            <div>
              <h5 className="text-xs font-bold text-neutral-700 mb-2">
                Categorías de Gastos ({expenseCats.length})
              </h5>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {expenseCats.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 hover:bg-white text-xs border border-neutral-200/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        {renderCategoryIcon(cat.icon, 'w-4 h-4 text-white')}
                      </div>
                      <span className="font-bold text-neutral-900 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {cat.monthlyBudget ? (
                        <span className="font-mono text-neutral-500 text-[11px] bg-white px-2 py-0.5 rounded-lg border border-neutral-200">
                          Límite: {currencySymbol} {cat.monthlyBudget}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onDeleteCategory(cat.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
              <h5 className="text-xs font-bold text-neutral-700 mb-2">
                Categorías de Ingresos ({incomeCats.length})
              </h5>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {incomeCats.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 hover:bg-white text-xs border border-neutral-200/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        {renderCategoryIcon(cat.icon, 'w-4 h-4 text-white')}
                      </div>
                      <span className="font-bold text-neutral-900 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
