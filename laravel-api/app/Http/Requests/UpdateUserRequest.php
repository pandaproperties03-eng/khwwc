<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $this->user?->id,
            'phone' => 'nullable|string|max:20',
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|in:SUPER_ADMIN,MANAGER,CASHIER,STOREKEEPER,ACCOUNTANT,SUPERVISOR',
            'status' => 'sometimes|in:ACTIVE,INACTIVE',
            'avatar_color' => 'sometimes|string|max:20',
        ];
    }
}
