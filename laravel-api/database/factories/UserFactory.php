<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '2547' . fake()->numberBetween(10000000, 99999999),
            'password' => Hash::make('password123'),
            'role' => fake()->randomElement(['CASHIER', 'MANAGER', 'STOREKEEPER', 'ACCOUNTANT']),
            'status' => 'ACTIVE',
            'avatar_color' => fake()->randomElement(['#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#7c3aed']),
        ];
    }
}
