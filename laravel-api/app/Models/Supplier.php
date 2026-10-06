<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Supplier extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'company_name', 'contact_person', 'phone', 'email', 'address',
        'kra_pin', 'payment_terms', 'opening_balance', 'status',
    ];

    public function products(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Product::class, 'supplier_id');
    }

    public function purchaseOrders(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PurchaseOrder::class, 'supplier_id');
    }

    public function payments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SupplierPayment::class, 'supplier_id');
    }

    public function getOutstandingBalanceAttribute(): int
    {
        $poTotal = $this->purchaseOrders()->where('payment_status', '!=', 'PAID')->sum('total');
        $paid = $this->payments()->sum('amount');
        return $this->opening_balance + $poTotal - $paid;
    }
}
