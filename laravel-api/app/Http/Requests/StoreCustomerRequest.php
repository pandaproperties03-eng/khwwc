<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'staff_number' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:100',
            'facility' => 'nullable|string|max:100',
            'type' => 'sometimes|in:HEALTHCARE_WORKER,VISITOR,STAFF,OTHER',
            'status' => 'sometimes|in:ACTIVE,INACTIVE',
        ];
    }
}

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'staff_number' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:100',
            'facility' => 'nullable|string|max:100',
            'type' => 'sometimes|in:HEALTHCARE_WORKER,VISITOR,STAFF,OTHER',
            'status' => 'sometimes|in:ACTIVE,INACTIVE',
        ];
    }
}
