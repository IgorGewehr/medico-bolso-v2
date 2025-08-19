<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            
            // Informações da mensagem
            $table->string('to'); // Número de destino
            $table->text('message');
            $table->enum('type', ['text', 'image', 'document', 'audio'])->default('text');
            
            // Para mensagens de template
            $table->string('template_name')->nullable();
            $table->json('template_params')->nullable();
            
            // Status da mensagem
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('pending');
            
            // Metadados
            $table->string('message_id')->nullable(); // ID da mensagem no WhatsApp
            $table->json('error')->nullable(); // Erro caso falhe
            
            // Timestamps
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['user_id']);
            $table->index(['to']);
            $table->index(['status']);
            $table->index(['type']);
            $table->index(['sent_at']);

            // Chave estrangeira
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
    }
};