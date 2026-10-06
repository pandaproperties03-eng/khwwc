import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Input, Select, Modal, EmptyState } from '@/components/ui';
import { formatKes, formatDate, formatDateTime } from '@/utils/format';
import type { Product } from '@/types';
import {
  Search, Boxes, AlertTriangle, PackageX, PackagePlus,
  TrendingUp, ArrowDownToLine, ArrowUpFromLine, Sliders,
  ChevronLeft, ChevronRight, MoveHorizontal,
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export function InventoryPage() {
  const { products, categories, stockMovements, receiveStock, adjustStock, currentUser, hasPermission, getProductStockStatus } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'inventory' | 'movements' | 'receive' | 'adjust'>('inventory');

  // Receive stock form
  const [recvSupplier, setRecvSupplier] = useState('');
  const [recvInvoice, setRecvInvoice] = useState('');
  const [recvDate, setRecvDate] = useState(new Date().toISOString().split('T')[0]);
  const [recvItems, setRecvItems] = useState<{ productId: string; quantity: string; unitCost: string }[]>([]);
  const [recvAdditional, setRecvAdditional] = useState('0');

  // Adjust stock form
  const [adjProduct, setAdjProduct] = useState('');
  const [adjNewQty, setAdjNewQty] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [adjType, setAdjType] = useState<'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'WASTE'>('ADJUSTMENT_IN');

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      }
      if (statusFilter) {
        if (getProductStockStatus(p) !== statusFilter) return false;
      }
      return true;
    });
  }, [products, search, statusFilter, getProductStockStatus]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const stockValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const lowStock = products.filter(p => getProductStockStatus(p) === 'LOW_STOCK').length;
  const outOfStock = products.filter(p => getProductStockStatus(p) === 'OUT_OF_STOCK').length;
  const receivedToday = stockMovements.filter(m => m.type === 'PURCHASE' && m.date.startsWith(new Date().toISOString().split('T')[0])).length;
  const adjustmentsCount = stockMovements.filter(m => m.type.includes('ADJUSTMENT') || m.type === 'WASTE').length;

  const canReceive = hasPermission('inventory.receive');
  const canAdjust = hasPermission('inventory.adjust');

  const addRecvItem = () => {
    setRecvItems(prev => [...prev, { productId: '', quantity: '1', unitCost: '0' }]);
  };
  const updateRecvItem = (idx: number, field: string, value: string) => {
    setRecvItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const removeRecvItem = (idx: number) => {
    setRecvItems(prev => prev.filter((_, i) => i !== idx));
  };

  const recvSubtotal = recvItems.reduce((sum, item) => {
    const qty = parseInt(item.quantity) || 0;
    const cost = parseInt(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);
  const recvTotal = recvSubtotal + (parseInt(recvAdditional) || 0);

  const handleReceiveStock = () => {
    if (!recvSupplier || recvItems.length === 0) return;
    const validItems = recvItems.filter(i => i.productId && parseInt(i.quantity) > 0);
    if (validItems.length === 0) return;
    receiveStock({
      supplierId: recvSupplier,
      supplierInvoiceNo: recvInvoice || `INV-${Date.now()}`,
      deliveryDate: recvDate,
      items: validItems.map(i => ({ productId: i.productId, quantity: parseInt(i.quantity), unitCost: parseInt(i.unitCost) || 0 })),
      additionalCosts: parseInt(recvAdditional) || 0,
      receivedBy: currentUser?.name ?? '',
    });
    setRecvSupplier(''); setRecvInvoice(''); setRecvItems([]); setRecvAdditional('0');
    setTab('inventory');
  };

  const handleAdjustStock = () => {
    if (!adjProduct || !adjNewQty || !adjReason || !currentUser) return;
    adjustStock({
      productId: adjProduct,
      newQuantity: parseInt(adjNewQty),
      reason: adjReason,
      type: adjType,
      userId: currentUser.id,
      userName: currentUser.name,
    });
    setAdjProduct(''); setAdjNewQty(''); setAdjReason(''); setAdjType('ADJUSTMENT_IN');
    setTab('inventory');
  };

  const movementTypeBadge = (type: string) => {
    const map: Record<string, 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'gray'> = {
      PURCHASE: 'blue', SALE: 'red', REFUND: 'green', ADJUSTMENT_IN: 'yellow',
      ADJUSTMENT_OUT: 'orange', WASTE: 'red', OPENING_BALANCE: 'gray',
    };
    return map[type] ?? 'gray';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 mt-1">Track stock levels, receive deliveries, and adjust inventory</p>
        </div>
        {(canReceive || canAdjust) && (
          <div className="flex gap-2">
            {canReceive && <Button onClick={() => setTab('receive')}><ArrowDownToLine className="w-4 h-4" /> Receive Stock</Button>}
            {canAdjust && <Button variant="outline" onClick={() => setTab('adjust')}><Sliders className="w-4 h-4" /> Adjust Stock</Button>}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Boxes className="w-4.5 h-4.5" /></div><div><p className="text-lg font-bold text-slate-900">{products.length}</p><p className="text-xs text-slate-500">Stock Items</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><TrendingUp className="w-4.5 h-4.5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(stockValue)}</p><p className="text-xs text-slate-500">Stock Value</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center"><AlertTriangle className="w-4.5 h-4.5" /></div><div><p className="text-lg font-bold text-slate-900">{lowStock}</p><p className="text-xs text-slate-500">Low Stock</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><PackageX className="w-4.5 h-4.5" /></div><div><p className="text-lg font-bold text-slate-900">{outOfStock}</p><p className="text-xs text-slate-500">Out of Stock</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><ArrowDownToLine className="w-4.5 h-4.5" /></div><div><p className="text-lg font-bold text-slate-900">{receivedToday}</p><p className="text-xs text-slate-500">Received Today</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><Sliders className="w-4.5 h-4.5" /></div><div><p className="text-lg font-bold text-slate-900">{adjustmentsCount}</p><p className="text-xs text-slate-500">Adjustments</p></div></div></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {(['inventory', 'movements', 'receive', 'adjust'] as const).filter(t => {
          if (t === 'receive' && !canReceive) return false;
          if (t === 'adjust' && !canAdjust) return false;
          return true;
        }).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'inventory' ? 'Stock List' : t === 'movements' ? 'Stock Movements' : t === 'receive' ? 'Receive Stock' : 'Adjust Stock'}
          </button>
        ))}
      </div>

      {/* Inventory Tab */}
      {tab === 'inventory' && (
        <>
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input value={search} onChange={setSearch} placeholder="Search by name or SKU..." icon={<Search className="w-4 h-4" />} />
              <Select value={statusFilter} onChange={setStatusFilter} placeholder="All statuses" options={[{ value: 'IN_STOCK', label: 'In Stock' }, { value: 'LOW_STOCK', label: 'Low Stock' }, { value: 'OUT_OF_STOCK', label: 'Out of Stock' }]} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            {paginated.length === 0 ? (
              <EmptyState icon={<Boxes className="w-12 h-12" />} title="No products found" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">SKU</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Product</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Stock</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Min</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Cost</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Value</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginated.map(p => {
                      const status = getProductStockStatus(p);
                      const cat = categories.find(c => c.id === p.categoryId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                          <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-xl">{p.imageEmoji}</span><span className="font-medium text-slate-800">{p.name}</span></div></td>
                          <td className="px-4 py-3 text-slate-600">{cat?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-900">{p.stock}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{p.minStock}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{formatKes(p.costPrice)}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-800">{formatKes(p.stock * p.costPrice)}</td>
                          <td className="px-4 py-3 text-center"><Badge color={status === 'IN_STOCK' ? 'green' : status === 'LOW_STOCK' ? 'yellow' : 'red'}>{status.replace(/_/g, ' ')}</Badge></td>
                        </tr>
                      );
                    })}
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
        </>
      )}

      {/* Movements Tab */}
      {tab === 'movements' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Product</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Qty</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Previous</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">New</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Reference</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.slice(0, 50).map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDateTime(m.date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{m.productName}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-900">{m.quantity > 0 ? '+' : ''}{m.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{m.previousQty}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{m.newQty}</td>
                    <td className="px-4 py-3 text-center"><Badge color={movementTypeBadge(m.type)}>{m.type.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{m.reference}</td>
                    <td className="px-4 py-3 text-slate-600">{m.userName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Receive Stock Tab */}
      {tab === 'receive' && canReceive && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Receive Stock from Supplier</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="Supplier" value={recvSupplier} onChange={setRecvSupplier} placeholder="Select supplier" options={useStore().suppliers.map(s => ({ value: s.id, label: s.companyName }))} />
              <Input label="Supplier Invoice #" value={recvInvoice} onChange={setRecvInvoice} placeholder="INV-001" />
              <Input label="Delivery Date" type="date" value={recvDate} onChange={setRecvDate} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-slate-700">Products</h4>
                <Button size="sm" variant="outline" onClick={addRecvItem}><PackagePlus className="w-4 h-4" /> Add Item</Button>
              </div>
              {recvItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  <PackagePlus className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Click "Add Item" to add products to receive</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recvItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-6"><Select label={idx === 0 ? "Product" : undefined} value={item.productId} onChange={v => updateRecvItem(idx, 'productId', v)} placeholder="Select product" options={products.map(p => ({ value: p.id, label: `${p.imageEmoji} ${p.name} (Stock: ${p.stock})` }))} /></div>
                      <div className="col-span-2"><Input label={idx === 0 ? "Qty" : undefined} type="number" value={item.quantity} onChange={v => updateRecvItem(idx, 'quantity', v)} placeholder="10" /></div>
                      <div className="col-span-2"><Input label={idx === 0 ? "Unit Cost" : undefined} type="number" value={item.unitCost} onChange={v => updateRecvItem(idx, 'unitCost', v)} placeholder="50" /></div>
                      <div className="col-span-1"><p className="text-sm text-slate-600">{formatKes((parseInt(item.quantity) || 0) * (parseInt(item.unitCost) || 0))}</p></div>
                      <div className="col-span-1"><button onClick={() => removeRecvItem(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg w-full">Remove</button></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {recvItems.length > 0 && (
              <>
                <Input label="Additional Costs (Transport, etc.)" type="number" value={recvAdditional} onChange={setRecvAdditional} placeholder="0" />
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-600">Subtotal</span><span className="font-medium">{formatKes(recvSubtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-600">Additional Costs</span><span className="font-medium">{formatKes(parseInt(recvAdditional) || 0)}</span></div>
                  <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2"><span>Total</span><span className="text-orange-600">{formatKes(recvTotal)}</span></div>
                </div>
                <Button fullWidth size="lg" onClick={handleReceiveStock} disabled={!recvSupplier || recvItems.length === 0}>
                  <ArrowDownToLine className="w-5 h-5" /> Receive Stock
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Adjust Stock Tab */}
      {tab === 'adjust' && canAdjust && (
        <Card className="p-6 max-w-lg">
          <h3 className="font-semibold text-slate-900 mb-4">Stock Adjustment</h3>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">Adjustments are logged with full audit trail. Use wisely.</p>
            </div>
            <Select label="Product" value={adjProduct} onChange={setAdjProduct} placeholder="Select product" options={products.map(p => ({ value: p.id, label: `${p.imageEmoji} ${p.name} (Current: ${p.stock})` }))} />
            {adjProduct && (
              <p className="text-sm text-slate-500">Current stock: <strong>{products.find(p => p.id === adjProduct)?.stock}</strong></p>
            )}
            <Input label="New Quantity" type="number" value={adjNewQty} onChange={setAdjNewQty} placeholder="Enter new stock count" />
            <Select label="Adjustment Type" value={adjType} onChange={v => setAdjType(v as typeof adjType)} options={[{ value: 'ADJUSTMENT_IN', label: 'Adjustment In (Gain)' }, { value: 'ADJUSTMENT_OUT', label: 'Adjustment Out (Loss)' }, { value: 'WASTE', label: 'Waste / Damaged' }]} />
            <Input label="Reason" value={adjReason} onChange={setAdjReason} placeholder="Explain the reason for adjustment..." />
            <Button fullWidth size="lg" onClick={handleAdjustStock} disabled={!adjProduct || !adjNewQty || !adjReason}>
              <Sliders className="w-5 h-5" /> Submit Adjustment
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
