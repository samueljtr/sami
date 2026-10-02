import React, { useState } from 'react';
import { MonthData, Transaction, UserSettings } from '../types/finance';
import { exportTransactionsToCSV, exportTransactionsToPDF, formatCurrency } from '../utils/storage';
import { SamiLogo } from './SamiLogo';
import {
  X,
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  Calendar,
  Database,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentMonthTransactions: Transaction[];
  currentMonthData: MonthData;
  settings: UserSettings;
  categoryExpenses: { name: string; amount: number; percentage: number; color: string }[];
  onImportBackup: (data: any) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentMonthTransactions,
  currentMonthData,
  settings,
  categoryExpenses,
  onImportBackup,
}) => {
  const [scope, setScope] = useState<'current_month' | 'all'>('current_month');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const targetTransactions = scope === 'current_month' ? currentMonthTransactions : transactions;

  // Handle CSV Export
  const handleExportCSV = () => {
    const filename =
      scope === 'current_month'
        ? `sami_finanzas_${currentMonthData.key}.csv`
        : `sami_finanzas_historico_completo.csv`;
    exportTransactionsToCSV(targetTransactions, settings.currencySymbol, filename);
  };

  // Handle PDF Export
  const handleExportPDF = () => {
    exportTransactionsToPDF({
      transactions: targetTransactions,
      monthLabel: scope === 'current_month' ? currentMonthData.label : 'Histórico Completo',
      totalIncome: targetTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpense: targetTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      netSavings:
        targetTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) -
        targetTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
      savingsRate: currentMonthData.savingsRate,
      currencySymbol: settings.currencySymbol,
      userName: settings.personName,
      categoryBreakdown: categoryExpenses,
    });
  };

  // Handle Direct Print
  const handleDirectPrint = () => {
    window.print();
  };

  // Handle Full JSON Backup Export
  const handleExportJSON = () => {
    const backupData = {
      app: 'Sami Finanzas',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions,
      settings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sami_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle JSON Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.transactions)) {
          onImportBackup(parsed);
          setImportError('');
          onClose();
        } else {
          setImportError('El archivo no contiene un formato de respaldo válido de Sami');
        }
      } catch (err) {
        setImportError('Error al leer el archivo JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <SamiLogo size="sm" showText={false} />
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Exportar Datos de Finanzas
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Descarga tus movimientos en CSV para hojas de cálculo o en PDF ejecutivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {importError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Alcance de la exportación
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl">
              <button
                type="button"
                onClick={() => setScope('current_month')}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all text-center ${
                  scope === 'current_month'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Mes Actual ({currentMonthData.label})
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all text-center ${
                  scope === 'all'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Todo el Histórico ({transactions.length} registros)
              </button>
            </div>
          </div>

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CSV Export Option */}
            <div className="p-4 rounded-xl border border-neutral-200/90 hover:border-emerald-500/60 transition-all flex flex-col justify-between bg-neutral-50/50">
              <div>
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900">
                  Formato CSV (.csv)
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Compatible con Microsoft Excel, Google Sheets y Numbers con codificación UTF-8.
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar CSV
              </button>
            </div>

            {/* PDF Export Option */}
            <div className="p-4 rounded-xl border border-neutral-200/90 hover:border-rose-500/60 transition-all flex flex-col justify-between bg-neutral-50/50">
              <div>
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900">
                  Formato PDF (.pdf)
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Reporte ejecutivo con KPIs, desglose por categorías y libro detallado de transacciones.
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleExportPDF}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PDF
                </button>
                <button
                  onClick={handleDirectPrint}
                  title="Imprimir vista de página"
                  className="p-2 text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Restore Section */}
          <div className="pt-4 border-t border-neutral-100">
            <h4 className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5 mb-2">
              <Database className="w-3.5 h-3.5 text-neutral-500" />
              Copia de Seguridad Completa (JSON)
            </h4>
            <div className="flex items-center justify-between gap-3 text-xs">
              <p className="text-neutral-500">
                Guarda o transfiere todos tus datos de localStorage entre dispositivos.
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportJSON}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  Descargar JSON
                </button>
                <label className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Restaurar
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
