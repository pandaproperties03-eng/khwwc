import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Input, Select, Modal, EmptyState } from '@/components/ui';
import { formatKes, formatDate, formatTimeAgo } from '@/utils/format';
import type { CustomerType } from '@/types';
import {
  Search, Plus, Eye, ChevronLeft, ChevronRight,
  Users as UsersIcon, TrendingUp, ShoppingBag,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export function CustomersPage() {
  const { customers, sales, addCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<typeof customers[0] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', staffNumber: '', department: '', facility: '', type: 'HEALTHCARE_WORKER' as CustomerType });

  const filtered = useMemo(() => {
    return customers.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.phone.includes(q) && !c.staffNumber.toLowerCase().includes(q)) return false;
      }
      if (typeFilter && c.type !== typeFilter) return false;
      return true;
    });
  }, [customers, search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSubmit = () => {
    if (!form.name) return;
    addCustomer(form);
    setAddOpen(false);
    setForm({ name: '', phone: '', staffNumber: '', department: '', facility: '', type: 'HEALTHCARE_WORKER' });
  };

  const selectedCustomerSales = selected ? sales.filter(s => s.customerPhone === selected.phone) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 mt-1">Healthcare workers and visitors who purchase at the cafeteria</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Customer</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><UsersIcon className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{customers.length}</p><p className="text-xs text-slate-500">Total Customers</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{customers.filter(c => c.type === 'HEALTHCARE_WORKER').length}</p><p className="text-xs text-slate-500">Healthcare Workers</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><ShoppingBag className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(customers.reduce((s, c) => s + c.totalSpent, 0))}</p><p className="text-xs text-slate-500">Total Spent</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><UsersIcon className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{customers.filter(c => c.status === 'ACTIVE').length}</p><p className="text-xs text-slate-500">Active</p></div></div></Card>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input value={search} onChange={setSearch} placeholder="Search name, phone, staff number..." icon={<Search className="w-4 h-4" />} />
          <Select value={typeFilter} onChange={setTypeFilter} placeholder="All types" options={[{ value: 'HEALTHCARE_WORKER', label: 'Healthcare Worker' }, { value: 'VISITOR', label: 'Visitor' }, { value: 'STAFF', label: 'Staff' }, { value: 'OTHER', label: 'Other' }]} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={<UsersIcon className="w-12 h-12" />} title="No customers found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Staff #</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Facility</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Total Spent</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Last Purchase</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.staffNumber || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{c.department}</td>
                    <td className="px-4 py-3 text-slate-600">{c.facility}</td>
                    <td className="px-4 py-3 text-center"><Badge color={c.type === 'HEALTHCARE_WORKER' ? 'blue' : c.type === 'STAFF' ? 'green' : 'gray'}>{c.type.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatKes(c.totalSpent)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{c.lastPurchase ? formatTimeAgo(c.lastPurchase) : '—'}</td>
                    <td className="px-4 py-3 text-center"><button onClick={() => setSelected(c)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4" /></button></td>
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
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? 'Customer'} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Phone</p><p className="text-sm font-medium">{selected.phone}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Staff Number</p><p className="text-sm font-medium">{selected.staffNumber || '—'}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Department</p><p className="text-sm font-medium">{selected.department}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Facility</p><p className="text-sm font-medium">{selected.facility}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Type</p><Badge color="blue">{selected.type.replace(/_/g, ' ')}</Badge></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Outstanding Balance</p><p className="text-sm font-medium">{formatKes(selected.outstandingBalance)}</p></div>
            </div>
            <div className="bg-green-50 rounded-lg p-4"><p className="text-xs text-slate-500">Total Spent</p><p className="text-2xl font-bold text-green-700">{formatKes(selected.totalSpent)}</p></div>
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Purchase History ({selectedCustomerSales.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedCustomerSales.slice(0, 10).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg">
                    <div><p className="text-sm font-medium text-slate-800">{s.receiptNo}</p><p className="text-xs text-slate-400">{formatDate(s.date)}</p></div>
                    <span className="text-sm font-medium text-slate-900">{formatKes(s.total)}</span>
                  </div>
                ))}
                {selectedCustomerSales.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No purchases recorded</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Customer" size="md"
        footer={<><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>Create</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <Input label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="0712345678" />
          <Input label="Staff Number" value={form.staffNumber} onChange={v => setForm({ ...form, staffNumber: v })} />
          <Input label="Department" value={form.department} onChange={v => setForm({ ...form, department: v })} />
          <Input label="Facility" value={form.facility} onChange={v => setForm({ ...form, facility: v })} />
          <Select label="Type" value={form.type} onChange={v => setForm({ ...form, type: v as CustomerType })} options={[{ value: 'HEALTHCARE_WORKER', label: 'Healthcare Worker' }, { value: 'VISITOR', label: 'Visitor' }, { value: 'STAFF', label: 'Staff' }, { value: 'OTHER', label: 'Other' }]} />
        </div>
      </Modal>
    </div>
  );
}
