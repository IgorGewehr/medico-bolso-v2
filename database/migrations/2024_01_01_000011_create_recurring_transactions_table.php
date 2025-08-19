<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            
            // Informações básicas
            $table->text('description');
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['income', 'expense']);
            $table->string('category');
            
            // Configurações de recorrência
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'yearly']);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->integer('day_of_month')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['user_id']);
            $table->index(['frequency']);
            $table->index(['is_active']);
            $table->index(['start_date']);
            $table->index(['end_date']);

            // Chave estrangeira
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_transactions');
    }
};