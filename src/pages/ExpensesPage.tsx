import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Input, Select, Modal, EmptyState } from '@/components/ui';
import { formatKes, formatDate } from '@/utils/format';
import type { ExpenseCategory } from '@/types';
import {
  Receipt, Plus, Search, DollarSign, TrendingDown,
  ChevronLeft, ChevronRight, CheckCircle2, Clock,
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

const expenseCategories: ExpenseCategory[] = ['Utilities', 'Cleaning', 'Food supplies', 'Transport', 'Repairs', 'Maintenance', 'Stationery', 'Staff welfare', 'Other'];

export function ExpensesPage() {
  const { expenses, addExpense, currentUser, hasPermission } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ description: '', category: 'Utilities', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'CASH', reference: '', notes: '' });

  const canCreate = hasPermission('expenses.create');

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (search) {
        const q = search.toLowerCase();
        if (!e.description.toLowerCase().includes(q) && !e.reference.toLowerCase().includes(q)) return false;
      }
      if (categoryFilter && e.category !== categoryFilter) return false;
      return true;
    });
  }, [expenses, search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const todayExpenses = expenses.filter(e => e.date.startsWith(new Date().toISOString().split('T')[0])).reduce((sum, e) => sum + e.amount, 0);
  const pendingApproval = expenses.filter(e => e.approvalStatus === 'PENDING').length;
  const monthExpenses = expenses.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = () => {
    if (!form.description || !form.amount || !currentUser) return;
    addExpense({
      description: form.description, category: form.category as ExpenseCategory,
      amount: parseInt(form.amount) || 0, date: form.date,
      paymentMethod: form.paymentMethod, reference: form.reference || `EXP-${Date.now()}`,
      recordedBy: currentUser.name, notes: form.notes,
    });
    setAddOpen(false);
    setForm({ description: '', category: 'Utilities', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'CASH', reference: '', notes: '' });
  };

  // Category breakdown
  const categoryBreakdown = expenseCategories.map(cat => ({
    category: cat,
    total: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-500 mt-1">Track and manage business expenses</p>
        </div>
        {canCreate && <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Record Expense</Button>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(totalExpenses)}</p><p className="text-xs text-slate-500">Total Expenses</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><TrendingDown className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(todayExpenses)}</p><p className="text-xs text-slate-500">Today</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Receipt className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(monthExpenses)}</p><p className="text-xs text-slate-500">This Month</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{pendingApproval}</p><p className="text-xs text-slate-500">Pending Approval</p></div></div></Card>
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Expenses by Category</h3>
          <div className="space-y-2">
            {categoryBreakdown.map(c => (
              <div key={c.category} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-32">{c.category}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(c.total / categoryBreakdown[0].total) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-slate-800 w-24 text-right">{formatKes(c.total)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input value={search} onChange={setSearch} placeholder="Search description or reference..." icon={<Search className="w-4 h-4" />} />
          <Select value={categoryFilter} onChange={setCategoryFilter} placeholder="All categories" options={expenseCategories.map(c => ({ value: c, label: c }))} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={<Receipt className="w-12 h-12" />} title="No expenses found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Method</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Reference</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Recorded By</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{e.description}</td>
                    <td className="px-4 py-3"><Badge color="orange">{e.category}</Badge></td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">{formatKes(e.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{e.paymentMethod}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{e.reference}</td>
                    <td className="px-4 py-3 text-slate-600">{e.recordedBy}</td>
                    <td className="px-4 py-3 text-center"><Badge color={e.approvalStatus === 'APPROVED' ? 'green' : 'yellow'}>{e.approvalStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Record Expense" size="lg"
        footer={<><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>Record</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input label="Description" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="e.g. Electricity bill - October" /></div>
          <Select label="Category" value={form.category} onChange={v => setForm({ ...form, category: v })} options={expenseCategories.map(c => ({ value: c, label: c }))} />
          <Input label="Amount (KSh)" type="number" value={form.amount} onChange={v => setForm({ ...form, amount: v })} placeholder="500" />
          <Input label="Date" type="date" value={form.date} onChange={v => setForm({ ...form, date: v })} />
          <Select label="Payment Method" value={form.paymentMethod} onChange={v => setForm({ ...form, paymentMethod: v })} options={[{ value: 'CASH', label: 'Cash' }, { value: 'MPESA', label: 'M-Pesa' }, { value: 'BANK', label: 'Bank Transfer' }]} />
          <Input label="Reference" value={form.reference} onChange={v => setForm({ ...form, reference: v })} placeholder="EXP-001 (auto if blank)" />
          <div className="col-span-2"><Input label="Notes" value={form.notes} onChange={v => setForm({ ...form, notes: v })} placeholder="Additional notes..." /></div>
          {parseInt(form.amount) > 3000 && (
            <div className="col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              Expenses above KSh 3,000 require manager approval.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
