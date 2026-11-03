import React, { useState } from 'react';
import { UserSettings } from '../types/finance';
import { AVAILABLE_CURRENCIES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  DollarSign,
  FileDown,
  Trash2,
  RotateCcw,
  Check,
  LogIn,
  LogOut,
  ShieldCheck,
  Cloud,
} from 'lucide-react';
import { SAMI_LOGO_DATA_URL } from '../constants/logo';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onOpenExport: () => void;
  onConfirmClearData: () => void;
  onResetDemoData: () => void;
  onOpenAuthModal: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenExport,
  onConfirmClearData,
  onResetDemoData,
  onOpenAuthModal,
}) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const [personName, setPersonName] = useState(
    user?.displayName || settings.personName || 'Josué'
  );
  const [currency, setCurrency] = useState(settings.currency || 'USD');
  const [budgetTotal, setBudgetTotal] = useState(String(settings.monthlyBudgetTotal || 2000));
  const [savingsTarget, setSavingsTarget] = useState(String(settings.monthlySavingsTarget || 500));
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currObj = AVAILABLE_CURRENCIES.find((c) => c.code === currency);
    onUpdateSettings({
      ...settings,
      personName: personName.trim() || 'Josué',
      currency,
      currencySymbol: currObj ? currObj.symbol : '$',
      monthlyBudgetTotal: parseFloat(budgetTotal) || 2000,
      monthlySavingsTarget: parseFloat(savingsTarget) || 500,
    });
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 800);
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white border border-sky-100 shadow-sm p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={SAMI_LOGO_DATA_URL}
                alt="Sami Logo Oficial"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-neutral-900">
                  Perfil y Ajustes
                </h3>
                <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md">
                  Sami
                </span>
              </div>
              <p className="text-xs text-neutral-500 truncate max-w-[210px]">
                {user ? user.email : 'Modo local sin conexión'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication Card Banner */}
        {user ? (
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-indigo-950 truncate">
                    {user.displayName || 'Usuario'}
                  </span>
                  <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    <ShieldCheck className="w-2.5 h-2.5" /> En la nube
                  </span>
                </div>
                <p className="text-[11px] text-indigo-600 truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200/80 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-indigo-200" />
              <h4 className="text-xs font-bold tracking-tight">
                ¿Quieres sincronizar tus datos?
              </h4>
            </div>
            <p className="text-[11px] text-blue-100 leading-relaxed">
              Inicia sesión o regístrate con correo o Google para no perder tus finanzas y verlas en tu celular y computadora.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="w-full py-2 px-3 bg-white text-indigo-700 text-xs font-bold rounded-xl shadow-xs hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <LogIn className="w-3.5 h-3.5" />
              Iniciar Sesión / Registrarse
            </button>
          </div>
        )}

        {/* Preferences Form */}
        <form onSubmit={handleSave} className="space-y-3.5 pt-1">
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">
              Nombre Visible
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Ej. Josué"
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">
              Moneda Principal
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {AVAILABLE_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">
                Presupuesto Mes
              </label>
              <input
                type="number"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">
                Meta de Ahorro
              </label>
              <input
                type="number"
                value={savingsTarget}
                onChange={(e) => setSavingsTarget(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {savedFeedback ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                ¡Ajustes Guardados!
              </>
            ) : (
              'Guardar Preferencias'
            )}
          </button>
        </form>

        {/* Quick Tools & Data Actions */}
        <div className="pt-3 border-t border-neutral-100 space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenExport();
            }}
            className="w-full py-2 px-3 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/70 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-indigo-600" />
            Exportar Datos (CSV / PDF)
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onConfirmClearData();
              }}
              className="py-2 px-2 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar a 0
            </button>

            <button
              type="button"
              onClick={() => {
                onResetDemoData();
                onClose();
              }}
              className="py-2 px-2 text-[11px] font-semibold text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200/70 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer demo
            </button>
          </div>
        </div>

        {/* Footer credits */}
        <div className="pt-3 border-t border-neutral-100 flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2">
            <img
              src={SAMI_LOGO_DATA_URL}
              alt="Sami"
              className="w-6 h-6 rounded-lg object-contain shadow-2xs"
            />
            <span className="text-xs font-bold text-neutral-800 tracking-tight">
              Sami • Control de Finanzas Personales
            </span>
          </div>
          <div>
            <p className="text-[11px] text-neutral-500">
              Seguridad y Cifrado con Google Cloud Firebase.
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Desarrollado por :{' '}
              <a
                href="https://www.linkedin.com/in/sjtr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold underline underline-offset-2"
              >
                https://www.linkedin.com/in/sjtr
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
