<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'shift_id' => 'nullable|uuid|exists:shifts,id',
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'payment_method' => 'sometimes|in:MPESA_STK,CASH,CREDIT',
            'discount' => 'sometimes|integer|min:0',
            'tax' => 'sometimes|integer|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|integer|min:0',
            'items.*.discount' => 'sometimes|integer|min:0',
        ];
    }
}
