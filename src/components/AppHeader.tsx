import React from 'react';
import { AppTab, UserSettings } from '../types/finance';
import { useAuth } from '../context/AuthContext';
import { Zap, Receipt, PieChart, Wallet, ArrowUpDown, User } from 'lucide-react';
import { SAMI_LOGO_DATA_URL } from '../constants/logo';

interface AppHeaderProps {
  activeTab: AppTab;
  settings: UserSettings;
  onOpenProfile: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ activeTab, settings, onOpenProfile }) => {
  const { user } = useAuth();

  const getTabConfig = () => {
    switch (activeTab) {
      case 'resumen':
        return {
          title: 'Resumen',
          badgeColor: 'text-indigo-600 bg-indigo-50',
          icon: <Zap className="w-3.5 h-3.5 text-indigo-600" />,
        };
      case 'movimientos':
        return {
          title: 'Movimientos',
          badgeColor: 'text-blue-600 bg-blue-50',
          icon: <Receipt className="w-3.5 h-3.5 text-blue-600" />,
        };
      case 'graficos':
        return {
          title: 'Gráficos',
          badgeColor: 'text-emerald-600 bg-emerald-50',
          icon: <PieChart className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'presupuestos':
        return {
          title: 'Presupuestos',
          badgeColor: 'text-teal-600 bg-teal-50',
          icon: <Wallet className="w-3.5 h-3.5 text-teal-600" />,
        };
      case 'medeben':
        return {
          title: '¿Debo O Me Deben?',
          badgeColor: 'text-violet-600 bg-violet-50',
          icon: <ArrowUpDown className="w-3.5 h-3.5 text-violet-600" />,
        };
    }
  };

  const config = getTabConfig();

  const userInitial = user?.displayName
    ? user.displayName[0].toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100 px-4 py-2.5 sm:px-6 transition-all no-print">
      <div className="max-w-md mx-auto sm:max-w-xl md:max-w-2xl flex items-center justify-between gap-3">
        {/* Left: Prominent Official Sami Logo + Brand & Active Screen Name */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenProfile}
            title="Sami - Control de Finanzas (Click para ver perfil)"
            className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white border border-sky-200/80 shadow-md p-0.5 flex items-center justify-center shrink-0 transition-all active:scale-95 hover:shadow-lg hover:border-sky-300 cursor-pointer group overflow-hidden"
          >
            <img
              src={SAMI_LOGO_DATA_URL}
              alt="Sami Logo Oficial"
              className="w-full h-full object-contain transition-transform group-hover:scale-105"
            />
          </button>

          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-base sm:text-lg font-black tracking-tight text-neutral-900 font-sans">
                sami
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-1.5 py-0.5 rounded-md shadow-2xs">
                Finanzas
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1 leading-none">
              <span className={`p-0.5 rounded-md ${config.badgeColor}`}>
                {config.icon}
              </span>
              <h1 className="text-xs sm:text-sm font-bold text-neutral-700 tracking-tight truncate">
                {config.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right: User Avatar / Profile Button with Cloud connection status */}
        <button
          type="button"
          onClick={onOpenProfile}
          title={user ? `Conectado como ${user.email}` : 'Perfil e Iniciar Sesión'}
          className="relative w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 flex items-center justify-center transition-all shadow-xs hover:shadow-sm active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : userInitial ? (
            <span className="font-bold text-sm text-indigo-700">{userInitial}</span>
          ) : (
            <User className="w-5 h-5 text-blue-600" />
          )}

          {/* Green dot badge when connected to Cloud */}
          {user && (
            <span
              title="Sincronizado en la nube (PC y Móvil)"
              className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs"
            />
          )}
        </button>
      </div>
    </header>
  );
};
