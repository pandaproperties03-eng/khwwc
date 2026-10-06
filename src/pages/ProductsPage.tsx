import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Input, Select, Modal, EmptyState } from '@/components/ui';
import { formatKes } from '@/utils/format';
import type { Product } from '@/types';
import {
  Search, Plus, Pencil, Package, AlertTriangle, Boxes,
  TrendingUp, DollarSign, ChevronLeft, ChevronRight,
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export function ProductsPage() {
  const { products, categories, suppliers, addProduct, updateProduct, hasPermission, getProductStockStatus } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    sku: '', barcode: '', name: '', categoryId: '', description: '',
    sellingPrice: '', costPrice: '', unit: 'pc', stock: '0',
    minStock: '5', reorderLevel: '10', supplierId: '', imageEmoji: '🍽️',
  });

  const canEdit = hasPermission('products.create') || hasPermission('products.edit');

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q) && !p.barcode.includes(q)) return false;
      }
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [products, search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const stockValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const lowStock = products.filter(p => getProductStockStatus(p) === 'LOW_STOCK').length;
  const outOfStock = products.filter(p => getProductStockStatus(p) === 'OUT_OF_STOCK').length;

  const resetForm = () => {
    setForm({ sku: '', barcode: '', name: '', categoryId: '', description: '', sellingPrice: '', costPrice: '', unit: 'pc', stock: '0', minStock: '5', reorderLevel: '10', supplierId: '', imageEmoji: '🍽️' });
  };

  const handleSubmit = () => {
    if (!form.name || !form.sku || !form.categoryId) return;
    const input = {
      sku: form.sku, barcode: form.barcode || form.sku, name: form.name,
      categoryId: form.categoryId, description: form.description,
      sellingPrice: parseInt(form.sellingPrice) || 0, costPrice: parseInt(form.costPrice) || 0,
      unit: form.unit, stock: parseInt(form.stock) || 0, minStock: parseInt(form.minStock) || 0,
      reorderLevel: parseInt(form.reorderLevel) || 0,
      supplierId: form.supplierId || null, active: true, imageEmoji: form.imageEmoji,
    };
    if (editProduct) {
      updateProduct(editProduct.id, input);
    } else {
      addProduct(input);
    }
    setAddModalOpen(false);
    setEditProduct(null);
    resetForm();
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      sku: product.sku, barcode: product.barcode, name: product.name,
      categoryId: product.categoryId, description: product.description,
      sellingPrice: String(product.sellingPrice), costPrice: String(product.costPrice),
      unit: product.unit, stock: String(product.stock), minStock: String(product.minStock),
      reorderLevel: String(product.reorderLevel), supplierId: product.supplierId ?? '',
      imageEmoji: product.imageEmoji,
    });
    setAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">Manage your cafeteria menu items</p>
        </div>
        {canEdit && (
          <Button onClick={() => { setEditProduct(null); resetForm(); setAddModalOpen(true); }}>
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Package className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{products.length}</p><p className="text-xs text-slate-500">Total Products</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(stockValue)}</p><p className="text-xs text-slate-500">Stock Value</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{lowStock}</p><p className="text-xs text-slate-500">Low Stock</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><Boxes className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{outOfStock}</p><p className="text-xs text-slate-500">Out of Stock</p></div></div></Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input value={search} onChange={setSearch} placeholder="Search by name, SKU, barcode..." icon={<Search className="w-4 h-4" />} />
          <Select value={categoryFilter} onChange={setCategoryFilter} placeholder="All categories" options={categories.map(c => ({ value: c.id, label: c.name }))} />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={<Package className="w-12 h-12" />} title="No products found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">SKU</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Price</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Cost</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Margin</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Stock</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                  {canEdit && <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(product => {
                  const status = getProductStockStatus(product);
                  const margin = product.sellingPrice - product.costPrice;
                  const marginPct = product.sellingPrice > 0 ? ((margin / product.sellingPrice) * 100).toFixed(0) : '0';
                  const cat = categories.find(c => c.id === product.categoryId);
                  return (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{product.imageEmoji}</span>
                          <span className="font-medium text-slate-800">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{product.sku}</td>
                      <td className="px-4 py-3 text-slate-600">{cat?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-orange-600">{formatKes(product.sellingPrice)}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{formatKes(product.costPrice)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{marginPct}%</td>
                      <td className="px-4 py-3 text-center text-slate-700 font-medium">{product.stock}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge color={status === 'IN_STOCK' ? 'green' : status === 'LOW_STOCK' ? 'yellow' : 'red'}>
                          {status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => openEdit(product)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Pencil className="w-4 h-4" /></button>
                        </td>
                      )}
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

      {/* Add/Edit Modal */}
      <Modal open={addModalOpen} onClose={() => { setAddModalOpen(false); setEditProduct(null); }} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg"
        footer={<><Button variant="outline" onClick={() => { setAddModalOpen(false); setEditProduct(null); }}>Cancel</Button><Button onClick={handleSubmit}>{editProduct ? 'Update' : 'Create'}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Product Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Chapati" />
          <Input label="SKU" value={form.sku} onChange={v => setForm({ ...form, sku: v })} placeholder="e.g. BRK-001" />
          <Input label="Barcode" value={form.barcode} onChange={v => setForm({ ...form, barcode: v })} placeholder="6001000001" />
          <Select label="Category" value={form.categoryId} onChange={v => setForm({ ...form, categoryId: v })} placeholder="Select category" options={categories.map(c => ({ value: c.id, label: c.name }))} />
          <Input label="Selling Price (KSh)" type="number" value={form.sellingPrice} onChange={v => setForm({ ...form, sellingPrice: v })} placeholder="30" />
          <Input label="Cost Price (KSh)" type="number" value={form.costPrice} onChange={v => setForm({ ...form, costPrice: v })} placeholder="15" />
          <Input label="Unit" value={form.unit} onChange={v => setForm({ ...form, unit: v })} placeholder="pc, cup, plate" />
          <Input label="Emoji/Icon" value={form.imageEmoji} onChange={v => setForm({ ...form, imageEmoji: v })} placeholder="🍽️" />
          <Input label="Current Stock" type="number" value={form.stock} onChange={v => setForm({ ...form, stock: v })} />
          <Input label="Minimum Stock" type="number" value={form.minStock} onChange={v => setForm({ ...form, minStock: v })} />
          <Input label="Reorder Level" type="number" value={form.reorderLevel} onChange={v => setForm({ ...form, reorderLevel: v })} />
          <Select label="Supplier" value={form.supplierId} onChange={v => setForm({ ...form, supplierId: v })} placeholder="No supplier" options={suppliers.map(s => ({ value: s.id, label: s.companyName }))} />
          <div className="col-span-2">
            <Input label="Description" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Brief description..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}
