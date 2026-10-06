import { useState } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Input, Modal, EmptyState } from '@/components/ui';
import { formatKes, formatDateTime, formatDate } from '@/utils/format';
import type { Shift } from '@/types';
import {
  Clock, Play, Square, Eye, TrendingUp, ShoppingBag,
  CheckCircle2, XCircle, AlertCircle, DollarSign,
} from 'lucide-react';

export function ShiftsPage() {
  const { shifts, currentUser, openShift, closeShift, hasPermission } = useStore();
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState<Shift | null>(null);
  const [viewShift, setViewShift] = useState<Shift | null>(null);
  const [openingFloat, setOpeningFloat] = useState('5000');
  const [openingNotes, setOpeningNotes] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  const canOpen = hasPermission('shifts.open');
  const canClose = hasPermission('shifts.close');

  const myActiveShift = currentUser ? shifts.find(s => s.cashierId === currentUser.id && s.status === 'OPEN') : null;
  const allActiveShifts = shifts.filter(s => s.status === 'OPEN');

  const handleOpen = () => {
    if (!currentUser) return;
    openShift({ cashierId: currentUser.id, cashierName: currentUser.name, openingFloat: parseInt(openingFloat) || 0, openingNotes });
    setOpenModal(false);
    setOpeningFloat('5000');
    setOpeningNotes('');
  };

  const handleClose = () => {
    if (!closeModal) return;
    closeShift(closeModal.id, { actualCash: parseInt(actualCash) || 0, closingNotes });
    setCloseModal(null);
    setActualCash('');
    setClosingNotes('');
  };

  const openCloseModal = (shift: Shift) => {
    setCloseModal(shift);
    setActualCash(String(shift.expectedCash));
    setClosingNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cashier Shifts</h1>
          <p className="text-slate-500 mt-1">Open, manage, and reconcile cashier shifts</p>
        </div>
        {canOpen && !myActiveShift && (
          <Button onClick={() => setOpenModal(true)}><Play className="w-4 h-4" /> Open Shift</Button>
        )}
      </div>

      {/* Active shift banner */}
      {myActiveShift && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">Your Shift is Active</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{formatKes(myActiveShift.expectedCash)}</p>
              <p className="text-sm text-slate-500">Expected cash in till</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div><p className="text-2xl font-bold text-slate-900">{myActiveShift.transactionCount}</p><p className="text-xs text-slate-500">Transactions</p></div>
              <div><p className="text-2xl font-bold text-slate-900">{formatKes(myActiveShift.totalSales)}</p><p className="text-xs text-slate-500">Total Sales</p></div>
              <div><p className="text-2xl font-bold text-slate-900">{formatKes(myActiveShift.openingFloat)}</p><p className="text-xs text-slate-500">Opening Float</p></div>
            </div>
            {canClose && (
              <Button variant="danger" onClick={() => openCloseModal(myActiveShift)}><Square className="w-4 h-4" /> Close Shift</Button>
            )}
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{allActiveShifts.length}</p><p className="text-xs text-slate-500">Active Shifts</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{shifts.length}</p><p className="text-xs text-slate-500">Total Shifts</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{shifts.filter(s => s.status === 'CLOSED').length}</p><p className="text-xs text-slate-500">Closed Shifts</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{formatKes(shifts.reduce((sum, s) => sum + s.totalSales, 0))}</p><p className="text-xs text-slate-500">All-Time Sales</p></div></div></Card>
      </div>

      {/* Shifts table */}
      <Card className="overflow-hidden">
        {shifts.length === 0 ? (
          <EmptyState icon={<Clock className="w-12 h-12" />} title="No shifts recorded" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Cashier</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Float</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Sales</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Txns</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Expected</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Actual</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Diff</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map(shift => (
                  <tr key={shift.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{shift.cashierName}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(shift.date)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatKes(shift.openingFloat)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatKes(shift.totalSales)}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{shift.transactionCount}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatKes(shift.expectedCash)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{shift.status === 'CLOSED' ? formatKes(shift.actualCash) : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {shift.status === 'CLOSED' ? (
                        <span className={shift.difference === 0 ? 'text-green-600 font-medium' : shift.difference < 0 ? 'text-red-600 font-medium' : 'text-yellow-600 font-medium'}>
                          {shift.difference >= 0 ? '+' : ''}{formatKes(shift.difference)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center"><Badge color={shift.status === 'OPEN' ? 'green' : 'gray'}>{shift.status}</Badge></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewShift(shift)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4" /></button>
                        {shift.status === 'OPEN' && canClose && shift.cashierId === currentUser?.id && (
                          <button onClick={() => openCloseModal(shift)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Square className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Open Shift Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Open Cashier Shift" size="sm"
        footer={<><Button variant="outline" onClick={() => setOpenModal(false)}>Cancel</Button><Button onClick={handleOpen}><Play className="w-4 h-4" /> Open Shift</Button></>}>
        <div className="space-y-4">
          {myActiveShift && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">You already have an active shift.</p>
            </div>
          )}
          <Input label="Opening Float (KSh)" type="number" value={openingFloat} onChange={setOpeningFloat} placeholder="5000" />
          <Input label="Opening Notes" value={openingNotes} onChange={setOpeningNotes} placeholder="Any notes for this shift..." />
        </div>
      </Modal>

      {/* Close Shift Modal */}
      <Modal open={!!closeModal} onClose={() => setCloseModal(null)} title="Close Cashier Shift" size="md"
        footer={<><Button variant="outline" onClick={() => setCloseModal(null)}>Cancel</Button><Button variant="danger" onClick={handleClose}><Square className="w-4 h-4" /> Close Shift</Button></>}>
        {closeModal && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-600">Cashier</span><span className="font-medium">{closeModal.cashierName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Opening Float</span><span className="font-medium">{formatKes(closeModal.openingFloat)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Total Sales</span><span className="font-medium">{formatKes(closeModal.totalSales)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Transactions</span><span className="font-medium">{closeModal.transactionCount}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Successful Payments</span><span className="font-medium text-green-600">{closeModal.successfulPayments}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Failed Payments</span><span className="font-medium text-red-600">{closeModal.failedPayments}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Refunds</span><span className="font-medium">{closeModal.refunds}</span></div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2"><span>Expected Cash</span><span className="text-orange-600">{formatKes(closeModal.expectedCash)}</span></div>
            </div>
            <Input label="Actual Cash Counted (KSh)" type="number" value={actualCash} onChange={setActualCash} placeholder="Enter counted amount..." />
            {actualCash && closeModal && (
              <div className={`rounded-lg p-3 text-sm ${parseInt(actualCash) === closeModal.expectedCash ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {parseInt(actualCash) === closeModal.expectedCash ? 'Cash balances perfectly!' : `Variance: ${formatKes(parseInt(actualCash) - closeModal.expectedCash)}`}
              </div>
            )}
            <Input label="Closing Notes" value={closingNotes} onChange={setClosingNotes} placeholder="Any notes about the shift..." />
          </div>
        )}
      </Modal>

      {/* View Shift Modal */}
      <Modal open={!!viewShift} onClose={() => setViewShift(null)} title="Shift Details" size="md">
        {viewShift && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Cashier</p><p className="text-sm font-medium">{viewShift.cashierName}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Date</p><p className="text-sm font-medium">{formatDate(viewShift.date)}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Opened</p><p className="text-sm font-medium">{formatDateTime(viewShift.openedAt)}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Closed</p><p className="text-sm font-medium">{viewShift.closedAt ? formatDateTime(viewShift.closedAt) : '—'}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Opening Float</p><p className="text-sm font-medium">{formatKes(viewShift.openingFloat)}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Opening Notes</p><p className="text-sm font-medium">{viewShift.openingNotes || '—'}</p></div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-600">Total Sales</span><span className="font-medium">{formatKes(viewShift.totalSales)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Transactions</span><span className="font-medium">{viewShift.transactionCount}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Successful Payments</span><span className="font-medium text-green-600">{viewShift.successfulPayments}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Failed Payments</span><span className="font-medium text-red-600">{viewShift.failedPayments}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Refunds</span><span className="font-medium">{viewShift.refunds}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Expected Cash</span><span className="font-medium">{formatKes(viewShift.expectedCash)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Actual Cash</span><span className="font-medium">{viewShift.status === 'CLOSED' ? formatKes(viewShift.actualCash) : '—'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Variance</span><span className={`font-medium ${viewShift.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>{viewShift.status === 'CLOSED' ? formatKes(viewShift.difference) : '—'}</span></div>
            </div>
            {viewShift.closingNotes && (
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Closing Notes</p><p className="text-sm">{viewShift.closingNotes}</p></div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
