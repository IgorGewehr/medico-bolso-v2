<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add prescription_id foreign key to consultations table
        Schema::table('consultations', function (Blueprint $table) {
            $table->foreign('prescription_id')->references('id')->on('prescriptions')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropForeign(['prescription_id']);
        });
    }
};