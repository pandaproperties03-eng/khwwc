<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('supplier_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->string('supplier_name');
            $table->foreignUuid('purchase_order_id')->nullable()->constrained('purchase_orders')->nullOnDelete();
            $table->string('invoice_no');
            $table->integer('amount');
            $table->integer('outstanding_amount')->default(0);
            $table->string('payment_ref');
            $table->date('date');
            $table->text('notes')->nullable();
            $table->string('status')->default('PENDING'); // PENDING, PAID, PARTIAL, CANCELLED
            $table->timestamps();

            $table->index('supplier_id');
            $table->index('status');
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('product_name');
            $table->integer('quantity'); // negative for out, positive for in
            $table->integer('previous_qty');
            $table->integer('new_qty');
            $table->string('type'); // PURCHASE, SALE, REFUND, ADJUSTMENT_IN, ADJUSTMENT_OUT, WASTE, OPENING_BALANCE
            $table->string('reference');
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->timestamp('date');
            $table->timestamps();

            $table->index('product_id');
            $table->index('type');
            $table->index('date');
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('description');
            $table->string('category'); // Utilities, Cleaning, Food supplies, Transport, Repairs, Maintenance, Stationery, Staff welfare, Other
            $table->integer('amount');
            $table->date('date');
            $table->string('payment_method')->default('CASH');
            $table->string('reference');
            $table->foreignUuid('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('recorded_by_name')->nullable();
            $table->text('notes')->nullable();
            $table->string('approval_status')->default('APPROVED'); // APPROVED, PENDING
            $table->timestamps();

            $table->index('category');
            $table->index('date');
        });

        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamp('date');
            $table->string('reference');
            $table->text('description');
            $table->integer('debit')->default(0);
            $table->integer('credit')->default(0);
            $table->integer('balance');
            $table->string('type'); // SALE, PURCHASE, PAYMENT, EXPENSE, REFUND, SUPPLIER_PAYMENT, ADJUSTMENT
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('date');
            $table->index('reference');
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('action');
            $table->string('entity');
            $table->string('entity_id')->nullable();
            $table->text('description');
            $table->string('ip')->nullable();
            $table->timestamp('timestamp');
            $table->timestamps();

            $table->index('user_id');
            $table->index('action');
            $table->index('timestamp');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->timestamp('timestamp');
            $table->string('entity_id')->nullable();
            $table->timestamps();

            $table->index('read');
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('ledger_entries');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('supplier_payments');
    }
};
