import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Category, PaymentMethod, Transaction, UserSettings } from '../types/finance';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, getInitialDemoTransactions, PAYMENT_METHODS } from './constants';

const TRANSACTIONS_KEY = 'sami_finance_transactions_v1';
const CATEGORIES_KEY = 'sami_finance_categories_v1';
const SETTINGS_KEY = 'sami_finance_settings_v1';

// Format currency
export function formatCurrency(amount: number, symbol = '$'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${symbol} ${formatted}`;
}

// Format date in Spanish readable format (e.g., "12 de Octubre, 2026")
export function formatDateES(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Storage helpers
export function loadStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      const initial = getInitialDemoTransactions();
      saveStoredTransactions(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading transactions from localStorage:', err);
    return getInitialDemoTransactions();
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions to localStorage:', err);
  }
}

export function loadStoredCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      saveStoredCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading categories from localStorage:', err);
    return DEFAULT_CATEGORIES;
  }
}

export function saveStoredCategories(categories: Category[]): void {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Error saving categories to localStorage:', err);
  }
}

export function loadStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      saveStoredSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading settings from localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage:', err);
  }
}

export function clearAllTransactions(): void {
  saveStoredTransactions([]);
}

export function resetToDemoData(): { transactions: Transaction[]; categories: Category[] } {
  const transactions = getInitialDemoTransactions();
  saveStoredTransactions(transactions);
  saveStoredCategories(DEFAULT_CATEGORIES);
  return { transactions, categories: DEFAULT_CATEGORIES };
}

export function clearAllData(): void {
  localStorage.removeItem(TRANSACTIONS_KEY);
  localStorage.removeItem(CATEGORIES_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}

// Payment method label
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const match = PAYMENT_METHODS.find((p) => p.id === method);
  return match ? match.label : method;
}

// Export to CSV
export function exportTransactionsToCSV(
  transactions: Transaction[],
  currencySymbol = '$',
  customFilename?: string
): void {
  const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Método de Pago', 'Notas'];

  const rows = transactions.map((t) => {
    const typeLabel = t.type === 'income' ? 'Ingreso' : 'Gasto';
    const amountVal = `${t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}`;
    const methodLabel = getPaymentMethodLabel(t.paymentMethod);
    const escape = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;

    return [
      t.date,
      typeLabel,
      escape(t.category),
      escape(t.description),
      amountVal,
      escape(methodLabel),
      escape(t.notes || ''),
    ].join(',');
  });

  // Prepend UTF-8 BOM so Excel opens with proper accents
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', customFilename || `sami_finanzas_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export to PDF
export function exportTransactionsToPDF(params: {
  transactions: Transaction[];
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  currencySymbol: string;
  userName?: string;
  categoryBreakdown: { name: string; amount: number; percentage: number; color: string }[];
}): void {
  const {
    transactions,
    monthLabel,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    currencySymbol,
    userName,
    categoryBreakdown,
  } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Brand
  doc.setFillColor(15, 44, 89); // navy brand (#0F2C59)
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Decorative logo accent line in gold and teal
  doc.setFillColor(6, 182, 212); // teal (#06B6D4)
  doc.rect(0, 26.5, pageWidth * 0.6, 1.5, 'F');
  doc.setFillColor(245, 158, 11); // amber (#F59E0B)
  doc.rect(pageWidth * 0.6, 26.5, pageWidth * 0.4, 1.5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SAMI', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(165, 243, 252); // cyan-200
  doc.text('Tus finanzas personales', 14, 20);

  // Date and User
  doc.setFontSize(9);
  doc.text(`Periodo: ${monthLabel}`, pageWidth - 14, 13, { align: 'right' });
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}${userName ? ` · ${userName}` : ''}`, pageWidth - 14, 20, { align: 'right' });

  // Summary Metrics Banner (Cards)
  let y = 36;
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardHeight = 20;

  const metrics = [
    { title: 'INGRESOS', val: formatCurrency(totalIncome, currencySymbol), color: [16, 185, 129] }, // emerald
    { title: 'GASTOS', val: formatCurrency(totalExpense, currencySymbol), color: [239, 68, 68] }, // red
    { title: 'BALANCE NETO', val: formatCurrency(netSavings, currencySymbol), color: netSavings >= 0 ? [16, 185, 129] : [239, 68, 68] },
    { title: 'TASA DE AHORRO', val: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 20 ? [16, 185, 129] : [217, 119, 6] },
  ];

  metrics.forEach((m, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(m.title, x + 3.5, y + 6);

    doc.setFontSize(10);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.val, x + 3.5, y + 14);
  });

  y += cardHeight + 10;

  // Breakdown by category table if expenses exist
  if (categoryBreakdown.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Distribución de Gastos por Categoría', 14, y);
    y += 3;

    const catRows = categoryBreakdown.map((c) => [
      c.name,
      formatCurrency(c.amount, currencySymbol),
      `${c.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Categoría', 'Gasto Total', '% del Total']],
      body: catRows,
      theme: 'grid',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 40, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    const lastAutoTable = (doc as any).lastAutoTable;
    y = lastAutoTable.finalY + 10;
  }

  // Transaction Ledger Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Detalle de Movimientos', 14, y);
  y += 3;

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const tableRows = sortedTransactions.map((t) => [
    t.date,
    t.type === 'income' ? 'Ingreso' : 'Gasto',
    t.category,
    t.description,
    getPaymentMethodLabel(t.paymentMethod),
    `${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount, currencySymbol)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Método', 'Monto']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 18 },
      2: { cellWidth: 42 },
      3: { cellWidth: 48 },
      4: { cellWidth: 26 },
      5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 15 },
  });

  // Footer page number
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Sami Finanzas Personales · Página ${i} de ${totalPages} · Confidencial`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  const cleanLabel = monthLabel.toLowerCase().replace(/\s+/g, '_');
  doc.save(`sami_reporte_${cleanLabel}.pdf`);
}
