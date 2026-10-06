<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cashier_id')->constrained('users')->cascadeOnDelete();
            $table->string('cashier_name');
            $table->date('date');
            $table->integer('opening_float');
            $table->text('opening_notes')->nullable();
            $table->text('closing_notes')->nullable();
            $table->string('status')->default('OPEN'); // OPEN, CLOSED
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->integer('expected_cash')->default(0);
            $table->integer('actual_cash')->default(0);
            $table->integer('difference')->default(0);
            $table->integer('total_sales')->default(0);
            $table->integer('transaction_count')->default(0);
            $table->integer('successful_payments')->default(0);
            $table->integer('failed_payments')->default(0);
            $table->integer('refunds')->default(0);
            $table->timestamps();

            $table->index(['cashier_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
