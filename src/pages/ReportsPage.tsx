import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Select, Input } from '@/components/ui';
import { BarChart, DonutChart } from '@/components/charts/Charts';
import { formatKes, formatKesShort, formatDate } from '@/utils/format';
import {
  BarChart3, TrendingUp, ShoppingBag, DollarSign, Download,
  FileText, Calendar, Package, AlertTriangle, Building2,
  Receipt, ScrollText, Users as UsersIcon, Clock,
} from 'lucide-react';

type ReportType = 'daily_sales' | 'weekly_sales' | 'monthly_sales' | 'sales_by_product' | 'sales_by_category' | 'sales_by_cashier' | 'payment_report' | 'refund_report' | 'inventory_valuation' | 'stock_movement' | 'low_stock' | 'purchase_report' | 'supplier_payables' | 'expense_report' | 'profit_loss' | 'cashier_shift' | 'audit_report';

const reportList: { key: ReportType; label: string; icon: React.ComponentType<{ className?: string }>; }[] = [
  { key: 'daily_sales', label: 'Daily Sales', icon: TrendingUp },
  { key: 'weekly_sales', label: 'Weekly Sales', icon: BarChart3 },
  { key: 'monthly_sales', label: 'Monthly Sales', icon: BarChart3 },
  { key: 'sales_by_product', label: 'Sales by Product', icon: ShoppingBag },
  { key: 'sales_by_category', label: 'Sales by Category', icon: Package },
  { key: 'sales_by_cashier', label: 'Sales by Cashier', icon: UsersIcon },
  { key: 'payment_report', label: 'Payment Report', icon: DollarSign },
  { key: 'refund_report', label: 'Refund Report', icon: Receipt },
  { key: 'inventory_valuation', label: 'Inventory Valuation', icon: Package },
  { key: 'stock_movement', label: 'Stock Movement', icon: BarChart3 },
  { key: 'low_stock', label: 'Low Stock', icon: AlertTriangle },
  { key: 'purchase_report', label: 'Purchase Report', icon: Building2 },
  { key: 'supplier_payables', label: 'Supplier Payables', icon: Building2 },
  { key: 'expense_report', label: 'Expense Report', icon: Receipt },
  { key: 'profit_loss', label: 'Profit & Loss', icon: DollarSign },
  { key: 'cashier_shift', label: 'Cashier Shift Report', icon: Clock },
  { key: 'audit_report', label: 'Audit Report', icon: ScrollText },
];

export function ReportsPage() {
  const { sales, products, categories, suppliers, purchaseOrders, expenses, shifts, auditLogs, users, stockMovements, getProductStockStatus } = useStore();
  const [selected, setSelected] = useState<ReportType>('daily_sales');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const completedSales = sales.filter(s => s.saleStatus === 'SALE_COMPLETED');

  const reportData = useMemo(() => {
    switch (selected) {
      case 'daily_sales': {
        const days: { label: string; value: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const dayStr = d.toISOString().split('T')[0];
          days.push({ label: d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric' }), value: completedSales.filter(s => s.createdAt.startsWith(dayStr)).reduce((sum, s) => sum + s.total, 0) });
        }
        return { type: 'bar', data: days, total: days.reduce((s, d) => s + d.value, 0) };
      }
      case 'weekly_sales': {
        const weeks: { label: string; value: number }[] = [];
        for (let i = 3; i >= 0; i--) {
          const start = new Date(); start.setDate(start.getDate() - i * 7 - 6);
          const end = new Date(); end.setDate(end.getDate() - i * 7);
          const weekSales = completedSales.filter(s => { const d = new Date(s.createdAt); return d >= start && d <= end; });
          weeks.push({ label: `W${4 - i}`, value: weekSales.reduce((sum, s) => sum + s.total, 0) });
        }
        return { type: 'bar', data: weeks, total: weeks.reduce((s, d) => s + d.value, 0) };
      }
      case 'monthly_sales': {
        const months: { label: string; value: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(); d.setMonth(d.getMonth() - i);
          const monthStr = d.toISOString().slice(0, 7);
          months.push({ label: d.toLocaleDateString('en-KE', { month: 'short' }), value: completedSales.filter(s => s.createdAt.startsWith(monthStr)).reduce((sum, s) => sum + s.total, 0) });
        }
        return { type: 'bar', data: months, total: months.reduce((s, d) => s + d.value, 0) };
      }
      case 'sales_by_product': {
        const map: Record<string, { name: string; count: number; revenue: number }> = {};
        completedSales.forEach(s => s.items.forEach(item => {
          if (!map[item.productId]) map[item.productId] = { name: item.productName, count: 0, revenue: 0 };
          map[item.productId].count += item.quantity; map[item.productId].revenue += item.subtotal;
        }));
        return { type: 'table', rows: Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 20), columns: ['Product', 'Units Sold', 'Revenue'], total: Object.values(map).reduce((s, v) => s + v.revenue, 0) };
      }
      case 'sales_by_category': {
        const data = categories.map(cat => {
          const value = completedSales.reduce((sum, s) => sum + s.items.filter(item => products.find(p => p.id === item.productId)?.categoryId === cat.id).reduce((cs, item) => cs + item.subtotal, 0), 0);
          return { label: cat.name, value, color: cat.color };
        }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
        return { type: 'donut', data, total: data.reduce((s, d) => s + d.value, 0) };
      }
      case 'sales_by_cashier': {
        const map: Record<string, { name: string; count: number; revenue: number }> = {};
        completedSales.forEach(s => {
          if (!map[s.cashierId]) map[s.cashierId] = { name: s.cashierName, count: 0, revenue: 0 };
          map[s.cashierId].count++; map[s.cashierId].revenue += s.total;
        });
        return { type: 'table', rows: Object.values(map).sort((a, b) => b.revenue - a.revenue), columns: ['Cashier', 'Transactions', 'Revenue'], total: Object.values(map).reduce((s, v) => s + v.revenue, 0) };
      }
      case 'payment_report': {
        const confirmed = completedSales.length;
        const failed = sales.filter(s => s.paymentStatus === 'FAILED').length;
        return { type: 'summary', cards: [
          { label: 'Confirmed Payments', value: String(confirmed), color: 'green' },
          { label: 'Failed Payments', value: String(failed), color: 'red' },
          { label: 'Total Collected', value: formatKes(completedSales.reduce((s, sa) => s + sa.total, 0)), color: 'green' },
          { label: 'Success Rate', value: `${confirmed + failed > 0 ? ((confirmed / (confirmed + failed)) * 100).toFixed(1) : 100}%`, color: 'blue' },
        ]};
      }
      case 'refund_report': {
        const refunded = sales.filter(s => s.saleStatus === 'REFUNDED');
        return { type: 'table', rows: refunded.map(s => ({ receiptNo: s.receiptNo, date: formatDate(s.date), amount: s.total, reason: s.refundReason ?? '—' })), columns: ['Receipt', 'Date', 'Amount', 'Reason'], total: refunded.reduce((s, sa) => s + sa.total, 0) };
      }
      case 'inventory_valuation': {
        return { type: 'table', rows: products.map(p => ({ name: p.name, stock: p.stock, cost: p.costPrice, value: p.stock * p.costPrice })).sort((a, b) => b.value - a.value), columns: ['Product', 'Stock', 'Unit Cost', 'Value'], total: products.reduce((s, p) => s + p.stock * p.costPrice, 0) };
      }
      case 'stock_movement': {
        return { type: 'table', rows: stockMovements.slice(0, 30).map(m => ({ product: m.productName, qty: m.quantity, type: m.type, date: formatDate(m.date), user: m.userName })), columns: ['Product', 'Qty', 'Type', 'Date', 'User'], total: 0 };
      }
      case 'low_stock': {
        const low = products.filter(p => { const st = getProductStockStatus(p); return st === 'LOW_STOCK' || st === 'OUT_OF_STOCK'; });
        return { type: 'table', rows: low.map(p => ({ name: p.name, stock: p.stock, min: p.minStock, reorder: p.reorderLevel, status: getProductStockStatus(p) })), columns: ['Product', 'Stock', 'Min', 'Reorder', 'Status'], total: low.length };
      }
      case 'purchase_report': {
        return { type: 'table', rows: purchaseOrders.map(po => ({ po: po.poNumber, supplier: po.supplierName, date: formatDate(po.createdAt), total: po.total, status: po.paymentStatus })).slice(0, 20), columns: ['PO', 'Supplier', 'Date', 'Total', 'Payment'], total: purchaseOrders.reduce((s, po) => s + po.total, 0) };
      }
      case 'supplier_payables': {
        return { type: 'table', rows: suppliers.map(s => ({ name: s.companyName, opening: s.openingBalance, terms: s.paymentTerms, status: s.status })), columns: ['Supplier', 'Opening Balance', 'Terms', 'Status'], total: suppliers.reduce((s, sup) => s + sup.openingBalance, 0) };
      }
      case 'expense_report': {
        return { type: 'table', rows: expenses.map(e => ({ date: formatDate(e.date), desc: e.description, cat: e.category, amount: e.amount })).slice(0, 20), columns: ['Date', 'Description', 'Category', 'Amount'], total: expenses.reduce((s, e) => s + e.amount, 0) };
      }
      case 'profit_loss': {
        const revenue = completedSales.reduce((s, sa) => s + sa.total, 0);
        const cogs = completedSales.reduce((s, sa) => s + sa.items.reduce((p, item) => { const prod = products.find(pr => pr.id === item.productId); return p + (prod?.costPrice ?? 0) * item.quantity; }, 0), 0);
        const grossProfit = revenue - cogs;
        const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
        const netProfit = grossProfit - totalExpenses;
        return { type: 'summary', cards: [
          { label: 'Revenue', value: formatKes(revenue), color: 'green' },
          { label: 'COGS', value: formatKes(cogs), color: 'red' },
          { label: 'Gross Profit', value: formatKes(grossProfit), color: 'blue' },
          { label: 'Expenses', value: formatKes(totalExpenses), color: 'orange' },
          { label: 'Net Profit', value: formatKes(netProfit), color: netProfit >= 0 ? 'green' : 'red' },
          { label: 'Margin', value: `${revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0}%`, color: 'blue' },
        ]};
      }
      case 'cashier_shift': {
        return { type: 'table', rows: shifts.map(s => ({ cashier: s.cashierName, date: formatDate(s.date), float: s.openingFloat, sales: s.totalSales, expected: s.expectedCash, actual: s.actualCash, diff: s.difference })), columns: ['Cashier', 'Date', 'Float', 'Sales', 'Expected', 'Actual', 'Diff'], total: shifts.reduce((s, sh) => s + sh.totalSales, 0) };
      }
      case 'audit_report': {
        return { type: 'table', rows: auditLogs.slice(0, 30).map(a => ({ user: a.userName, action: a.action, desc: a.description, date: formatDate(a.timestamp) })), columns: ['User', 'Action', 'Description', 'Date'], total: auditLogs.length };
      }
      default:
        return { type: 'none' as const, data: [] };
    }
  }, [selected, completedSales, sales, products, categories, suppliers, purchaseOrders, expenses, shifts, auditLogs, stockMovements, getProductStockStatus]);

  const canExport = true;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">Generate and export business reports</p>
        </div>
        {canExport && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Download className="w-4 h-4" /> PDF</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4" /> CSV</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4" /> Excel</Button>
          </div>
        )}
      </div>

      {/* Report selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {reportList.map(r => {
          const Icon = r.icon;
          const active = selected === r.key;
          return (
            <button key={r.key} onClick={() => setSelected(r.key)} className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium text-center leading-tight">{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date filters */}
      <Card className="p-4">
        <div className="flex items-end gap-3 flex-wrap">
          <Input label="From Date" type="date" value={dateFrom} onChange={setDateFrom} className="w-auto" />
          <Input label="To Date" type="date" value={dateTo} onChange={setDateTo} className="w-auto" />
          <Button variant="outline">Apply Filter</Button>
        </div>
      </Card>

      {/* Report content */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">{reportList.find(r => r.key === selected)?.label}</h3>

        {reportData.type === 'bar' && (
          <>
            <div className="mb-4"><span className="text-sm text-slate-500">Total: </span><span className="font-bold text-orange-600">{formatKes(reportData.total)}</span></div>
            <BarChart data={reportData.data} formatValue={formatKesShort} height={250} />
          </>
        )}

        {reportData.type === 'donut' && (
          <>
            <div className="mb-4"><span className="text-sm text-slate-500">Total: </span><span className="font-bold text-orange-600">{formatKes(reportData.total)}</span></div>
            <DonutChart data={reportData.data} size={200} />
          </>
        )}

        {reportData.type === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{reportData.columns.map(col => <th key={col} className="text-left px-4 py-2 font-medium text-slate-600">{col}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-4 py-2 text-slate-700">{typeof val === 'number' && reportData.columns[j] !== 'Qty' ? formatKes(val) : String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.total > 0 && <div className="mt-3 text-sm text-slate-500">Total: <span className="font-bold text-slate-900">{typeof reportData.total === 'number' && reportData.columns.includes('Revenue') ? formatKes(reportData.total) : reportData.total}</span></div>}
          </div>
        )}

        {reportData.type === 'summary' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.cards.map((card, i) => (
              <div key={i} className={`p-4 rounded-lg ${card.color === 'green' ? 'bg-green-50' : card.color === 'red' ? 'bg-red-50' : card.color === 'blue' ? 'bg-blue-50' : card.color === 'orange' ? 'bg-orange-50' : 'bg-slate-50'}`}>
                <p className={`text-xs font-medium ${card.color === 'green' ? 'text-green-600' : card.color === 'red' ? 'text-red-600' : card.color === 'blue' ? 'text-blue-600' : card.color === 'orange' ? 'text-orange-600' : 'text-slate-600'}`}>{card.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
