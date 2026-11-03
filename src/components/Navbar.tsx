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
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg transition-transform active:scale-98 shrink-0"
          >
            <SamiLogo size="sm" showText={true} showTagline={false} customLogoUrl={customLogoUrl} className="sm:hidden" />
            <SamiLogo size="md" showText={true} showTagline={true} customLogoUrl={customLogoUrl} className="hidden sm:inline-flex" />
          </button>

          {/* Desktop Navigation Links / Tabs */}
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

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onOpenExport}
              title="Exportar movimientos a CSV o PDF"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV/PDF</span>
              <span className="sm:hidden text-[11px]">Exportar</span>
            </button>

            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Movimiento</span>
              <span className="sm:hidden text-[11px]">+ Movimiento</span>
            </button>
          </div>
        </div>
      </header>

      {/* Persistent Mobile Bottom Navigation Bar (Thumb-Friendly for Phones) */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around no-print"
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg transition-colors text-[10px] font-medium ${
            activeTab === 'dashboard'
              ? 'text-neutral-900 font-bold bg-neutral-100'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Resumen</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg transition-colors text-[10px] font-medium ${
            activeTab === 'transactions'
              ? 'text-neutral-900 font-bold bg-neutral-100'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Receipt className="w-4 h-4 mb-0.5" />
          <span>Movimientos</span>
        </button>

        <button
          onClick={() => setActiveTab('charts')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg transition-colors text-[10px] font-medium ${
            activeTab === 'charts'
              ? 'text-neutral-900 font-bold bg-neutral-100'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          <span>Gráficos</span>
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg transition-colors text-[10px] font-medium ${
            activeTab === 'budgets'
              ? 'text-neutral-900 font-bold bg-neutral-100'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Target className="w-4 h-4 mb-0.5" />
          <span>Presupuestos</span>
        </button>
      </nav>
    </>
  );
};
