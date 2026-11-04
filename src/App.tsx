import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AppTab,
  Category,
  DebtAccount,
  MonthData,
  Transaction,
  TransactionType,
  UserSettings,
} from './types/finance';
import {
  loadStoredTransactions,
  saveStoredTransactions,
  loadStoredCategories,
  saveStoredCategories,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredDebts,
  saveStoredDebts,
  formatCurrency,
} from './utils/storage';
import { MONTH_NAMES_ES } from './utils/constants';

import { useAuth } from './context/AuthContext';
import { cloudFetchUserData, cloudSyncUserData } from './services/cloudApi';

import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { ResumenView } from './components/ResumenView';
import { MovimientosView } from './components/MovimientosView';
import { GraficosView } from './components/GraficosView';
import { PresupuestosView } from './components/PresupuestosView';
import { MeDebenView } from './components/MeDebenView';

import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { MovementTypeModal } from './components/MovementTypeModal';
import { TransactionModal } from './components/TransactionModal';
import { CategoryModal } from './components/CategoryModal';
import { SAMI_LOGO_DATA_URL } from './constants/logo';
import { ExportModal } from './components/ExportModal';
import { Sparkles, UserPlus } from 'lucide-react';

export default function App() {
  const { user, initialCloudData } = useAuth();

  // Core persistent states
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStoredTransactions());
  const [categories, setCategories] = useState<Category[]>(() => loadStoredCategories());
  const [settings, setSettings] = useState<UserSettings>(() => loadStoredSettings());
  const [debts, setDebts] = useState<DebtAccount[]>(() => loadStoredDebts());

  // Navigation tab state (defaults to 'resumen')
  const [activeTab, setActiveTab] = useState<AppTab>('resumen');

  // UI modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRequiredNotice, setAuthRequiredNotice] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMovementTypeModalOpen, setIsMovementTypeModalOpen] = useState(false);
  const [selectedMovementType, setSelectedMovementType] = useState<TransactionType>('expense');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Month navigation state
  const today = new Date();
  const currentRealKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(currentRealKey);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Immediate hydration when initialCloudData is provided from AuthContext
  useEffect(() => {
    if (initialCloudData) {
      if (Array.isArray(initialCloudData.transactions)) {
        setTransactions(initialCloudData.transactions);
        saveStoredTransactions(initialCloudData.transactions);
      }
      if (Array.isArray(initialCloudData.debts)) {
        setDebts(initialCloudData.debts);
        saveStoredDebts(initialCloudData.debts);
      }
      if (Array.isArray(initialCloudData.categories) && initialCloudData.categories.length > 0) {
        setCategories(initialCloudData.categories);
        saveStoredCategories(initialCloudData.categories);
      }
      if (initialCloudData.settings) {
        setSettings(initialCloudData.settings);
        saveStoredSettings(initialCloudData.settings);
      }
    }
  }, [initialCloudData]);

  // Initial cloud load on mount or user login
  useEffect(() => {
    if (user?.uid) {
      cloudFetchUserData(user.uid, user.email).then((cloud) => {
        if (cloud) {
          if (Array.isArray(cloud.transactions)) {
            setTransactions(cloud.transactions);
            saveStoredTransactions(cloud.transactions);
          }
          if (Array.isArray(cloud.debts)) {
            setDebts(cloud.debts);
            saveStoredDebts(cloud.debts);
          }
          if (Array.isArray(cloud.categories) && cloud.categories.length > 0) {
            setCategories(cloud.categories);
            saveStoredCategories(cloud.categories);
          }
          if (cloud.settings) {
            setSettings(cloud.settings);
            saveStoredSettings(cloud.settings);
          }
        } else {
          // Push initial data to cloud so mobile or new device has it immediately
          cloudSyncUserData(user.uid, user.email, {
            transactions,
            debts,
            categories,
            settings,
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  }, [user?.uid, user?.email]);

  // Real-time synchronization across devices (PC and Mobile)
  // When user returns to mobile app, switches browser tabs, or every 10 seconds:
  useEffect(() => {
    if (!user?.uid) return;

    const pullLatestCloud = () => {
      if (document.visibilityState === 'visible' && user?.uid) {
        cloudFetchUserData(user.uid, user.email).then((cloud) => {
          if (cloud) {
            if (Array.isArray(cloud.transactions)) {
              setTransactions(cloud.transactions);
              saveStoredTransactions(cloud.transactions);
            }
            if (Array.isArray(cloud.debts)) {
              setDebts(cloud.debts);
              saveStoredDebts(cloud.debts);
            }
            if (Array.isArray(cloud.categories) && cloud.categories.length > 0) {
              setCategories(cloud.categories);
              saveStoredCategories(cloud.categories);
            }
            if (cloud.settings) {
              setSettings(cloud.settings);
              saveStoredSettings(cloud.settings);
            }
          }
        }).catch(() => {});
      }
    };

    window.addEventListener('focus', pullLatestCloud);
    document.addEventListener('visibilitychange', pullLatestCloud);

    const interval = setInterval(pullLatestCloud, 10000);

    return () => {
      window.removeEventListener('focus', pullLatestCloud);
      document.removeEventListener('visibilitychange', pullLatestCloud);
      clearInterval(interval);
    };
  }, [user?.uid, user?.email]);

  // Persist mutations locally and push to cloud server
  const isFirstMount = useRef(true);
  const syncTimer = useRef<any>(null);

  useEffect(() => {
    saveStoredTransactions(transactions);
    saveStoredCategories(categories);
    saveStoredSettings(settings);
    saveStoredDebts(debts);

    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (user?.uid) {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        cloudSyncUserData(user.uid, user.email, {
          transactions,
          debts,
          categories,
          settings,
        }).catch((err) => console.warn('Cloud sync error:', err));
      }, 500);
    }
  }, [transactions, categories, settings, debts, user?.uid, user?.email]);

  // Current selected month's transactions
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonthKey));
  }, [transactions, selectedMonthKey]);

  // Current selected month data
  const currentMonthData = useMemo<MonthData>(() => {
    const [yStr, mStr] = selectedMonthKey.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1;
    const label = `${MONTH_NAMES_ES[month]} ${year}`;

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (Math.max(netSavings, 0) / totalIncome) * 100 : 0;

    return {
      year,
      month,
      key: selectedMonthKey,
      label,
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      transactionsCount: currentMonthTransactions.length,
    };
  }, [selectedMonthKey, currentMonthTransactions]);

  // Category breakdown for expenses in selected month
  const categoryExpenses = useMemo(() => {
    const expenseTrans = currentMonthTransactions.filter((t) => t.type === 'expense');
    const totalExp = expenseTrans.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, { amount: number; count: number }>();
    expenseTrans.forEach((t) => {
      const existing = map.get(t.category) || { amount: 0, count: 0 };
      map.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1,
      });
    });

    const categoryMap = new Map<string, Category>();
    categories.forEach((c) => categoryMap.set(c.name, c));

    const list = Array.from(map.entries()).map(([catName, data]) => {
      const catObj = categoryMap.get(catName);
      const color = catObj ? catObj.color : '#94A3B8';
      const percentage = totalExp > 0 ? (data.amount / totalExp) * 100 : 0;
      return {
        name: catName,
        amount: data.amount,
        percentage,
        count: data.count,
        color,
      };
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [currentMonthTransactions, categories]);

  // Transaction mutations
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...data } : t))
      );
      showToast('Movimiento actualizado y sincronizado');
    } else {
      const newTx: Transaction = {
        ...data,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('Movimiento registrado y guardado en la nube');
    }
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Movimiento eliminado');
  };

  // Debt action handlers
  const handleSettleDebt = (debtId: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          return {
            ...d,
            type: 'settled',
            statusText: 'Al día',
            amount: 0,
          };
        }
        return d;
      })
    );
    showToast('¡Cuenta saldada en 1 clic! Finanzas sincronizadas.');
  };

  const handlePayDebt = (debtId: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          return {
            ...d,
            type: 'settled',
            statusText: 'Al día',
            amount: 0,
          };
        }
        return d;
      })
    );
    showToast('¡Pago registrado con éxito! Balance al día.');
  };

  const handleWhatsAppReminder = (debt: DebtAccount) => {
    const textMsg = `Hola ${debt.personName}, te recuerdo con aprecio el pendiente de "${debt.concept}" por ${formatCurrency(debt.amount, settings.currencySymbol || '$')}. ¡Muchas gracias!`;
    const cleanPhone = debt.phone?.replace(/[^0-9]/g, '') || '';
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(textMsg)}`;

    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textMsg);
      }
    } catch {
      // ignore clipboard error
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Abriendo WhatsApp y mensaje copiado al portapapeles');
  };

  const handleApplySavingsChallenge = (amount: number) => {
    setSettings((prev) => ({
      ...prev,
      monthlySavingsTarget: (prev.monthlySavingsTarget || 500) + amount,
    }));
    showToast(`¡Reto aplicado! Meta de ahorro aumentada en +$${amount}.`);
  };

  // Category mutations
  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Categoría "${newCat.name}" agregada`);
  };

  const handleDeleteCategory = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    showToast(`Categoría "${cat?.name || ''}" eliminada`);
  };

  const handleImportBackup = (importedTransactions: Transaction[]) => {
    setTransactions(importedTransactions);
    saveStoredTransactions(importedTransactions);
    showToast(`Copia de seguridad restaurada (${importedTransactions.length} movimientos)`);
  };

  // Guarded actions requiring user registration/authentication
  const handleOpenNewExpense = () => {
    if (!user) {
      setAuthRequiredNotice(
        '¡Registro obligatorio! Para poder realizar tu primer registro y sincronizarlo entre tu PC y celular, por favor crea tu cuenta o inicia sesión.'
      );
      setIsAuthModalOpen(true);
      return;
    }
    setEditingTransaction(null);
    setIsMovementTypeModalOpen(true);
  };

  const handleSelectMovementType = (chosenType: TransactionType) => {
    setSelectedMovementType(chosenType);
    setIsMovementTypeModalOpen(false);
    setIsTransactionModalOpen(true);
  };

  const handleSelectTransaction = (t: Transaction) => {
    if (!user) {
      setAuthRequiredNotice(
        '¡Registro obligatorio! Para modificar este movimiento y sincronizarlo con la nube, por favor crea tu cuenta o inicia sesión.'
      );
      setIsAuthModalOpen(true);
      return;
    }
    setEditingTransaction(t);
    setSelectedMovementType(t.type);
    setIsTransactionModalOpen(true);
  };

  const handleOpenNewLimit = () => {
    if (!user) {
      setAuthRequiredNotice(
        '¡Registro obligatorio! Para configurar nuevos límites de presupuesto y sincronizarlos con todos tus dispositivos, por favor crea tu cuenta o inicia sesión.'
      );
      setIsAuthModalOpen(true);
      return;
    }
    setIsCategoryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-neutral-900 flex flex-col items-center selection:bg-indigo-500 selection:text-white">
      {/* Centered App Container matching the mobile screenshots fidelity */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl min-h-screen bg-slate-50 flex flex-col relative shadow-sm border-x border-neutral-200/60">
        {/* Top App Header with tab icon badge and profile avatar */}
        <AppHeader
          activeTab={activeTab}
          settings={settings}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-4 sm:px-6 pb-28">
          {/* Registration Requirement Notice Banner when not authenticated */}
          {!user && (
            <div className="mb-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 rounded-3xl p-4 text-white shadow-md flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-16 rounded-2xl bg-white p-1 shrink-0 shadow-md border border-white/80 flex items-center justify-center overflow-hidden">
                  <img
                    src={SAMI_LOGO_DATA_URL}
                    alt="Sami Logo Oficial"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                    Sincronización en la Nube
                  </h4>
                  <p className="text-[11px] text-blue-100 leading-snug">
                    Crea tu cuenta gratuita para sincronizar tus finanzas en tiempo real entre tu PC y celular.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthRequiredNotice(
                    '¡Registro obligatorio! Para poder realizar tu primer registro de gasto y sincronizar entre tu PC y celular, crea tu cuenta o inicia sesión.'
                  );
                  setIsAuthModalOpen(true);
                }}
                className="shrink-0 px-3.5 py-2 bg-white text-indigo-700 hover:bg-neutral-100 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrarme</span>
              </button>
            </div>
          )}

          {activeTab === 'resumen' && (
            <ResumenView
              currentMonthData={currentMonthData}
              settings={settings}
              transactions={transactions}
              debts={debts}
              onOpenNewExpense={handleOpenNewExpense}
              onNavigateToDebts={() => setActiveTab('medeben')}
              onNavigateToTransactions={() => setActiveTab('movimientos')}
            />
          )}

          {activeTab === 'movimientos' && (
            <MovimientosView
              transactions={transactions}
              categories={categories}
              settings={settings}
              onOpenNewExpense={handleOpenNewExpense}
              onSelectTransaction={handleSelectTransaction}
            />
          )}

          {activeTab === 'graficos' && (
            <GraficosView
              currentMonthData={currentMonthData}
              settings={settings}
              transactions={transactions}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {activeTab === 'presupuestos' && (
            <PresupuestosView
              categories={categories}
              currentMonthData={currentMonthData}
              settings={settings}
              onOpenNewLimit={handleOpenNewLimit}
              onApplySavingsChallenge={handleApplySavingsChallenge}
              onUpdateSettings={setSettings}
            />
          )}

          {activeTab === 'medeben' && (
            <MeDebenView
              debts={debts}
              settings={settings}
              onSettleDebt={handleSettleDebt}
              onPayDebt={handlePayDebt}
              onWhatsAppReminder={handleWhatsAppReminder}
            />
          )}
        </main>

        {/* Sticky Bottom Navigation with 5 tabs */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Profile & Settings Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Authentication Modal (Login / Register / Google) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthRequiredNotice(null);
        }}
        requiredMessage={authRequiredNotice || undefined}
        initialMode="register"
      />

      {/* Emerging Movement Type Selector Modal: Ingreso o Gasto */}
      <MovementTypeModal
        isOpen={isMovementTypeModalOpen}
        onClose={() => setIsMovementTypeModalOpen(false)}
        onSelectType={handleSelectMovementType}
      />

      {/* New/Edit Movement Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        initialTransaction={editingTransaction}
        initialType={selectedMovementType}
        currencySymbol={settings.currencySymbol}
        defaultDate={`${selectedMonthKey}-01`}
        onOpenCategoryManager={() => {
          setIsTransactionModalOpen(false);
          setIsCategoryModalOpen(true);
        }}
      />

      {/* Category / Budget Limit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        currencySymbol={settings.currencySymbol}
      />

      {/* Export CSV / PDF Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        currentMonthTransactions={currentMonthTransactions}
        currentMonthData={currentMonthData}
        settings={settings}
        categoryExpenses={categoryExpenses}
        onImportBackup={handleImportBackup}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 z-50 bg-neutral-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
