import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Input, Select, EmptyState } from '@/components/ui';
import { formatKes, formatDateTime, formatDate } from '@/utils/format';
import type { LedgerEntryType } from '@/types';
import {
  BookOpen, Search, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, DollarSign,
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const typeColors: Record<LedgerEntryType, 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'gray' | 'yellow'> = {
  SALE: 'green', PURCHASE: 'blue', PAYMENT: 'green', EXPENSE: 'red',
  REFUND: 'red', SUPPLIER_PAYMENT: 'orange', ADJUSTMENT: 'yellow',
};

export function LedgerPage() {
  const { ledgerEntries } = useStore();
  const [tab, setTab] = useState<'all' | LedgerEntryType>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return ledgerEntries.filter(e => {
      if (tab !== 'all' && e.type !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!e.reference.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q) && !e.userName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [ledgerEntries, tab, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalCredit = ledgerEntries.reduce((sum, e) => sum + e.credit, 0);
  const totalDebit = ledgerEntries.reduce((sum, e) => sum + e.debit, 0);
  const currentBalance = ledgerEntries[ledgerEntries.length - 1]?.balance ?? 0;

  const tabs: { key: 'all' | LedgerEntryType; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'SALE', label: 'Sales' },
    { key: 'PURCHASE', label: 'Purchases' }, { key: 'PAYMENT', label: 'Payments' },
    { key: 'EXPENSE', label: 'Expenses' }, { key: 'REFUND', label: 'Refunds' },
    { key: 'SUPPLIER_PAYMENT', label: 'Supplier Payments' }, { key: 'ADJUSTMENT', label: 'Adjustments' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial Ledger</h1>
        <p className="text-slate-500 mt-1">Immutable record of all financial transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(totalCredit)}</p><p className="text-xs text-slate-500">Total Credits</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><TrendingDown className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(totalDebit)}</p><p className="text-xs text-slate-500">Total Debits</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(currentBalance)}</p><p className="text-xs text-slate-500">Current Balance</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><BookOpen className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{ledgerEntries.length}</p><p className="text-xs text-slate-500">Total Entries</p></div></div></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.label}</button>
        ))}
      </div>

      <Card className="p-4">
        <Input value={search} onChange={setSearch} placeholder="Search reference, description, user..." icon={<Search className="w-4 h-4" />} />
      </Card>

      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={<BookOpen className="w-12 h-12" />} title="No ledger entries found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Reference</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Debit</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Credit</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Balance</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDateTime(entry.date)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{entry.reference}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.description}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">{entry.debit > 0 ? formatKes(entry.debit) : '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">{entry.credit > 0 ? formatKes(entry.credit) : '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{formatKes(entry.balance)}</td>
                    <td className="px-4 py-3 text-center"><Badge color={typeColors[entry.type]}>{entry.type.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-4 py-3 text-slate-600">{entry.userName}</td>
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
    </div>
  );
}
