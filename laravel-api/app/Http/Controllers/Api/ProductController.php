<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category', 'supplier');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }
        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('sku', 'ilike', "%{$search}%")
                  ->orWhere('barcode', 'ilike', "%{$search}%");
            });
        }
        if ($request->boolean('low_stock')) {
            $query->whereColumn('stock', '<=', 'min_stock');
        }

        if ($request->has('sort')) {
            $sort = $request->sort;
            $direction = $request->boolean('desc', true) ? 'desc' : 'asc';
            $allowed = ['name', 'sku', 'stock', 'selling_price', 'cost_price', 'created_at'];
            if (in_array($sort, $allowed)) {
                $query->orderBy($sort, $direction);
            }
        } else {
            $query->orderBy('name');
        }

        $products = $query->paginate($request->per_page ?? 50);
        return response()->json($products);
    }

    public function show(Product $product)
    {
        return response()->json($product->load('category', 'supplier', 'stockMovements' => fn($q) => $q->latest()->limit(20)));
    }

    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();
        $product = Product::create($data);

        if ($product->stock > 0) {
            StockMovement::create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $product->stock,
                'previous_qty' => 0,
                'new_qty' => $product->stock,
                'type' => 'OPENING_BALANCE',
                'reference' => 'Initial stock',
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
                'date' => now(),
            ]);
        }

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'CREATE_PRODUCT',
            'entity' => 'Product',
            'entity_id' => $product->id,
            'description' => "Created product {$product->name} (SKU: {$product->sku})",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json($product->load('category', 'supplier'), 201);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'UPDATE_PRODUCT',
            'entity' => 'Product',
            'entity_id' => $product->id,
            'description' => "Updated product {$product->name}",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json($product->load('category', 'supplier'));
    }

    public function destroy(Request $request, Product $product)
    {
        $product->update(['active' => false]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'DEACTIVATE_PRODUCT',
            'entity' => 'Product',
            'entity_id' => $product->id,
            'description' => "Deactivated product {$product->name}",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json(['message' => 'Product deactivated']);
    }
}
