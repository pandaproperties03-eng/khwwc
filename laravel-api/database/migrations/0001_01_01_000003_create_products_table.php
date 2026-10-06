<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable();
            $table->string('name');
            $table->foreignUuid('category_id')->constrained('categories')->cascadeOnDelete();
            $table->text('description')->nullable();
            $table->integer('selling_price'); // KES integer
            $table->integer('cost_price'); // KES integer
            $table->string('unit')->default('pc');
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(5);
            $table->integer('reorder_level')->default(10);
            $table->foreignUuid('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->boolean('active')->default(true);
            $table->string('image_emoji')->default('🍽️');
            $table->timestamps();

            $table->index(['category_id', 'active']);
            $table->index('barcode');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
