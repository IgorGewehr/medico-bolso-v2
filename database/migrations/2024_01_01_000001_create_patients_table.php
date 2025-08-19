<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Dados básicos (campos reais utilizados na aplicação)
            $table->string('nome');
            $table->date('data_nascimento');
            $table->string('celular');
            $table->string('fixo')->nullable();
            $table->string('email')->nullable();
            $table->text('endereco')->nullable();
            $table->string('cidade')->nullable();
            $table->string('estado', 2)->nullable();
            $table->string('cep', 10)->nullable();
            $table->enum('tipo_sanguineo', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            
            // Campos legados mantidos para compatibilidade
            $table->string('patient_name')->nullable();
            $table->integer('patient_age')->nullable();
            $table->enum('patient_gender', ['Masculino', 'Feminino', 'Outro'])->nullable();
            $table->string('patient_phone')->nullable();
            $table->string('patient_email')->nullable();
            $table->text('patient_address')->nullable();
            $table->string('patient_cpf', 14)->nullable();
            $table->string('patient_rg', 12)->nullable();

            // Dados médicos básicos
            $table->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->integer('height_cm')->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->boolean('is_smoker')->default(false);
            $table->boolean('is_alcohol_consumer')->default(false);
            $table->json('allergies')->nullable();
            $table->json('congenital_diseases')->nullable();
            $table->json('chronic_diseases')->nullable();
            $table->json('medications')->nullable();
            $table->json('surgical_history')->nullable();
            $table->json('family_history')->nullable();

            // Dados de saúde complementares
            $table->json('vital_signs')->nullable();

            // Dados de contato de emergência
            $table->json('emergency_contact')->nullable();

            // Plano de saúde
            $table->json('health_insurance')->nullable();

            // Campos de controle
            $table->uuid('doctor_id');
            $table->text('notes')->nullable();
            $table->timestamp('last_consultation_date')->nullable();
            $table->boolean('favorite')->default(false);

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['doctor_id']);
            $table->index(['nome']);
            $table->index(['data_nascimento']);
            $table->index(['favorite']);

            // Chave estrangeira
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};