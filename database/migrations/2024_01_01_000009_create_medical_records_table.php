<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->uuid('doctor_id');

            // Dados do paciente (referência)
            $table->json('patient_info')->nullable();

            // Resumo de saúde
            $table->json('health_summary')->nullable();

            // Referências a outros documentos
            $table->json('consultation_ids')->nullable();
            $table->json('anamnese_ids')->nullable();
            $table->json('exam_ids')->nullable();
            $table->json('prescription_ids')->nullable();

            // Campos de controle
            $table->timestamp('last_updated')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['patient_id']);
            $table->index(['doctor_id']);
            $table->index(['last_updated']);

            // Chaves estrangeiras
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');

            // Único registro por paciente/médico
            $table->unique(['patient_id', 'doctor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};