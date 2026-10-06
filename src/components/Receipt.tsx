import type { Sale } from '@/types';
import { Button } from '@/components/ui';
import { formatKes, formatDateTime } from '@/utils/format';
import { CheckCircle2, Printer, FileDown, Plus } from 'lucide-react';

interface ReceiptProps {
  sale: Sale;
  onNewSale: () => void;
}

export function Receipt({ sale, onNewSale }: ReceiptProps) {
  return (
    <div className="py-4">
      {/* Success banner */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Payment Confirmed</h3>
        <p className="text-sm text-slate-500">Sale completed successfully</p>
      </div>

      {/* Receipt */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-5 mx-auto max-w-sm font-mono text-sm">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="font-bold text-base text-slate-900">KIRINYAGA HEALTHCARE</h2>
          <h2 className="font-bold text-base text-slate-900">WORKERS CAFETERIA</h2>
          <p className="text-xs text-slate-500 mt-1">Kirinyaga County, Kenya</p>
          <div className="my-2 border-t border-dashed border-slate-300" />
        </div>

        {/* Receipt info */}
        <div className="space-y-1 text-xs text-slate-600 mb-3">
          <div className="flex justify-between"><span>Receipt #:</span> <span className="font-bold">{sale.receiptNo}</span></div>
          <div className="flex justify-between"><span>Order #:</span> <span>{sale.orderNo}</span></div>
          <div className="flex justify-between"><span>Date:</span> <span>{formatDateTime(sale.date)}</span></div>
          <div className="flex justify-between"><span>Cashier:</span> <span>{sale.cashierName}</span></div>
          {sale.customerPhone && (
            <div className="flex justify-between"><span>Customer:</span> <span>{sale.customerPhone}</span></div>
          )}
        </div>

        <div className="border-t border-dashed border-slate-300 my-2" />

        {/* Items */}
        <div className="space-y-1.5 mb-3">
          {sale.items.map(item => (
            <div key={item.id} className="text-xs">
              <div className="flex justify-between">
                <span>{item.quantity}x {item.productName}</span>
                <span className="font-medium">{formatKes(item.subtotal)}</span>
              </div>
              <div className="text-slate-400 pl-3 text-xs">
                @ {formatKes(item.unitPrice)} each
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-slate-300 my-2" />

        {/* Totals */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span>Subtotal:</span> <span>{formatKes(sale.subtotal)}</span></div>
          {sale.discount > 0 && (
            <div className="flex justify-between"><span>Discount:</span> <span>-{formatKes(sale.discount)}</span></div>
          )}
          {sale.tax > 0 && (
            <div className="flex justify-between"><span>Tax:</span> <span>{formatKes(sale.tax)}</span></div>
          )}
          <div className="flex justify-between font-bold text-sm pt-1">
            <span>TOTAL:</span>
            <span>{formatKes(sale.total)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-300 my-2" />

        {/* Payment info */}
        <div className="space-y-1 text-xs text-slate-600 mb-3">
          <div className="flex justify-between"><span>Payment:</span> <span>M-Pesa STK Push</span></div>
          {sale.paymentRef && (
            <div className="flex justify-between"><span>Ref:</span> <span>{sale.paymentRef}</span></div>
          )}
          <div className="flex justify-between font-bold text-green-700">
            <span>STATUS:</span>
            <span>PAID</span>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-300 my-2" />

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 mt-3">
          <p>Thank you for your purchase!</p>
          <p className="mt-1">Served with care at KHCW Cafeteria</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6 max-w-sm mx-auto">
        <Button variant="outline" fullWidth onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Print
        </Button>
        <Button variant="outline" fullWidth>
          <FileDown className="w-4 h-4" /> PDF
        </Button>
        <Button fullWidth onClick={onNewSale}>
          <Plus className="w-4 h-4" /> New Sale
        </Button>
      </div>
    </div>
  );
}
