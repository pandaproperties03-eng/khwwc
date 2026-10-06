<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payment_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->integer('amount');
            $table->string('method')->default('MPESA_STK');
            $table->string('status')->default('PENDING'); // PENDING, PROCESSING, CONFIRMED, FAILED, EXPIRED, CANCELLED
            $table->string('phone_number');
            $table->string('stk_ref')->nullable();
            $table->string('merchant_ref')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();

            $table->index('sale_id');
            $table->index('stk_ref');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_attempts');
    }
};
