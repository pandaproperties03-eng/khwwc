<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\Product;
use App\Models\Customer;
use App\Models\StockMovement;
use App\Models\Shift;
use App\Models\LedgerEntry;
use Illuminate\Support\Facades\DB;

class SaleCompletionService
{
    /**
     * Complete a sale: deduct stock, update shift, update customer, create ledger entry.
     * Called when payment is confirmed (either via webhook or manual confirmation).
     */
    public function completeSale(Sale $sale, string $userId, string $userName): void
    {
        DB::transaction(function () use ($sale, $userId, $userName) {
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
                    'user_id' => $userId,
                    'user_name' => $userName,
                    'date' => now(),
                ]);
            }

            // Update shift
            if ($sale->shift_id) {
                Shift::where('id', $sale->shift_id)
                    ->increment('total_sales', $sale->total);
                Shift::where('id', $sale->shift_id)
                    ->increment('transaction_count');
                Shift::where('id', $sale->shift_id)
                    ->increment('successful_payments');
                Shift::where('id', $sale->shift_id)
                    ->increment('expected_cash', $sale->total);
            }

            // Update customer
            if ($sale->customer_id) {
                Customer::where('id', $sale->customer_id)
                    ->increment('total_spent', $sale->total);
                Customer::where('id', $sale->customer_id)
                    ->update(['last_purchase' => now()]);
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
                'user_id' => $userId,
                'user_name' => $userName,
            ]);

            $sale->update([
                'sale_status' => 'SALE_COMPLETED',
                'completed_at' => now(),
            ]);
        });
    }
}
