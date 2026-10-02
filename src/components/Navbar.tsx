import React from 'react';
import { Plus, Download, SlidersHorizontal, BarChart3, Receipt, LayoutDashboard, Target } from 'lucide-react';
import { SamiLogo } from './SamiLogo';

export type ActiveTab = 'dashboard' | 'transactions' | 'charts' | 'budgets';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  onOpenExport: () => void;
  customLogoUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenExport,
  customLogoUrl,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single brand wordmark with exact Sami logo */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg transition-transform active:scale-98"
        >
          <SamiLogo size="md" showText={true} showTagline={true} customLogoUrl={customLogoUrl} />
        </button>

        {/* Zone 2: Clean text navigation links / tabs */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Resumen
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Movimientos
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'charts'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Gráficos
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'budgets'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Presupuestos
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV/PDF</span>
            <span className="sm:hidden">Exportar</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Movimiento</span>
            <span className="sm:hidden">Añadir</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-neutral-100 px-3 py-1.5 overflow-x-auto gap-1 bg-white">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-md text-center whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-neutral-100 text-neutral-900 font-semibold' : 'text-neutral-500'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-md text-center whitespace-nowrap ${
            activeTab === 'transactions' ? 'bg-neutral-100 text-neutral-900 font-semibold' : 'text-neutral-500'
          }`}
        >
          Movimientos
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-md text-center whitespace-nowrap ${
            activeTab === 'charts' ? 'bg-neutral-100 text-neutral-900 font-semibold' : 'text-neutral-500'
          }`}
        >
          Gráficos
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-md text-center whitespace-nowrap ${
            activeTab === 'budgets' ? 'bg-neutral-100 text-neutral-900 font-semibold' : 'text-neutral-500'
          }`}
        >
          Presupuestos
        </button>
      </div>
    </header>
  );
};
