<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->uuid('doctor_id');
            $table->uuid('consultation_id')->nullable();

            // Informações do exame
            $table->string('exam_name');
            $table->string('exam_type');
            $table->string('exam_category');
            $table->datetime('exam_date');

            // Status
            $table->enum('status', ['Solicitado', 'Agendado', 'Coletado', 'Em Análise', 'Concluído'])
                  ->default('Solicitado');

            // Detalhes da solicitação
            $table->json('request_details')->nullable();

            // Resultados
            $table->json('results')->nullable();

            // Observações adicionais
            $table->text('additional_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['patient_id']);
            $table->index(['doctor_id']);
            $table->index(['consultation_id']);
            $table->index(['exam_date']);
            $table->index(['status']);
            $table->index(['exam_type']);

            // Chaves estrangeiras
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};