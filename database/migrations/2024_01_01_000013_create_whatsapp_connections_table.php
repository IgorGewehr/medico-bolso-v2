<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_connections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('session_id')->unique();
            
            // Status da conexão
            $table->enum('status', ['waiting_for_qr_scan', 'connected', 'disconnected', 'error'])
                  ->default('waiting_for_qr_scan');
            $table->boolean('connected')->default(false);
            $table->text('qr_code')->nullable();
            
            // Informações do dispositivo conectado
            $table->string('phone_number')->nullable();
            $table->json('device_info')->nullable();
            
            // Timestamps
            $table->timestamp('connected_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['user_id']);
            $table->index(['session_id']);
            $table->index(['status']);
            $table->index(['connected']);

            // Chave estrangeira
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_connections');
    }
};