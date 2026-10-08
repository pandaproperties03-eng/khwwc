<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'sku' => 'required|string|max:50|unique:products,sku',
            'barcode' => 'nullable|string|max:100',
            'name' => 'required|string|max:255',
            'category_id' => 'required|uuid|exists:categories,id',
            'description' => 'nullable|string|max:2000',
            'selling_price' => 'required|integer|min:0',
            'cost_price' => 'required|integer|min:0',
            'unit' => 'sometimes|string|max:20',
            'stock' => 'sometimes|integer|min:0',
            'min_stock' => 'sometimes|integer|min:0',
            'reorder_level' => 'sometimes|integer|min:0',
            'supplier_id' => 'nullable|uuid|exists:suppliers,id',
            'active' => 'sometimes|boolean',
            'image_emoji' => 'sometimes|string|max:10',
        ];
    }
}

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'sku' => 'sometimes|string|max:50|unique:products,sku,' . $this->product?->id,
            'barcode' => 'nullable|string|max:100',
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|uuid|exists:categories,id',
            'description' => 'nullable|string|max:2000',
            'selling_price' => 'sometimes|integer|min:0',
            'cost_price' => 'sometimes|integer|min:0',
            'unit' => 'sometimes|string|max:20',
            'stock' => 'sometimes|integer|min:0',
            'min_stock' => 'sometimes|integer|min:0',
            'reorder_level' => 'sometimes|integer|min:0',
            'supplier_id' => 'nullable|uuid|exists:suppliers,id',
            'active' => 'sometimes|boolean',
            'image_emoji' => 'sometimes|string|max:10',
        ];
    }
}
