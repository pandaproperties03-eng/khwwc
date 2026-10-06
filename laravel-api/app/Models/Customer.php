<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Customer extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'phone', 'staff_number', 'department', 'facility',
        'type', 'status', 'total_spent', 'last_purchase', 'outstanding_balance',
    ];

    protected $casts = ['last_purchase' => 'datetime'];

    public function sales(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Sale::class, 'customer_id');
    }
}
