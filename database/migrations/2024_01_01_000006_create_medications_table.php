<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->string('medication_name');
            $table->string('active_ingredient');

            // Detalhes da medicação
            $table->string('dosage');
            $table->string('form');
            $table->string('route');
            $table->string('frequency');
            $table->string('duration');

            // Instruções específicas
            $table->text('instructions')->nullable();

            // Informações adicionais
            $table->json('side_effects')->nullable();
            $table->json('contraindications')->nullable();
            $table->json('interactions')->nullable();

            // Campos de controle
            $table->boolean('is_controlled')->default(false);
            $table->string('controlled_type')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['medication_name']);
            $table->index(['active_ingredient']);
            $table->index(['is_controlled']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medications');
    }
};