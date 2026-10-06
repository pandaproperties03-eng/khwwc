<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Product extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'sku', 'barcode', 'name', 'category_id', 'description',
        'selling_price', 'cost_price', 'unit', 'stock',
        'min_stock', 'reorder_level', 'supplier_id', 'active', 'image_emoji',
    ];

    protected $casts = ['active' => 'boolean'];

    public function category(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function supplier(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function stockMovements(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StockMovement::class, 'product_id');
    }

    public function getStockStatusAttribute(): string
    {
        if ($this->stock <= 0) return 'OUT_OF_STOCK';
        if ($this->stock <= $this->min_stock) return 'LOW_STOCK';
        return 'IN_STOCK';
    }

    public function getProfitMarginAttribute(): int
    {
        return $this->selling_price - $this->cost_price;
    }
}
