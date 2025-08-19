<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            
            // Informações básicas da transação
            $table->text('description');
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['income', 'expense']);
            $table->string('category');
            $table->datetime('date');
            
            // Informações adicionais
            $table->enum('payment_method', ['dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'transferencia']);
            $table->uuid('patient_id')->nullable();
            $table->string('patient_name')->nullable();
            $table->uuid('consultation_id')->nullable();
            
            // Status
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('confirmed');

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['user_id']);
            $table->index(['patient_id']);
            $table->index(['consultation_id']);
            $table->index(['type']);
            $table->index(['category']);
            $table->index(['date']);
            $table->index(['status']);
            $table->index(['payment_method']);

            // Chaves estrangeiras
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};