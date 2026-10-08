<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'ilike', "%{$search}%")
                  ->orWhere('contact_person', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        $suppliers = $query->withCount('purchaseOrders')->orderBy('company_name')->paginate($request->per_page ?? 20);
        return response()->json($suppliers);
    }

    public function show(Supplier $supplier)
    {
        return response()->json($supplier->load('products', 'purchaseOrders'));
    }

    public function store(StoreSupplierRequest $request)
    {
        $supplier = Supplier::create($request->validated());
        return response()->json($supplier, 201);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $supplier->update($request->validated());
        return response()->json($supplier);
    }

    public function destroy(Supplier $supplier)
    {
        if ($supplier->products()->exists() || $supplier->purchaseOrders()->exists()) {
            return response()->json(['message' => 'Cannot delete supplier with associated records'], 422);
        }
        $supplier->delete();
        return response()->json(['message' => 'Supplier deleted']);
    }
}
