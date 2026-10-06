import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Input, Select, Modal, EmptyState } from '@/components/ui';
import { formatKes, formatDate } from '@/utils/format';
import type { Supplier } from '@/types';
import {
  Search, Plus, Building2, DollarSign, TrendingUp, Eye,
  ChevronLeft, ChevronRight, Phone, Mail, MapPin,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export function SuppliersPage() {
  const { suppliers, purchaseOrders, supplierPayments, addSupplier, hasPermission } = useStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    companyName: '', contactPerson: '', phone: '', email: '',
    address: '', kraPin: '', paymentTerms: 'Net 30', openingBalance: '0', status: 'ACTIVE',
  });

  const canCreate = hasPermission('suppliers.create');

  const filtered = useMemo(() => {
    return suppliers.filter(s => {
      if (!search) return true;
      const q = search.toLowerCase();
      return s.companyName.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q) || s.phone.includes(q);
    });
  }, [suppliers, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeSuppliers = suppliers.filter(s => s.status === 'ACTIVE').length;
  const totalPayables = suppliers.reduce((sum, s) => sum + s.openingBalance, 0) + purchaseOrders.filter(po => po.paymentStatus !== 'PAID').reduce((sum, po) => sum + po.total, 0);
  const purchasesThisMonth = purchaseOrders.filter(po => po.createdAt.startsWith(new Date().toISOString().slice(0, 7))).length;

  const handleSubmit = () => {
    if (!form.companyName) return;
    addSupplier({
      companyName: form.companyName, contactPerson: form.contactPerson, phone: form.phone,
      email: form.email, address: form.address, kraPin: form.kraPin,
      paymentTerms: form.paymentTerms, openingBalance: parseInt(form.openingBalance) || 0,
      status: form.status as 'ACTIVE' | 'INACTIVE',
    });
    setAddOpen(false);
    setForm({ companyName: '', contactPerson: '', phone: '', email: '', address: '', kraPin: '', paymentTerms: 'Net 30', openingBalance: '0', status: 'ACTIVE' });
  };

  const supplierPOs = selected ? purchaseOrders.filter(po => po.supplierId === selected.id) : [];
  const supplierPaymentsList = selected ? supplierPayments.filter(sp => sp.supplierId === selected.id) : [];
  const supplierOutstanding = selected ? (selected.openingBalance + supplierPOs.filter(po => po.paymentStatus !== 'PAID').reduce((sum, po) => sum + po.total, 0) - supplierPaymentsList.reduce((sum, sp) => sum + sp.amount, 0)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-slate-500 mt-1">Manage suppliers and track payables</p>
        </div>
        {canCreate && <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Supplier</Button>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Building2 className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{suppliers.length}</p><p className="text-xs text-slate-500">Total Suppliers</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><Building2 className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{activeSuppliers}</p><p className="text-xs text-slate-500">Active</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(totalPayables)}</p><p className="text-xs text-slate-500">Outstanding Payables</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{purchasesThisMonth}</p><p className="text-xs text-slate-500">Purchases This Month</p></div></div></Card>
      </div>

      <Card className="p-4">
        <Input value={search} onChange={setSearch} placeholder="Search suppliers..." icon={<Search className="w-4 h-4" />} />
      </Card>

      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={<Building2 className="w-12 h-12" />} title="No suppliers found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Company</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Terms</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Opening Balance</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.companyName}</td>
                    <td className="px-4 py-3 text-slate-600">{s.contactPerson}</td>
                    <td className="px-4 py-3 text-slate-600">{s.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{s.paymentTerms}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatKes(s.openingBalance)}</td>
                    <td className="px-4 py-3 text-center"><Badge color={s.status === 'ACTIVE' ? 'green' : 'gray'}>{s.status}</Badge></td>
                    <td className="px-4 py-3 text-center"><button onClick={() => setSelected(s)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4" /></button></td>
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
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.companyName ?? 'Supplier'} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><div><p className="text-xs text-slate-500">Phone</p><p className="text-sm font-medium">{selected.phone}</p></div></div>
              <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><div><p className="text-xs text-slate-500">Email</p><p className="text-sm font-medium">{selected.email}</p></div></div>
              <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /><div><p className="text-xs text-slate-500">Address</p><p className="text-sm font-medium">{selected.address}</p></div></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">KRA PIN</p><p className="text-sm font-medium">{selected.kraPin}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Payment Terms</p><p className="text-sm font-medium">{selected.paymentTerms}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Opening Balance</p><p className="text-sm font-medium">{formatKes(selected.openingBalance)}</p></div>
            </div>

            <div className={`rounded-lg p-4 ${supplierOutstanding > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-xs text-slate-500">Outstanding Balance</p>
              <p className={`text-2xl font-bold ${supplierOutstanding > 0 ? 'text-red-700' : 'text-green-700'}`}>{formatKes(supplierOutstanding)}</p>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 mb-2">Purchase Orders ({supplierPOs.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {supplierPOs.slice(0, 10).map(po => (
                  <div key={po.id} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg">
                    <div><p className="text-sm font-medium text-slate-800">{po.poNumber}</p><p className="text-xs text-slate-400">{formatDate(po.createdAt)}</p></div>
                    <div className="flex items-center gap-2"><span className="text-sm font-medium">{formatKes(po.total)}</span><Badge color={po.paymentStatus === 'PAID' ? 'green' : po.paymentStatus === 'PENDING' ? 'yellow' : 'orange'}>{po.paymentStatus}</Badge></div>
                  </div>
                ))}
                {supplierPOs.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No purchase orders</p>}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 mb-2">Payments ({supplierPaymentsList.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {supplierPaymentsList.slice(0, 10).map(sp => (
                  <div key={sp.id} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg">
                    <div><p className="text-sm font-medium text-slate-800">{sp.paymentRef}</p><p className="text-xs text-slate-400">{formatDate(sp.date)} - {sp.notes}</p></div>
                    <div className="flex items-center gap-2"><span className="text-sm font-medium">{formatKes(sp.amount)}</span><Badge color="green">{sp.status}</Badge></div>
                  </div>
                ))}
                {supplierPaymentsList.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No payments recorded</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Supplier" size="lg"
        footer={<><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>Create</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" value={form.companyName} onChange={v => setForm({ ...form, companyName: v })} />
          <Input label="Contact Person" value={form.contactPerson} onChange={v => setForm({ ...form, contactPerson: v })} />
          <Input label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <Input label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
          <Input label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} />
          <Input label="KRA PIN" value={form.kraPin} onChange={v => setForm({ ...form, kraPin: v })} />
          <Select label="Payment Terms" value={form.paymentTerms} onChange={v => setForm({ ...form, paymentTerms: v })} options={[{ value: 'Net 7', label: 'Net 7' }, { value: 'Net 14', label: 'Net 14' }, { value: 'Net 30', label: 'Net 30' }, { value: 'Net 60', label: 'Net 60' }, { value: 'COD', label: 'Cash on Delivery' }]} />
          <Input label="Opening Balance (KSh)" type="number" value={form.openingBalance} onChange={v => setForm({ ...form, openingBalance: v })} />
        </div>
      </Modal>
    </div>
  );
}
