<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Shift extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'cashier_id', 'cashier_name', 'date', 'opening_float', 'opening_notes',
        'closing_notes', 'status', 'opened_at', 'closed_at',
        'expected_cash', 'actual_cash', 'difference',
        'total_sales', 'transaction_count', 'successful_payments',
        'failed_payments', 'refunds',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'date' => 'date',
    ];

    public function cashier(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function sales(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Sale::class, 'shift_id');
    }
}
