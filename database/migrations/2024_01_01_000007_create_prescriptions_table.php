<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->uuid('doctor_id');
            $table->uuid('consultation_id')->nullable();

            // Informações da prescrição (campos reais utilizados na aplicação)
            $table->string('titulo');
            $table->enum('tipo', ['comum', 'controlada', 'especial', 'antimicrobiano'])->default('comum');
            $table->datetime('data_emissao');
            $table->datetime('expiration_date')->nullable();

            // Lista de medicamentos prescritos (estrutura real)
            $table->json('medicamentos')->nullable();

            // Campos legados mantidos para compatibilidade
            $table->json('medications')->nullable();

            // Instruções gerais
            $table->text('general_instructions')->nullable();

            // Status da prescrição
            $table->enum('status', ['active', 'Ativa', 'Renovada', 'Suspensa', 'Concluída'])->default('active');

            // URL do PDF gerado
            $table->string('pdf_url')->nullable();

            // Observações adicionais
            $table->text('additional_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['patient_id']);
            $table->index(['doctor_id']);
            $table->index(['consultation_id']);
            $table->index(['data_emissao']);
            $table->index(['status']);
            $table->index(['tipo']);

            // Chaves estrangeiras
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};