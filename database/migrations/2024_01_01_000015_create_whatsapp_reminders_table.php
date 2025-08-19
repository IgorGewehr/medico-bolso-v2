<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_reminders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('patient_id');
            $table->uuid('consultation_id')->nullable();
            
            // Informações do lembrete
            $table->string('patient_name');
            $table->string('patient_phone');
            $table->datetime('consultation_date');
            $table->time('consultation_time');
            
            // Configurações do lembrete
            $table->enum('reminder_type', ['consultation', 'exam', 'medication'])->default('consultation');
            $table->integer('reminder_time')->default(24); // Horas antes
            
            // Status
            $table->enum('status', ['scheduled', 'sent', 'failed', 'cancelled'])->default('scheduled');
            
            // Metadados
            $table->string('message_id')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->json('error')->nullable();
            
            // Timestamps
            $table->timestamp('scheduled_for'); // Quando deve ser enviado

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['user_id']);
            $table->index(['patient_id']);
            $table->index(['consultation_id']);
            $table->index(['status']);
            $table->index(['reminder_type']);
            $table->index(['scheduled_for']);

            // Chaves estrangeiras
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_reminders');
    }
};