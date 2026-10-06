<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('po_number')->unique();
            $table->foreignUuid('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->string('supplier_name');
            $table->integer('subtotal');
            $table->integer('additional_costs')->default(0);
            $table->integer('total');
            $table->string('status')->default('DRAFT'); // DRAFT, SUBMITTED, APPROVED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED
            $table->date('expected_delivery');
            $table->string('created_by');
            $table->string('approved_by')->nullable();
            $table->string('supplier_invoice_no')->nullable();
            $table->string('payment_status')->default('PENDING'); // PENDING, PAID, PARTIAL, CANCELLED
            $table->timestamps();

            $table->index(['supplier_id', 'status']);
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('product_name');
            $table->integer('quantity');
            $table->integer('unit_cost');
            $table->integer('total');
            $table->timestamps();

            $table->index('purchase_order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};
