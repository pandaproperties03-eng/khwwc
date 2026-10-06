import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Input, Select, Modal, EmptyState } from '@/components/ui';
import { formatKes, formatDate, formatDateTime } from '@/utils/format';
import type { Sale } from '@/types';
import {
  CreditCard, Search, Eye, CheckCircle2, XCircle, Clock,
  TrendingUp, DollarSign, ChevronLeft, ChevronRight,
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export function PaymentsPage() {
  const { sales, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Sale | null>(null);

  const paymentRecords = useMemo(() => {
    return sales.map(s => ({
      id: s.id, receiptNo: s.receiptNo, date: s.createdAt, amount: s.total,
      method: s.paymentMethod, status: s.paymentStatus, phone: s.customerPhone,
      ref: s.paymentRef, cashier: s.cashierName,
    })).filter(r => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.receiptNo.toLowerCase().includes(q) && !(r.ref ?? '').toLowerCase().includes(q) && !(r.phone ?? '').includes(q)) return false;
      }
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [sales, search, statusFilter]);

  const totalPages = Math.ceil(paymentRecords.length / ITEMS_PER_PAGE);
  const paginated = paymentRecords.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const confirmed = sales.filter(s => s.paymentStatus === 'CONFIRMED');
  const confirmedTotal = confirmed.reduce((sum, s) => sum + s.total, 0);
  const failedCount = sales.filter(s => s.paymentStatus === 'FAILED').length;
  const pendingCount = sales.filter(s => s.paymentStatus === 'PENDING' || s.paymentStatus === 'PROCESSING').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-500 mt-1">Track all M-Pesa STK Push payment transactions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{confirmed.length}</p><p className="text-xs text-slate-500">Confirmed</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(confirmedTotal)}</p><p className="text-xs text-slate-500">Total Collected</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><XCircle className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{failedCount}</p><p className="text-xs text-slate-500">Failed</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{pendingCount}</p><p className="text-xs text-slate-500">Pending</p></div></div></Card>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input value={search} onChange={setSearch} placeholder="Search receipt, reference, phone..." icon={<Search className="w-4 h-4" />} />
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="All statuses" options={[{ value: 'CONFIRMED', label: 'Confirmed' }, { value: 'FAILED', label: 'Failed' }, { value: 'PENDING', label: 'Pending' }, { value: 'PROCESSING', label: 'Processing' }]} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={<CreditCard className="w-12 h-12" />} title="No payment records found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Receipt #</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Reference</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Amount</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Method</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{r.receiptNo}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-slate-600">{r.phone ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.ref ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatKes(r.amount)}</td>
                    <td className="px-4 py-3 text-center"><Badge color="green">M-Pesa STK</Badge></td>
                    <td className="px-4 py-3 text-center"><Badge color={r.status === 'CONFIRMED' ? 'green' : r.status === 'FAILED' ? 'red' : 'orange'}>{r.status}</Badge></td>
                    <td className="px-4 py-3 text-center"><button onClick={() => setSelected(sales.find(s => s.id === r.id) ?? null)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4" /></button></td>
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

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Payment Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 ${selected.paymentStatus === 'CONFIRMED' ? 'bg-green-50' : selected.paymentStatus === 'FAILED' ? 'bg-red-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-3">
                {selected.paymentStatus === 'CONFIRMED' ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : selected.paymentStatus === 'FAILED' ? <XCircle className="w-8 h-8 text-red-600" /> : <Clock className="w-8 h-8 text-yellow-600" />}
                <div>
                  <p className="font-semibold text-slate-900">{selected.paymentStatus}</p>
                  <p className="text-sm text-slate-500">{formatKes(selected.total)} via M-Pesa STK Push</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Receipt</p><p className="text-sm font-medium">{selected.receiptNo}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Date</p><p className="text-sm font-medium">{formatDateTime(selected.date)}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Customer Phone</p><p className="text-sm font-medium">{selected.customerPhone ?? '—'}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Payment Ref</p><p className="text-sm font-mono font-medium">{selected.paymentRef ?? '—'}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Cashier</p><p className="text-sm font-medium">{selected.cashierName}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Amount</p><p className="text-sm font-bold text-orange-600">{formatKes(selected.total)}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
