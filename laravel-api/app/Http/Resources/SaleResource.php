<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'receipt_no' => $this->receipt_no,
            'order_no' => $this->order_no,
            'date' => $this->date,
            'cashier_id' => $this->cashier_id,
            'cashier_name' => $this->cashier_name,
            'shift_id' => $this->shift_id,
            'customer_id' => $this->customer_id,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'tax' => $this->tax,
            'total' => $this->total,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'sale_status' => $this->sale_status,
            'payment_ref' => $this->payment_ref,
            'completed_at' => $this->completed_at,
            'refund_reason' => $this->refund_reason,
            'items' => SaleItemResource::collection($this->whenLoaded('items')),
            'cashier' => $this->whenLoaded('cashier'),
            'customer' => $this->whenLoaded('customer'),
            'shift' => $this->whenLoaded('shift'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

class SaleItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sale_id' => $this->sale_id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'discount' => $this->discount,
            'subtotal' => $this->subtotal,
        ];
    }
}
