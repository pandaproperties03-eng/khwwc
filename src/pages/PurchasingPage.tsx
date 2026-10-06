import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Input, Select, Modal, EmptyState } from '@/components/ui';
import { formatKes, formatDate } from '@/utils/format';
import type { PurchaseOrder, POStatus } from '@/types';
import {
  Truck, Plus, Eye, Search, Package, DollarSign,
  ChevronLeft, ChevronRight, PackagePlus,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const statusColors: Record<POStatus, 'gray' | 'blue' | 'green' | 'yellow' | 'orange' | 'red'> = {
  DRAFT: 'gray', SUBMITTED: 'blue', APPROVED: 'green',
  PARTIALLY_RECEIVED: 'yellow', RECEIVED: 'green', CANCELLED: 'red',
};

export function PurchasingPage() {
  const { purchaseOrders, suppliers, products, createPurchaseOrder, hasPermission, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    supplierId: '', supplierInvoiceNo: '', expectedDelivery: new Date().toISOString().split('T')[0], additionalCosts: '0',
  });
  const [poItems, setPoItems] = useState<{ productId: string; productName: string; quantity: string; unitCost: string }[]>([]);

  const canCreate = hasPermission('purchases.create');

  const filtered = useMemo(() => {
    return purchaseOrders.filter(po => {
      if (search) {
        const q = search.toLowerCase();
        if (!po.poNumber.toLowerCase().includes(q) && !po.supplierName.toLowerCase().includes(q) && !po.supplierInvoiceNo.toLowerCase().includes(q)) return false;
      }
      if (statusFilter && po.status !== statusFilter) return false;
      return true;
    });
  }, [purchaseOrders, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalPurchases = purchaseOrders.reduce((sum, po) => sum + po.total, 0);
  const pendingPOs = purchaseOrders.filter(po => po.status === 'SUBMITTED' || po.status === 'APPROVED').length;
  const receivedPOs = purchaseOrders.filter(po => po.status === 'RECEIVED').length;
  const unpaidPOs = purchaseOrders.filter(po => po.paymentStatus !== 'PAID' && po.status !== 'CANCELLED').reduce((sum, po) => sum + po.total, 0);

  const addPoItem = () => {
    setPoItems(prev => [...prev, { productId: '', productName: '', quantity: '1', unitCost: '0' }]);
  };
  const updatePoItem = (idx: number, field: string, value: string) => {
    setPoItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        return { ...item, productId: value, productName: product?.name ?? '', unitCost: String(product?.costPrice ?? 0) };
      }
      return { ...item, [field]: value };
    }));
  };
  const removePoItem = (idx: number) => setPoItems(prev => prev.filter((_, i) => i !== idx));

  const poSubtotal = poItems.reduce((sum, i) => sum + (parseInt(i.quantity) || 0) * (parseInt(i.unitCost) || 0), 0);
  const poTotal = poSubtotal + (parseInt(form.additionalCosts) || 0);

  const handleCreate = () => {
    if (!form.supplierId || poItems.length === 0 || !currentUser) return;
    const supplier = suppliers.find(s => s.id === form.supplierId);
    createPurchaseOrder({
      supplierId: form.supplierId,
      supplierName: supplier?.companyName ?? '',
      items: poItems.filter(i => i.productId).map(i => ({ productId: i.productId, productName: i.productName, quantity: parseInt(i.quantity), unitCost: parseInt(i.unitCost) || 0 })),
      additionalCosts: parseInt(form.additionalCosts) || 0,
      expectedDelivery: form.expectedDelivery,
      createdBy: currentUser.name,
      supplierInvoiceNo: form.supplierInvoiceNo || `INV-${Date.now()}`,
    });
    setCreateOpen(false);
    setForm({ supplierId: '', supplierInvoiceNo: '', expectedDelivery: new Date().toISOString().split('T')[0], additionalCosts: '0' });
    setPoItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchasing</h1>
          <p className="text-slate-500 mt-1">Purchase orders and stock procurement</p>
        </div>
        {canCreate && <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Create Purchase Order</Button>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Truck className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{purchaseOrders.length}</p><p className="text-xs text-slate-500">Total POs</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center"><Package className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{pendingPOs}</p><p className="text-xs text-slate-500">Pending</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><Package className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{receivedPOs}</p><p className="text-xs text-slate-500">Received</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(unpaidPOs)}</p><p className="text-xs text-slate-500">Unpaid</p></div></div></Card>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input value={search} onChange={setSearch} placeholder="Search PO number, supplier, invoice..." icon={<Search className="w-4 h-4" />} />
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="All statuses" options={[
            { value: 'DRAFT', label: 'Draft' }, { value: 'SUBMITTED', label: 'Submitted' },
            { value: 'APPROVED', label: 'Approved' }, { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
            { value: 'RECEIVED', label: 'Received' }, { value: 'CANCELLED', label: 'Cancelled' },
          ]} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={<Truck className="w-12 h-12" />} title="No purchase orders found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">PO Number</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Supplier</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Invoice #</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Payment</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{po.poNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{po.supplierName}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{po.supplierInvoiceNo}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(po.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatKes(po.total)}</td>
                    <td className="px-4 py-3 text-center"><Badge color={statusColors[po.status]}>{po.status.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-4 py-3 text-center"><Badge color={po.paymentStatus === 'PAID' ? 'green' : po.paymentStatus === 'PENDING' ? 'yellow' : 'orange'}>{po.paymentStatus}</Badge></td>
                    <td className="px-4 py-3 text-center"><button onClick={() => setSelected(po)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4" /></button></td>
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
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Purchase Order ${selected.poNumber}` : ''} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Supplier</p><p className="text-sm font-medium">{selected.supplierName}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Invoice #</p><p className="text-sm font-medium">{selected.supplierInvoiceNo}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Date</p><p className="text-sm font-medium">{formatDate(selected.createdAt)}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Expected Delivery</p><p className="text-sm font-medium">{formatDate(selected.expectedDelivery)}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Created By</p><p className="text-sm font-medium">{selected.createdBy}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Approved By</p><p className="text-sm font-medium">{selected.approvedBy ?? '—'}</p></div>
            </div>
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Items</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50"><tr><th className="text-left px-3 py-2 font-medium text-slate-600">Product</th><th className="text-right px-3 py-2 font-medium text-slate-600">Qty</th><th className="text-right px-3 py-2 font-medium text-slate-600">Unit Cost</th><th className="text-right px-3 py-2 font-medium text-slate-600">Total</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {selected.items.map(item => (
                      <tr key={item.id}><td className="px-3 py-2 text-slate-800">{item.productName}</td><td className="px-3 py-2 text-right">{item.quantity}</td><td className="px-3 py-2 text-right">{formatKes(item.unitCost)}</td><td className="px-3 py-2 text-right font-medium">{formatKes(item.total)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-600">Subtotal</span><span>{formatKes(selected.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Additional Costs</span><span>{formatKes(selected.additionalCosts)}</span></div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2"><span>Total</span><span className="text-orange-600">{formatKes(selected.total)}</span></div>
            </div>
            <div className="flex gap-2">
              <Badge color={statusColors[selected.status]}>{selected.status.replace(/_/g, ' ')}</Badge>
              <Badge color={selected.paymentStatus === 'PAID' ? 'green' : 'yellow'}>{selected.paymentStatus}</Badge>
            </div>
          </div>
        )}
      </Modal>

      {/* Create PO Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Purchase Order" size="xl"
        footer={<><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!form.supplierId || poItems.length === 0}>Create PO</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Supplier" value={form.supplierId} onChange={v => setForm({ ...form, supplierId: v })} placeholder="Select supplier" options={suppliers.map(s => ({ value: s.id, label: s.companyName }))} />
            <Input label="Supplier Invoice #" value={form.supplierInvoiceNo} onChange={v => setForm({ ...form, supplierInvoiceNo: v })} />
            <Input label="Expected Delivery" type="date" value={form.expectedDelivery} onChange={v => setForm({ ...form, expectedDelivery: v })} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-slate-700">Products</h4>
              <Button size="sm" variant="outline" onClick={addPoItem}><PackagePlus className="w-4 h-4" /> Add Item</Button>
            </div>
            {poItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-lg"><PackagePlus className="w-8 h-8 mx-auto mb-2" /><p className="text-sm">Add products to this purchase order</p></div>
            ) : (
              <div className="space-y-2">
                {poItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-6"><Select label={idx === 0 ? "Product" : undefined} value={item.productId} onChange={v => updatePoItem(idx, 'productId', v)} placeholder="Select product" options={products.map(p => ({ value: p.id, label: p.name }))} /></div>
                    <div className="col-span-2"><Input label={idx === 0 ? "Qty" : undefined} type="number" value={item.quantity} onChange={v => updatePoItem(idx, 'quantity', v)} /></div>
                    <div className="col-span-2"><Input label={idx === 0 ? "Unit Cost" : undefined} type="number" value={item.unitCost} onChange={v => updatePoItem(idx, 'unitCost', v)} /></div>
                    <div className="col-span-1"><p className="text-xs text-slate-600">{formatKes((parseInt(item.quantity) || 0) * (parseInt(item.unitCost) || 0))}</p></div>
                    <div className="col-span-1"><button onClick={() => removePoItem(idx)} className="text-red-500 p-2 w-full">Remove</button></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {poItems.length > 0 && (
            <>
              <Input label="Additional Costs" type="number" value={form.additionalCosts} onChange={v => setForm({ ...form, additionalCosts: v })} />
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between text-sm"><span className="text-slate-600">Subtotal</span><span>{formatKes(poSubtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Additional</span><span>{formatKes(parseInt(form.additionalCosts) || 0)}</span></div>
                <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2"><span>Total</span><span className="text-orange-600">{formatKes(poTotal)}</span></div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
