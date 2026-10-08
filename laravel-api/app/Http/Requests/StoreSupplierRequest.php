<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'company_name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:1000',
            'kra_pin' => 'nullable|string|max:20',
            'payment_terms' => 'sometimes|string|max:50',
            'opening_balance' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:ACTIVE,INACTIVE',
        ];
    }
}

class UpdateSupplierRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'company_name' => 'sometimes|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:1000',
            'kra_pin' => 'nullable|string|max:20',
            'payment_terms' => 'sometimes|string|max:50',
            'opening_balance' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:ACTIVE,INACTIVE',
        ];
    }
}
