<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = StockMovement::with('product', 'user');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        $movements = $query->orderBy('date', 'desc')->paginate($request->per_page ?? 30);
        return response()->json($movements);
    }

    public function adjust(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|uuid|exists:products,id',
            'new_qty' => 'required|integer|min:0',
            'reason' => 'required|string|max:500',
            'type' => 'sometimes|in:ADJUSTMENT_IN,ADJUSTMENT_OUT,WASTE',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $product = Product::lockForUpdate()->find($validated['product_id']);
            $previousQty = $product->stock;
            $newQty = $validated['new_qty'];
            $difference = $newQty - $previousQty;

            $type = $validated['type'] ?? ($difference > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT');

            $product->update(['stock' => $newQty]);

            $movement = StockMovement::create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $difference,
                'previous_qty' => $previousQty,
                'new_qty' => $newQty,
                'type' => $type,
                'reference' => $validated['reason'],
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
                'date' => now(),
            ]);

            AuditLog::create([
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
                'action' => 'STOCK_ADJUSTMENT',
                'entity' => 'Product',
                'entity_id' => $product->id,
                'description' => "Adjusted {$product->name} stock from {$previousQty} to {$newQty}. Reason: {$validated['reason']}",
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            return response()->json($movement, 201);
        });
    }

    public function valuation()
    {
        $products = Product::select('id', 'name', 'stock', 'cost_price', 'selling_price')->get();
        $totalCost = $products->sum(fn($p) => $p->stock * $p->cost_price);
        $totalRetail = $products->sum(fn($p) => $p->stock * $p->selling_price);

        return response()->json([
            'products' => $products,
            'total_cost_value' => $totalCost,
            'total_retail_value' => $totalRetail,
            'potential_profit' => $totalRetail - $totalCost,
        ]);
    }

    public function lowStock()
    {
        $products = Product::whereColumn('stock', '<=', 'min_stock')
            ->with('category', 'supplier')
            ->orderBy('stock', 'asc')
            ->get();

        return response()->json($products);
    }
}
