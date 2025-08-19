<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->uuid('doctor_id');

            // Informações da consulta
            $table->datetime('consultation_date');
            $table->time('consultation_time');
            $table->integer('consultation_duration')->default(30);
            $table->enum('consultation_type', ['Presencial', 'Telemedicina'])->default('Presencial');
            $table->string('room_link')->nullable();

            // Status e controle
            $table->enum('status', ['Agendada', 'Em Andamento', 'Concluída', 'Cancelada'])->default('Agendada');
            $table->text('reason_for_visit');

            // Avaliação clínica
            $table->text('clinical_notes')->nullable();
            $table->text('diagnosis')->nullable();

            // Procedimentos
            $table->json('procedures_performed')->nullable();

            // Encaminhamentos
            $table->json('referrals')->nullable();

            // Prescrições
            $table->uuid('prescription_id')->nullable();

            // Exames
            $table->json('exams_requested')->nullable();

            // Seguimento
            $table->json('follow_up')->nullable();

            // Observações adicionais
            $table->text('additional_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['patient_id']);
            $table->index(['doctor_id']);
            $table->index(['consultation_date']);
            $table->index(['status']);
            $table->index(['consultation_type']);

            // Chaves estrangeiras
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            // Prescription foreign key will be added later to avoid circular dependency
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};