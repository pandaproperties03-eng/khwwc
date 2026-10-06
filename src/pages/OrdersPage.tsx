import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, EmptyState } from '@/components/ui';
import { formatDateTime, formatKes } from '@/utils/format';
import { ClipboardList, Search } from 'lucide-react';
import { Input } from '@/components/ui';

const ITEMS_PER_PAGE = 15;

export function OrdersPage() {
  const { sales, heldOrders } = useStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return sales.filter(s => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.orderNo.toLowerCase().includes(q) && !s.receiptNo.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sales, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const pendingOrders = sales.filter(s => s.saleStatus === 'ORDER_CREATED' || s.saleStatus === 'PAYMENT_PENDING').length;
  const completedOrders = sales.filter(s => s.saleStatus === 'SALE_COMPLETED').length;
  const failedOrders = sales.filter(s => s.saleStatus === 'PAYMENT_FAILED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-500 mt-1">View all customer orders and their fulfillment status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><ClipboardList className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{sales.length}</p><p className="text-xs text-slate-500">Total Orders</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center"><ClipboardList className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{pendingOrders}</p><p className="text-xs text-slate-500">Pending</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><ClipboardList className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{completedOrders}</p><p className="text-xs text-slate-500">Completed</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><ClipboardList className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{failedOrders}</p><p className="text-xs text-slate-500">Failed</p></div></div></Card>
      </div>

      {heldOrders.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <p className="text-sm font-medium text-amber-800">{heldOrders.length} held order(s) waiting to be resumed</p>
        </Card>
      )}

      <Card className="p-4">
        <Input value={search} onChange={setSearch} placeholder="Search order number..." icon={<Search className="w-4 h-4" />} />
      </Card>

      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={<ClipboardList className="w-12 h-12" />} title="No orders found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Order #</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Receipt #</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Cashier</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Items</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.orderNo}</td>
                    <td className="px-4 py-3 text-slate-600">{s.receiptNo}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDateTime(s.date)}</td>
                    <td className="px-4 py-3 text-slate-600">{s.cashierName}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{s.items.length}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatKes(s.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge color={s.saleStatus === 'SALE_COMPLETED' ? 'green' : s.saleStatus === 'PAYMENT_FAILED' ? 'red' : s.saleStatus === 'REFUNDED' ? 'purple' : 'yellow'}>
                        {s.saleStatus.replace(/_/g, ' ')}
                      </Badge>
                    </td>
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
