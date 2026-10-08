<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\AuditLog;
use App\Models\SupplierPayment;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with('supplier', 'items');

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'ilike', "%{$search}%")
                  ->orWhere('supplier_name', 'ilike', "%{$search}%")
                  ->orWhere('supplier_invoice_no', 'ilike', "%{$search}%");
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);
        return response()->json($orders);
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        return response()->json($purchaseOrder->load('supplier', 'items.product'));
    }

    public function store(StorePurchaseOrderRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += $item['quantity'] * $item['unit_cost'];
            }

            $additionalCosts = $validated['additional_costs'] ?? 0;
            $total = $subtotal + $additionalCosts;

            $poNumber = 'PO-' . date('Ymd') . '-' . str_pad(PurchaseOrder::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

            $po = PurchaseOrder::create([
                'po_number' => $poNumber,
                'supplier_id' => $validated['supplier_id'],
                'supplier_name' => $validated['supplier_name'],
                'subtotal' => $subtotal,
                'additional_costs' => $additionalCosts,
                'total' => $total,
                'status' => $validated['status'] ?? 'DRAFT',
                'expected_delivery' => $validated['expected_delivery'],
                'created_by' => $request->user()->name,
                'supplier_invoice_no' => $validated['supplier_invoice_no'] ?? null,
                'payment_status' => 'PENDING',
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'total' => $item['quantity'] * $item['unit_cost'],
                ]);
            }

            AuditLog::create([
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
                'action' => 'CREATE_PO',
                'entity' => 'PurchaseOrder',
                'entity_id' => $po->id,
                'description' => "Created PO {$po->po_number} for {$validated['supplier_name']} - KES {$total}",
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            return response()->json($po->load('items', 'supplier'), 201);
        });
    }

    public function approve(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'DRAFT' && $purchaseOrder->status !== 'SUBMITTED') {
            return response()->json(['message' => 'Only draft or submitted POs can be approved'], 422);
        }

        $purchaseOrder->update([
            'status' => 'APPROVED',
            'approved_by' => $request->user()->name,
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'APPROVE_PO',
            'entity' => 'PurchaseOrder',
            'entity_id' => $purchaseOrder->id,
            'description' => "Approved PO {$purchaseOrder->po_number}",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json($purchaseOrder);
    }

    public function receive(Request $request, PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['APPROVED', 'PARTIALLY_RECEIVED'])) {
            return response()->json(['message' => 'Only approved POs can be received'], 422);
        }

        return DB::transaction(function () use ($purchaseOrder, $request) {
            foreach ($purchaseOrder->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                $previousQty = $product->stock;
                $newQty = $previousQty + $item->quantity;

                $product->update([
                    'stock' => $newQty,
                    'cost_price' => $item->unit_cost,
                ]);

                StockMovement::create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item->quantity,
                    'previous_qty' => $previousQty,
                    'new_qty' => $newQty,
                    'type' => 'PURCHASE',
                    'reference' => $purchaseOrder->po_number,
                    'user_id' => $request->user()->id,
                    'user_name' => $request->user()->name,
                    'date' => now(),
                ]);
            }

            $purchaseOrder->update(['status' => 'RECEIVED']);

            AuditLog::create([
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
                'action' => 'RECEIVE_PO',
                'entity' => 'PurchaseOrder',
                'entity_id' => $purchaseOrder->id,
                'description' => "Received stock for PO {$purchaseOrder->po_number}",
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            return response()->json($purchaseOrder->load('items'));
        });
    }

    public function cancel(Request $request, PurchaseOrder $purchaseOrder)
    {
        if (in_array($purchaseOrder->status, ['RECEIVED', 'CANCELLED'])) {
            return response()->json(['message' => 'Cannot cancel received or already cancelled POs'], 422);
        }

        $purchaseOrder->update(['status' => 'CANCELLED']);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'CANCEL_PO',
            'entity' => 'PurchaseOrder',
            'entity_id' => $purchaseOrder->id,
            'description' => "Cancelled PO {$purchaseOrder->po_number}",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json(['message' => 'PO cancelled']);
    }

    public function paySupplier(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'amount' => 'required|integer|min:1',
            'payment_ref' => 'required|string',
            'notes' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($purchaseOrder, $validated, $request) {
            $payment = SupplierPayment::create([
                'supplier_id' => $purchaseOrder->supplier_id,
                'supplier_name' => $purchaseOrder->supplier_name,
                'purchase_order_id' => $purchaseOrder->id,
                'invoice_no' => $purchaseOrder->supplier_invoice_no ?? $purchaseOrder->po_number,
                'amount' => $validated['amount'],
                'outstanding_amount' => max(0, $purchaseOrder->total - $validated['amount']),
                'payment_ref' => $validated['payment_ref'],
                'date' => today(),
                'notes' => $validated['notes'] ?? null,
                'status' => $validated['amount'] >= $purchaseOrder->total ? 'PAID' : 'PARTIAL',
            ]);

            if ($validated['amount'] >= $purchaseOrder->total) {
                $purchaseOrder->update(['payment_status' => 'PAID']);
            } else {
                $purchaseOrder->update(['payment_status' => 'PARTIAL']);
            }

            $lastBalance = LedgerEntry::orderBy('date', 'desc')->value('balance') ?? 0;
            LedgerEntry::create([
                'date' => now(),
                'reference' => $validated['payment_ref'],
                'description' => "Supplier payment to {$purchaseOrder->supplier_name} for {$purchaseOrder->po_number}",
                'debit' => 0,
                'credit' => $validated['amount'],
                'balance' => $lastBalance - $validated['amount'],
                'type' => 'SUPPLIER_PAYMENT',
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
            ]);

            AuditLog::create([
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
                'action' => 'SUPPLIER_PAYMENT',
                'entity' => 'PurchaseOrder',
                'entity_id' => $purchaseOrder->id,
                'description' => "Paid KES {$validated['amount']} to {$purchaseOrder->supplier_name} for {$purchaseOrder->po_number}",
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            return response()->json($payment, 201);
        });
    }
}
