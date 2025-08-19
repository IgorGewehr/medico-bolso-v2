<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anamneses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->uuid('doctor_id');
            $table->timestamp('anamnese_date');

            // Informações principais da anamnese
            $table->text('chief_complaint');
            $table->text('illness_history');

            // Históricos
            $table->json('medical_history')->nullable();
            $table->json('surgical_history')->nullable();
            $table->text('family_history')->nullable();

            // Hábitos de vida
            $table->json('social_history')->nullable();

            // Medicamentos e alergias
            $table->json('current_medications')->nullable();
            $table->json('allergies')->nullable();

            // Revisão de sistemas
            $table->json('systems_review')->nullable();

            // Exame físico
            $table->json('physical_exam')->nullable();

            // Conclusões
            $table->text('diagnosis')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->text('additional_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['patient_id']);
            $table->index(['doctor_id']);
            $table->index(['anamnese_date']);

            // Chaves estrangeiras
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anamneses');
    }
};