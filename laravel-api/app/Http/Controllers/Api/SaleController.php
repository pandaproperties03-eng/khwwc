<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleRequest;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Shift;
use App\Models\AuditLog;
use App\Models\LedgerEntry;
use App\Services\CoopBankPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SaleController extends Controller
{
    public function __construct(
        private CoopBankPaymentService $paymentService
    ) {}

    public function index(Request $request)
    {
        $query = Sale::with('items', 'cashier', 'customer', 'shift');

        if ($request->has('cashier_id')) {
            $query->where('cashier_id', $request->cashier_id);
        }
        if ($request->has('shift_id')) {
            $query->where('shift_id', $request->shift_id);
        }
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        if ($request->has('sale_status')) {
            $query->where('sale_status', $request->sale_status);
        }
        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to . ' 23:59:59');
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('receipt_no', 'ilike', "%{$search}%")
                  ->orWhere('order_no', 'ilike', "%{$search}%")
                  ->orWhere('customer_name', 'ilike', "%{$search}%")
                  ->orWhere('customer_phone', 'ilike', "%{$search}%");
            });
        }

        $sales = $query->orderBy('date', 'desc')->paginate($request->per_page ?? 20);
        return response()->json($sales);
    }

    public function show(Sale $sale)
    {
        return response()->json($sale->load('items', 'cashier', 'customer', 'shift', 'paymentAttempts'));
    }

    public function store(StoreSaleRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->find($item['product_id']);
                if (!$product) {
                    throw new \Exception("Product not found: {$item['product_id']}");
                }
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Insufficient stock for {$product->name}. Available: {$product->stock}, Requested: {$item['quantity']}");
                }
                $subtotal += $item['unit_price'] * $item['quantity'] - ($item['discount'] ?? 0);
            }

            $discount = $validated['discount'] ?? 0;
            $tax = $validated['tax'] ?? 0;
            $total = $subtotal - $discount + $tax;

            $receiptNo = 'RCP-' . date('Ymd') . '-' . str_pad(Sale::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
            $orderNo = 'ORD-' . date('YmdHis') . '-' . Str::random(4);

            $sale = Sale::create([
                'receipt_no' => $receiptNo,
                'order_no' => $orderNo,
                'date' => now(),
                'cashier_id' => $request->user()->id,
                'cashier_name' => $request->user()->name,
                'shift_id' => $validated['shift_id'] ?? null,
                'customer_id' => $validated['customer_id'] ?? null,
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $validated['payment_method'] ?? 'MPESA_STK',
                'payment_status' => 'PENDING',
                'sale_status' => 'ORDER_CREATED',
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                $lineSubtotal = $item['unit_price'] * $item['quantity'] - ($item['discount'] ?? 0);

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount' => $item['discount'] ?? 0,
                    'subtotal' => $lineSubtotal,
                ]);
            }

            AuditLog::create([
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
                'action' => 'CREATE_SALE',
                'entity' => 'Sale',
                'entity_id' => $sale->id,
                'description' => "Created sale {$sale->receipt_no} for KES {$total}",
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            return response()->json($sale->load('items'), 201);
        });
    }

    public function initiatePayment(Request $request, Sale $sale, CoopBankPaymentService $paymentService)
    {
        $validated = $request->validate([
            'phone_number' => 'required|string|regex:/^254[0-9]{9}$/',
        ]);

        if ($sale->payment_status === 'CONFIRMED') {
            return response()->json(['message' => 'Sale already paid'], 422);
        }

        $sale->update([
            'payment_status' => 'PROCESSING',
            'sale_status' => 'STK_REQUESTED',
        ]);

        $result = $paymentService->initiateStkPush($sale, $validated['phone_number']);

        return response()->json($result);
    }

    public function checkPaymentStatus(Sale $sale)
    {
        return response()->json([
            'sale_id' => $sale->id,
            'receipt_no' => $sale->receipt_no,
            'payment_status' => $sale->payment_status,
            'sale_status' => $sale->sale_status,
            'payment_ref' => $sale->payment_ref,
        ]);
    }

    public function confirmPayment(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'payment_ref' => 'required|string',
            'amount' => 'required|integer',
        ]);

        return DB::transaction(function () use ($sale, $validated, $request) {
            if ($sale->payment_status === 'CONFIRMED') {
                return response()->json(['message' => 'Already confirmed'], 422);
            }

            $sale->update([
                'payment_status' => 'CONFIRMED',
                'sale_status' => 'SALE_COMPLETED',
                'payment_ref' => $validated['payment_ref'],
                'completed_at' => now(),
            ]);

            // Deduct stock
            foreach ($sale->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                $previousQty = $product->stock;
                $newQty = $previousQty - $item->quantity;
                $product->update(['stock' => $newQty]);

                StockMovement::create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => -$item->quantity,
                    'previous_qty' => $previousQty,
                    'new_qty' => $newQty,
                    'type' => 'SALE',
                    'reference' => $sale->receipt_no,
                    'user_id' => $request->user()->id,
                    'user_name' => $request->user()->name,
                    'date' => now(),
                ]);
            }

            // Update shift
            if ($sale->shift_id) {
                $shift = Shift::find($sale->shift_id);
                if ($shift) {
                    $shift->increment('total_sales', $sale->total);
                    $shift->increment('transaction_count');
                    $shift->increment('successful_payments');
                    $shift->increment('expected_cash', $sale->total);
                }
            }

            // Update customer
            if ($sale->customer_id) {
                $customer = $sale->customer;
                $customer->increment('total_spent', $sale->total);
                $customer->update(['last_purchase' => now()]);
            }

            // Ledger entry
            $lastBalance = LedgerEntry::orderBy('date', 'desc')->value('balance') ?? 0;
            LedgerEntry::create([
                'date' => now(),
                'reference' => $sale->receipt_no,
                'description' => "Sale {$sale->receipt_no} - {$sale->customer_name ?? 'Walk-in customer'}",
                'debit' => $sale->total,
                'credit' => 0,
                'balance' => $lastBalance + $sale->total,
                'type' => 'SALE',
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
            ]);

            AuditLog::create([
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
                'action' => 'CONFIRM_PAYMENT',
                'entity' => 'Sale',
                'entity_id' => $sale->id,
                'description' => "Confirmed payment for {$sale->receipt_no} - KES {$sale->total}",
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            return response()->json($sale->load('items'));
        });
    }

    public function refund(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        return DB::transaction(function () use ($sale, $validated, $request) {
            if ($sale->sale_status !== 'SALE_COMPLETED') {
                return response()->json(['message' => 'Only completed sales can be refunded'], 422);
            }

            $sale->update([
                'sale_status' => 'REFUNDED',
                'refund_reason' => $validated['reason'],
                'refunded_by' => $request->user()->id,
            ]);

            // Restore stock
            foreach ($sale->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                $previousQty = $product->stock;
                $newQty = $previousQty + $item->quantity;
                $product->update(['stock' => $newQty]);

                StockMovement::create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item->quantity,
                    'previous_qty' => $previousQty,
                    'new_qty' => $newQty,
                    'type' => 'REFUND',
                    'reference' => $sale->receipt_no,
                    'user_id' => $request->user()->id,
                    'user_name' => $request->user()->name,
                    'date' => now(),
                ]);
            }

            // Update shift
            if ($sale->shift_id) {
                $shift = Shift::find($sale->shift_id);
                if ($shift) {
                    $shift->decrement('total_sales', $sale->total);
                    $shift->increment('refunds');
                    $shift->decrement('expected_cash', $sale->total);
                }
            }

            // Ledger entry
            $lastBalance = LedgerEntry::orderBy('date', 'desc')->value('balance') ?? 0;
            LedgerEntry::create([
                'date' => now(),
                'reference' => $sale->receipt_no,
                'description' => "Refund for {$sale->receipt_no} - {$validated['reason']}",
                'debit' => 0,
                'credit' => $sale->total,
                'balance' => $lastBalance - $sale->total,
                'type' => 'REFUND',
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
            ]);

            AuditLog::create([
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
                'action' => 'REFUND_SALE',
                'entity' => 'Sale',
                'entity_id' => $sale->id,
                'description' => "Refunded sale {$sale->receipt_no} - KES {$sale->total}. Reason: {$validated['reason']}",
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            return response()->json($sale->fresh()->load('items'));
        });
    }

    public function cancel(Request $request, Sale $sale)
    {
        if (in_array($sale->sale_status, ['SALE_COMPLETED', 'REFUNDED'])) {
            return response()->json(['message' => 'Cannot cancel completed or refunded sales'], 422);
        }

        $sale->update([
            'sale_status' => 'PAYMENT_CANCELLED',
            'payment_status' => 'CANCELLED',
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'CANCEL_SALE',
            'entity' => 'Sale',
            'entity_id' => $sale->id,
            'description' => "Cancelled sale {$sale->receipt_no}",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json(['message' => 'Sale cancelled']);
    }
}
