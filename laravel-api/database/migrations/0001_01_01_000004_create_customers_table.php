<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('staff_number')->nullable();
            $table->string('department')->nullable();
            $table->string('facility')->nullable();
            $table->string('type')->default('HEALTHCARE_WORKER'); // HEALTHCARE_WORKER, VISITOR, STAFF, OTHER
            $table->string('status')->default('ACTIVE');
            $table->integer('total_spent')->default(0);
            $table->timestamp('last_purchase')->nullable();
            $table->integer('outstanding_balance')->default(0);
            $table->timestamps();

            $table->index('phone');
            $table->index('staff_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
