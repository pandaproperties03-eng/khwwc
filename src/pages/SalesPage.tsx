import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Input, Select, Modal, EmptyState } from '@/components/ui';
import { Receipt as ReceiptComponent } from '@/components/Receipt';
import { formatKes, formatDate, formatDateTime } from '@/utils/format';
import type { Sale } from '@/types';
import {
  Search, Eye, Printer, RotateCcw, ChevronLeft, ChevronRight,
  TrendingUp, ShoppingBag, CheckCircle2, XCircle, Clock,
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export function SalesPage() {
  const { sales, users, refundSale, currentUser, hasPermission } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [cashierFilter, setCashierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [refundSaleState, setRefundSaleState] = useState<Sale | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const filtered = useMemo(() => {
    return sales.filter(s => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.receiptNo.toLowerCase().includes(q) && !s.orderNo.toLowerCase().includes(q) && !(s.customerPhone ?? '').includes(q)) return false;
      }
      if (statusFilter && s.saleStatus !== statusFilter) return false;
      if (paymentFilter && s.paymentStatus !== paymentFilter) return false;
      if (cashierFilter && s.cashierId !== cashierFilter) return false;
      return true;
    });
  }, [sales, search, statusFilter, paymentFilter, cashierFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const todaySales = sales.filter(s => s.createdAt.startsWith(new Date().toISOString().split('T')[0]) && s.saleStatus === 'SALE_COMPLETED');
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const completedCount = sales.filter(s => s.saleStatus === 'SALE_COMPLETED').length;
  const failedCount = sales.filter(s => s.saleStatus === 'PAYMENT_FAILED').length;

  const handleRefund = () => {
    if (!refundSaleState || !currentUser) return;
    refundSale(refundSaleState.id, refundReason, currentUser.id, currentUser.name);
    setRefundSaleState(null);
    setRefundReason('');
    setSelectedSale(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sales</h1>
        <p className="text-slate-500 mt-1">View and manage all sales transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
            <div><p className="text-lg font-bold text-slate-900">{formatKes(todayRevenue)}</p><p className="text-xs text-slate-500">Today's Revenue</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><ShoppingBag className="w-5 h-5" /></div>
            <div><p className="text-lg font-bold text-slate-900">{todaySales.length}</p><p className="text-xs text-slate-500">Today's Orders</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
            <div><p className="text-lg font-bold text-slate-900">{completedCount}</p><p className="text-xs text-slate-500">Completed Sales</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><XCircle className="w-5 h-5" /></div>
            <div><p className="text-lg font-bold text-slate-900">{failedCount}</p><p className="text-xs text-slate-500">Failed Payments</p></div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input value={search} onChange={setSearch} placeholder="Search receipt, order, phone..." icon={<Search className="w-4 h-4" />} />
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="All statuses"
            options={[
              { value: 'SALE_COMPLETED', label: 'Completed' },
              { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
              { value: 'PAYMENT_PENDING', label: 'Payment Pending' },
              { value: 'REFUNDED', label: 'Refunded' },
            ]} />
          <Select value={paymentFilter} onChange={setPaymentFilter} placeholder="All payments"
            options={[
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'PROCESSING', label: 'Processing' },
            ]} />
          <Select value={cashierFilter} onChange={setCashierFilter} placeholder="All cashiers"
            options={users.filter(u => u.role === 'CASHIER' || u.role === 'MANAGER').map(u => ({ value: u.id, label: u.name }))} />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={<ShoppingBag className="w-12 h-12" />} title="No sales found" description="Try adjusting your filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Receipt #</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Cashier</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Amount</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Payment</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{sale.receiptNo}</p>
                      <p className="text-xs text-slate-400">{sale.orderNo}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(sale.date)}</td>
                    <td className="px-4 py-3 text-slate-600">{sale.cashierName}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatKes(sale.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge color={sale.paymentStatus === 'CONFIRMED' ? 'green' : sale.paymentStatus === 'FAILED' ? 'red' : 'orange'}>
                        {sale.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge color={sale.saleStatus === 'SALE_COMPLETED' ? 'green' : sale.saleStatus === 'REFUNDED' ? 'purple' : sale.saleStatus === 'PAYMENT_FAILED' ? 'red' : 'yellow'}>
                        {sale.saleStatus.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedSale(sale)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => setReceiptSale(sale)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" title="Receipt"><Printer className="w-4 h-4" /></button>
                        {hasPermission('sales.refund') && sale.saleStatus === 'SALE_COMPLETED' && (
                          <button onClick={() => setRefundSaleState(sale)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Refund"><RotateCcw className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">Page {page} of {totalPages} - {filtered.length} results</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Card>

      {/* Sale Detail Modal */}
      <Modal open={!!selectedSale} onClose={() => setSelectedSale(null)} title="Sale Details" size="lg">
        {selectedSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Receipt Number</p>
                <p className="font-medium text-slate-900">{selectedSale.receiptNo}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Order Number</p>
                <p className="font-medium text-slate-900">{selectedSale.orderNo}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Date & Time</p>
                <p className="font-medium text-slate-900">{formatDateTime(selectedSale.date)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Cashier</p>
                <p className="font-medium text-slate-900">{selectedSale.cashierName}</p>
              </div>
              {selectedSale.customerPhone && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Customer Phone</p>
                  <p className="font-medium text-slate-900">{selectedSale.customerPhone}</p>
                </div>
              )}
              {selectedSale.paymentRef && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Payment Reference</p>
                  <p className="font-mono text-sm font-medium text-slate-900">{selectedSale.paymentRef}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-slate-800 mb-2">Items</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Product</th>
                      <th className="text-center px-3 py-2 font-medium text-slate-600">Qty</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-600">Price</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-600">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSale.items.map(item => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-slate-800">{item.productName}</td>
                        <td className="px-3 py-2 text-center text-slate-600">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{formatKes(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900">{formatKes(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-600">Subtotal</span><span className="font-medium">{formatKes(selectedSale.subtotal)}</span></div>
              {selectedSale.discount > 0 && <div className="flex justify-between text-sm"><span className="text-slate-600">Discount</span><span className="font-medium">-{formatKes(selectedSale.discount)}</span></div>}
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2"><span className="text-slate-900">Total</span><span className="text-orange-600">{formatKes(selectedSale.total)}</span></div>
            </div>

            {selectedSale.refundReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800">Refunded: {selectedSale.refundReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Receipt Modal */}
      <Modal open={!!receiptSale} onClose={() => setReceiptSale(null)} title="Receipt" size="md">
        {receiptSale && <ReceiptComponent sale={receiptSale} onNewSale={() => setReceiptSale(null)} />}
      </Modal>

      {/* Refund Modal */}
      <Modal open={!!refundSaleState} onClose={() => setRefundSaleState(null)} title="Process Refund" size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRefundSaleState(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleRefund} disabled={!refundReason.trim()}>Confirm Refund</Button>
          </>
        }>
        {refundSaleState && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">You are about to refund <strong>{refundSaleState.receiptNo}</strong> for <strong>{formatKes(refundSaleState.total)}</strong></p>
              <p className="text-xs text-red-600 mt-1">This will restore stock, reverse the ledger entry, and create an audit record.</p>
            </div>
            <Input label="Refund Reason" value={refundReason} onChange={setRefundReason} placeholder="Enter reason for refund..." />
            <div className="bg-slate-50 rounded-lg p-3 space-y-1">
              {refundSaleState.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">{item.quantity}x {item.productName}</span>
                  <span className="font-medium">{formatKes(item.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1 mt-1">
                <span>Total Refund</span>
                <span className="text-red-600">{formatKes(refundSaleState.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
