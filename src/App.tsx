import React, { useState, useEffect, useMemo } from 'react';
import { Category, MonthData, Transaction, UserSettings } from './types/finance';
import {
  loadStoredTransactions,
  saveStoredTransactions,
  loadStoredCategories,
  saveStoredCategories,
  loadStoredSettings,
  saveStoredSettings,
  resetToDemoData,
  clearAllTransactions,
  clearAllData,
  formatCurrency,
} from './utils/storage';
import { MONTH_NAMES_ES } from './utils/constants';
import { Navbar, ActiveTab } from './components/Navbar';
import { MonthlySummary } from './components/MonthlySummary';
import { FinanceCharts } from './components/FinanceCharts';
import { TransactionList } from './components/TransactionList';
import { BudgetManager } from './components/BudgetManager';
import { TransactionModal } from './components/TransactionModal';
import { CategoryModal } from './components/CategoryModal';
import { ExportModal } from './components/ExportModal';
import { SamiLogo } from './components/SamiLogo';
import { Plus, Download, BarChart3, Receipt, LayoutDashboard, Target, Sparkles, Trash2 } from 'lucide-react';

export default function App() {
  // Core persistent states
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStoredTransactions());
  const [categories, setCategories] = useState<Category[]>(() => loadStoredCategories());
  const [settings, setSettings] = useState<UserSettings>(() => loadStoredSettings());

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Month navigation state
  const today = new Date();
  const currentRealKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(currentRealKey);

  // Toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state to localStorage on changes
  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Compute available months list (from transactions + past 6 months to ensure smooth navigation)
  const availableMonths = useMemo(() => {
    const map = new Map<string, { year: number; month: number }>();

    // Add current real month
    map.set(currentRealKey, {
      year: today.getFullYear(),
      month: today.getMonth(),
    });

    // Add last 6 calendar months
    for (let i = 1; i <= 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, { year: d.getFullYear(), month: d.getMonth() });
    }

    // Add any months from transactions
    transactions.forEach((t) => {
      const parts = t.date.split('-');
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const key = `${parts[0]}-${parts[1]}`;
        map.set(key, { year: y, month: m });
      }
    });

    const list = Array.from(map.entries()).map(([key, val]) => ({
      key,
      year: val.year,
      month: val.month,
      label: `${MONTH_NAMES_ES[val.month]} ${val.year}`,
    }));

    // Sort descending by date
    return list.sort((a, b) => b.key.localeCompare(a.key));
  }, [transactions, currentRealKey]);

  // Calculate MonthData for all available months (for comparisons & charts)
  const allMonthlyData = useMemo<MonthData[]>(() => {
    // Sort ascending for chronological chart view (last 6 months)
    const chronologicalMonths = [...availableMonths]
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);

    return chronologicalMonths.map((m) => {
      const monthTransactions = transactions.filter((t) => t.date.startsWith(m.key));
      const totalIncome = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netSavings = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? (Math.max(netSavings, 0) / totalIncome) * 100 : 0;

      return {
        year: m.year,
        month: m.month,
        key: m.key,
        label: m.label,
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        transactionsCount: monthTransactions.length,
      };
    });
  }, [availableMonths, transactions]);

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

  // Days in selected month
  const daysInSelectedMonth = useMemo(() => {
    const [year, month] = selectedMonthKey.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [selectedMonthKey]);

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

  // Month navigation handlers
  const handlePrevMonth = () => {
    const [yStr, mStr] = selectedMonthKey.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    const newKey = `${y}-${String(m).padStart(2, '0')}`;
    setSelectedMonthKey(newKey);
  };

  const handleNextMonth = () => {
    const [yStr, mStr] = selectedMonthKey.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m === 13) {
      m = 1;
      y += 1;
    }
    const newKey = `${y}-${String(m).padStart(2, '0')}`;
    setSelectedMonthKey(newKey);
  };

  const handleCurrentMonth = () => {
    setSelectedMonthKey(currentRealKey);
  };

  // Transaction mutations
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...data } : t))
      );
      showToast('Movimiento actualizado con éxito');
    } else {
      const newTransaction: Transaction = {
        ...data,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTransaction, ...prev]);

      // Automatically jump to the month of the added transaction
      const transMonthKey = data.date.slice(0, 7);
      if (transMonthKey !== selectedMonthKey) {
        setSelectedMonthKey(transMonthKey);
      }
      showToast('Movimiento registrado correctamente');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Movimiento eliminado');
  };

  const handleDuplicateTransaction = (transaction: Transaction) => {
    const dup: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
    };
    setTransactions((prev) => [dup, ...prev]);
    showToast('Movimiento duplicado');
  };

  // Category mutations
  const handleAddCategory = (newCatData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...newCatData,
      id: `cat_${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast('Categoría creada');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Categoría eliminada');
  };

  const handleUpdateCategoryBudget = (categoryId: string, newBudget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, monthlyBudget: newBudget } : c))
    );
  };

  // Reset & Backup handlers
  const handleResetDefaults = () => {
    if (window.confirm('¿Deseas restaurar los datos de ejemplo iniciales?')) {
      const { transactions: resetTx, categories: resetCats } = resetToDemoData();
      setTransactions(resetTx);
      setCategories(resetCats);
      setSelectedMonthKey(currentRealKey);
      showToast('Datos de ejemplo restaurados');
    }
  };

  const handleExecuteClearAll = () => {
    clearAllTransactions();
    setTransactions([]);
    setIsClearConfirmOpen(false);
    showToast('¡Datos de prueba vaciados! Tu cuenta está lista para empezar desde cero');
  };

  const handleImportBackup = (backup: any) => {
    if (backup && Array.isArray(backup.transactions)) {
      setTransactions(backup.transactions);
      if (backup.settings) setSettings(backup.settings);
      showToast('Respaldo restaurado con éxito');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col antialiased text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenExport={() => setIsExportModalOpen(true)}
        customLogoUrl={settings.customLogoUrl}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Month Selector & KPI Metrics */}
        <MonthlySummary
          currentMonthData={currentMonthData}
          availableMonths={availableMonths}
          onSelectMonth={setSelectedMonthKey}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onCurrentMonth={handleCurrentMonth}
          isCurrentRealMonth={selectedMonthKey === currentRealKey}
          settings={settings}
          onClearAllTransactions={() => setIsClearConfirmOpen(true)}
          totalTransactionsCount={transactions.length}
          onResetDemoData={handleResetDefaults}
        />

        {/* View 1: DASHBOARD (Summary + Interactive Charts + Recent Transactions) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Interactive Charts Panel */}
            <FinanceCharts
              monthlyData={allMonthlyData}
              selectedMonthKey={selectedMonthKey}
              onSelectMonth={setSelectedMonthKey}
              categoryExpenses={categoryExpenses}
              currentMonthTransactions={currentMonthTransactions}
              currencySymbol={settings.currencySymbol}
              daysInMonth={daysInSelectedMonth}
            />

            {/* Quick Actions & Recent Transactions Split */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 tracking-tight">
                    Movimientos Recientes
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Últimas operaciones registradas para {currentMonthData.label}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-semibold text-neutral-900 hover:text-neutral-700 underline underline-offset-4"
                >
                  Ver todos ({currentMonthTransactions.length}) &rarr;
                </button>
              </div>

              <TransactionList
                transactions={currentMonthTransactions}
                categories={categories}
                currencySymbol={settings.currencySymbol}
                onEdit={(t) => {
                  setEditingTransaction(t);
                  setIsTransactionModalOpen(true);
                }}
                onDelete={handleDeleteTransaction}
                onDuplicate={handleDuplicateTransaction}
                onAddNew={() => {
                  setEditingTransaction(null);
                  setIsTransactionModalOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* View 2: MOVIMIENTOS (Full Ledger) */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <TransactionList
              transactions={currentMonthTransactions}
              categories={categories}
              currencySymbol={settings.currencySymbol}
              onEdit={(t) => {
                setEditingTransaction(t);
                setIsTransactionModalOpen(true);
              }}
              onDelete={handleDeleteTransaction}
              onDuplicate={handleDuplicateTransaction}
              onAddNew={() => {
                setEditingTransaction(null);
                setIsTransactionModalOpen(true);
              }}
            />
          </div>
        )}

        {/* View 3: GRÁFICOS (Deep Analytics) */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <FinanceCharts
              monthlyData={allMonthlyData}
              selectedMonthKey={selectedMonthKey}
              onSelectMonth={setSelectedMonthKey}
              categoryExpenses={categoryExpenses}
              currentMonthTransactions={currentMonthTransactions}
              currencySymbol={settings.currencySymbol}
              daysInMonth={daysInSelectedMonth}
            />
          </div>
        )}

        {/* View 4: PRESUPUESTOS Y METAS */}
        {activeTab === 'budgets' && (
          <div className="space-y-6">
            <BudgetManager
              categories={categories}
              currentMonthTransactions={currentMonthTransactions}
              settings={settings}
              onUpdateSettings={setSettings}
              onUpdateCategoryBudget={handleUpdateCategoryBudget}
              onResetDefaults={handleResetDefaults}
              onClearAllTransactions={() => setIsClearConfirmOpen(true)}
              currencySymbol={settings.currencySymbol}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        initialTransaction={editingTransaction}
        currencySymbol={settings.currencySymbol}
        defaultDate={`${selectedMonthKey}-01`}
        onOpenCategoryManager={() => {
          setIsTransactionModalOpen(false);
          setIsCategoryModalOpen(true);
        }}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        currencySymbol={settings.currencySymbol}
      />

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
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Dialog for Clearing Demo Data */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-md w-full shadow-2xl">
            <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1.5">
              ¿Vaciar todos los datos de prueba?
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed mb-6">
              Se eliminarán todos los movimientos precargados para que comiences a registrar tus ingresos y gastos reales <strong>desde cero en limpio</strong>. Tus categorías y configuración de moneda se conservarán intactas.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteClearAll}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Sí, vaciar y empezar de cero
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean quiet footer */}
      <footer className="border-t border-neutral-200/80 bg-white py-6 text-xs text-neutral-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SamiLogo size="sm" showText={true} showTagline={true} customLogoUrl={settings.customLogoUrl} />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-neutral-400 text-center md:text-right">
            <span>Privacidad total - Tus finanzas almacenadas de forma local en tu navegador.</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>
              Desarrollado por :{' '}
              <a
                href="https://www.linkedin.com/in/sjtr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 hover:text-neutral-900 underline underline-offset-2 transition-colors font-medium"
              >
                https://www.linkedin.com/in/sjtr
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
