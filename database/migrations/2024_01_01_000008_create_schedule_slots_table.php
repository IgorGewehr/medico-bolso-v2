<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_slots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slot_id')->unique();
            $table->uuid('patient_id')->nullable();
            $table->uuid('doctor_id');
            
            // Informações do horário
            $table->date('schedule_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('duration')->default(30);

            // Status do horário
            $table->enum('status', ['Disponível', 'Agendado', 'Bloqueado', 'Concluído', 'Cancelado'])
                  ->default('Disponível');

            // Detalhes (preenchidos quando agendado)
            $table->string('patient_name')->nullable();
            $table->string('patient_phone')->nullable();
            $table->string('appointment_type')->nullable();
            $table->text('appointment_reason')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['doctor_id']);
            $table->index(['patient_id']);
            $table->index(['schedule_date']);
            $table->index(['status']);
            $table->index(['start_time']);

            // Chaves estrangeiras
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_slots');
    }
};