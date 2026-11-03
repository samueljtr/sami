import React from 'react';
import { AppTab } from '../types/finance';
import { LayoutGrid, Receipt, PieChart, Wallet, ArrowUpDown } from 'lucide-react';

interface BottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'resumen',
      label: 'Resumen',
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      id: 'movimientos',
      label: 'Movimientos',
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      id: 'graficos',
      label: 'Gráficos',
      icon: <PieChart className="w-5 h-5" />,
    },
    {
      id: 'presupuestos',
      label: 'Presupuestos',
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      id: 'medeben',
      label: '¿Debo o me Deben?',
      icon: <ArrowUpDown className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 shadow-lg no-print">
      <div className="max-w-md mx-auto sm:max-w-xl md:max-w-2xl flex items-center justify-between px-2 py-1.5 sm:px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all rounded-xl cursor-pointer ${
                isActive
                  ? 'text-indigo-600 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 font-medium'
              }`}
            >
              <div
                className={`w-10 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? tab.id === 'movimientos' || tab.id === 'medeben'
                      ? 'bg-indigo-600 text-white shadow-xs scale-105'
                      : 'bg-indigo-100 text-indigo-700 shadow-xs scale-105'
                    : 'text-neutral-600 hover:bg-neutral-100/60'
                }`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight text-center leading-tight line-clamp-1 ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-neutral-600'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
