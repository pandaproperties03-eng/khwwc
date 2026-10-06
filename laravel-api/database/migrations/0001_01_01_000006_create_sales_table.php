<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('receipt_no')->unique();
            $table->string('order_no')->unique();
            $table->timestamp('date');
            $table->foreignUuid('cashier_id')->constrained('users')->cascadeOnDelete();
            $table->string('cashier_name');
            $table->foreignUuid('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $table->foreignUuid('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->integer('subtotal');
            $table->integer('discount')->default(0);
            $table->integer('tax')->default(0);
            $table->integer('total');
            $table->string('payment_method')->default('MPESA_STK'); // MPESA_STK, CASH, CREDIT
            $table->string('payment_status')->default('PENDING'); // PENDING, PROCESSING, CONFIRMED, FAILED, EXPIRED, CANCELLED
            $table->string('sale_status')->default('ORDER_CREATED'); // ORDER_CREATED, PAYMENT_PENDING, STK_REQUESTED, PAYMENT_PROCESSING, PAYMENT_CONFIRMED, SALE_COMPLETED, PAYMENT_FAILED, PAYMENT_EXPIRED, PAYMENT_CANCELLED, REFUNDED
            $table->string('payment_ref')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('refund_reason')->nullable();
            $table->foreignUuid('refunded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['cashier_id', 'sale_status']);
            $table->index(['payment_status']);
            $table->index('shift_id');
            $table->index('date');
        });

        Schema::create('sale_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('product_name');
            $table->integer('quantity');
            $table->integer('unit_price');
            $table->integer('discount')->default(0);
            $table->integer('subtotal');
            $table->timestamps();

            $table->index('sale_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
    }
};
