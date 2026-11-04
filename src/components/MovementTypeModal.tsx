import React from 'react';
import { TransactionType } from '../types/finance';
import { X, ArrowDownRight, ArrowUpRight, ShoppingBag, Banknote } from 'lucide-react';
import { SAMI_LOGO_DATA_URL } from '../constants/logo';

interface MovementTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: TransactionType) => void;
}

export const MovementTypeModal: React.FC<MovementTypeModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-7 max-w-sm w-full shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-white border border-sky-100 p-0.5 mx-auto shadow-sm flex items-center justify-center overflow-hidden">
            <img
              src={SAMI_LOGO_DATA_URL}
              alt="Sami Logo Oficial"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
            ¿Qué deseas registrar?
          </h3>
          <p className="text-xs text-neutral-500 max-w-[240px] mx-auto">
            Elige si se trata de un gasto o de un ingreso para continuar.
          </p>
        </div>

        {/* Action Choice Cards */}
        <div className="grid grid-cols-1 gap-3 pt-1">
          {/* Card: GASTO */}
          <button
            type="button"
            onClick={() => onSelectType('expense')}
            className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl border-2 border-rose-100 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-300 transition-all text-left shadow-2xs active:scale-98 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-rose-950">Gasto</span>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-rose-100/80 px-2 py-0.5 rounded-full">
                  Salida
                </span>
              </div>
              <p className="text-xs text-rose-800/80 mt-0.5 leading-snug">
                Compras, servicios, pagos o salidas de dinero
              </p>
            </div>
          </button>

          {/* Card: INGRESO */}
          <button
            type="button"
            onClick={() => onSelectType('income')}
            className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left shadow-2xs active:scale-98 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-emerald-950">Ingreso</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Entrada
                </span>
              </div>
              <p className="text-xs text-emerald-800/80 mt-0.5 leading-snug">
                Sueldo, ventas, cobros o entradas a tu cuenta
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
