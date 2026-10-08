<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'supplier_id' => 'required|uuid|exists:suppliers,id',
            'supplier_name' => 'required|string|max:255',
            'expected_delivery' => 'required|date',
            'additional_costs' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:DRAFT,SUBMITTED',
            'supplier_invoice_no' => 'nullable|string|max:100',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|integer|min:0',
        ];
    }
}
