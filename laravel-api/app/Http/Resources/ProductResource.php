<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'name' => $this->name,
            'category_id' => $this->category_id,
            'description' => $this->description,
            'selling_price' => $this->selling_price,
            'cost_price' => $this->cost_price,
            'unit' => $this->unit,
            'stock' => $this->stock,
            'min_stock' => $this->min_stock,
            'reorder_level' => $this->reorder_level,
            'supplier_id' => $this->supplier_id,
            'active' => $this->active,
            'image_emoji' => $this->image_emoji,
            'stock_status' => $this->stock_status,
            'profit_margin' => $this->profit_margin,
            'category' => $this->whenLoaded('category'),
            'supplier' => $this->whenLoaded('supplier'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
