<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            
            // Informações da conta
            $table->text('description');
            $table->decimal('amount', 10, 2);
            $table->date('due_date');
            $table->string('category');
            
            // Status
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            
            // Informações adicionais
            $table->string('barcode')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['user_id']);
            $table->index(['due_date']);
            $table->index(['status']);
            $table->index(['category']);

            // Chave estrangeira
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};