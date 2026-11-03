import React, { useState } from 'react';
import { DebtAccount, UserSettings } from '../types/finance';
import { formatCurrency } from '../utils/storage';
import {
  PiggyBank,
  ArrowDown,
  ArrowUp,
  MessageCircle,
  CheckCircle2,
  Plane,
  Users,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { SAMI_LOGO_DATA_URL } from '../constants/logo';

interface MeDebenViewProps {
  debts: DebtAccount[];
  settings: UserSettings;
  onSettleDebt: (debtId: string) => void;
  onPayDebt: (debtId: string) => void;
  onWhatsAppReminder: (debt: DebtAccount) => void;
}

export const MeDebenView: React.FC<MeDebenViewProps> = ({
  debts,
  settings,
  onSettleDebt,
  onPayDebt,
  onWhatsAppReminder,
}) => {
  const currencySymbol = settings.currencySymbol || '$';
  const [filter, setFilter] = useState<'todos' | 'te_deben' | 'debes'>('todos');

  // Real calculations
  const theyOweMe = debts
    .filter((d) => d.type === 'owe_me')
    .reduce((sum, d) => sum + d.amount, 0);

  const iOwe = debts
    .filter((d) => d.type === 'i_owe')
    .reduce((sum, d) => sum + d.amount, 0);

  const netBalance = theyOweMe - iOwe;

  // Filter accounts
  const filteredDebts = debts.filter((d) => {
    if (filter === 'todos') return true;
    if (filter === 'te_deben') return d.type === 'owe_me';
    if (filter === 'debes') return d.type === 'i_owe';
    return true;
  });

  const countOweMe = debts.filter((d) => d.type === 'owe_me').length;
  const countIOwe = debts.filter((d) => d.type === 'i_owe').length;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Hero Summary Card */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-blue-50/80 border border-indigo-100/70 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-600 block">
              Balance neto general
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight mt-0.5">
              {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance, currencySymbol)}
            </h2>
          </div>

          <div className="bg-white/90 border border-neutral-200/70 shadow-2xs rounded-full px-3.5 py-1.5 flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-neutral-800 whitespace-nowrap">
              Te deben en total
            </span>
          </div>
        </div>

        {/* Inner 2 chips */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Green chip: Te deben */}
          <div className="bg-emerald-100/80 rounded-2xl p-3 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <span className="text-[11px] font-semibold text-emerald-950 block">
                Te deben:
              </span>
              <span className="text-sm sm:text-base font-bold text-emerald-900 block mt-0.5">
                {formatCurrency(theyOweMe, currencySymbol)}
              </span>
            </div>
          </div>

          {/* Red chip: Tú debes */}
          <div className="bg-rose-100/70 rounded-2xl p-3 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <div>
              <span className="text-[11px] font-semibold text-rose-950 block">
                Tú debes:
              </span>
              <span className="text-sm sm:text-base font-bold text-rose-900 block mt-0.5">
                {formatCurrency(iOwe, currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Segmented Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('todos')}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'todos'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90'
          }`}
        >
          Todos ({debts.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('te_deben')}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'te_deben'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90'
          }`}
        >
          Te deben ({countOweMe})
        </button>

        <button
          type="button"
          onClick={() => setFilter('debes')}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'debes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90'
          }`}
        >
          Debes ({countIOwe})
        </button>
      </div>

      {/* 3. Subheader: Cuentas pendientes */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
          Cuentas pendientes
        </h3>
        <span className="bg-neutral-100 text-neutral-600 text-xs font-semibold px-3 py-1 rounded-full">
          {filteredDebts.length} {filteredDebts.length === 1 ? 'persona' : 'personas'}
        </span>
      </div>

      {/* 4. Debt Cards */}
      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-neutral-200 shadow-xs space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-neutral-800">
              {filter === 'todos'
                ? '¡Estás al día!'
                : filter === 'te_deben'
                ? 'Nadie te debe dinero'
                : 'No debes nada a nadie'}
            </h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              No tienes cuentas pendientes en esta lista.
            </p>
          </div>
        ) : (
          filteredDebts.map((item) => {
            const isOweMe = item.type === 'owe_me';
            const isIOwe = item.type === 'i_owe';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border border-neutral-100 p-4 sm:p-5 shadow-xs space-y-3.5 transition-all ${
                  isOweMe
                    ? 'border-l-4 border-l-emerald-500'
                    : isIOwe
                    ? 'border-l-4 border-l-rose-500'
                    : 'border-l-4 border-l-blue-600'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {item.isGroup ? (
                        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
                          <Plane className="w-6 h-6" />
                        </div>
                      ) : item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.personName}
                          className="w-12 h-12 rounded-2xl object-cover shadow-xs border border-neutral-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                          {item.avatarInitials || 'CM'}
                        </div>
                      )}

                      {/* Badge icon on bottom right */}
                      {item.isGroup ? (
                        <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] absolute -bottom-0.5 -right-0.5 shadow-xs">
                          <Users className="w-2.5 h-2.5" />
                        </div>
                      ) : isOweMe ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] absolute -bottom-0.5 -right-0.5 shadow-xs">
                          <ArrowDown className="w-2.5 h-2.5" />
                        </div>
                      ) : isIOwe ? (
                        <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] absolute -bottom-0.5 -right-0.5 shadow-xs">
                          <ArrowUp className="w-2.5 h-2.5" />
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">
                        {item.personName}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {item.concept} • {item.timeAgo}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-bold block ${
                        isOweMe
                          ? 'text-emerald-700'
                          : isIOwe
                          ? 'text-rose-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {isOweMe ? '+' : isIOwe ? '-' : '+'}{' '}
                      {formatCurrency(item.amount, currencySymbol)}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                        isOweMe
                          ? 'bg-emerald-100/90 text-emerald-800'
                          : isIOwe
                          ? 'bg-rose-100/90 text-rose-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {item.statusText}
                    </span>
                  </div>
                </div>

                {/* Action buttons row or Group summary */}
                {item.isGroup ? (
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800">
                      Gastos totales: {formatCurrency(item.totalGroupExpense || 1240.00, currencySymbol)}
                    </span>
                    <button
                      type="button"
                      className="font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      Ver detalles <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : isOweMe ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onWhatsAppReminder(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-neutral-600" />
                      Recordar WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={() => onSettleDebt(item.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Saldar en 1 clic
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onWhatsAppReminder(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-neutral-600" />
                      Avisar pago
                    </button>

                    <button
                      type="button"
                      onClick={() => onPayDebt(item.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Pagar ahora
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Consejo Sami Card */}
      <div className="bg-indigo-50/80 border border-indigo-100 rounded-3xl p-4 flex items-start gap-4 shadow-xs">
        <div className="w-15 h-15 rounded-2xl bg-white border border-indigo-200/80 p-1 shrink-0 shadow-xs flex items-center justify-center overflow-hidden">
          <img
            src={SAMI_LOGO_DATA_URL}
            alt="Sami Logo Oficial"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
            <span>Consejo Sami</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
          </h4>
          <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
            Usa "Saldar en 1 clic" cuando recibas una transferencia para actualizar tus finanzas al instante.
          </p>
        </div>
      </div>
    </div>
  );
};
