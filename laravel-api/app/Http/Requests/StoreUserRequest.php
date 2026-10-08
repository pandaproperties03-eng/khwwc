<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'role' => 'required|in:SUPER_ADMIN,MANAGER,CASHIER,STOREKEEPER,ACCOUNTANT,SUPERVISOR',
            'status' => 'sometimes|in:ACTIVE,INACTIVE',
            'avatar_color' => 'sometimes|string|max:20',
        ];
    }
}
