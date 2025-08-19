<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->uuid('doctor_id');

            // Informações básicas da nota
            $table->string('note_title');
            $table->text('note_text');

            // Datas importantes
            $table->timestamp('consultation_date')->nullable();

            // Campos para controle e organização
            $table->string('note_type')->default('Rápida');
            $table->boolean('is_important')->default(false);

            // Documentos e anexos
            $table->json('attachments')->nullable();

            // Metadados e estatísticas
            $table->timestamp('last_modified')->nullable();
            $table->uuid('modified_by')->nullable();
            $table->integer('view_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['patient_id']);
            $table->index(['doctor_id']);
            $table->index(['note_type']);
            $table->index(['is_important']);
            $table->index(['consultation_date']);

            // Chaves estrangeiras
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('modified_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};