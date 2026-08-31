<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('songs', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('party_id')->constrained('parties')->cascadeOnDelete();
            $table->foreignId('guest_id')->constrained('guests')->cascadeOnDelete();
            $table->string('title');
            $table->string('uri');
            $table->integer('queue_order')->default(0);
        });

        Schema::table('parties', function (Blueprint $table) {
            $table->foreign('current_song_id')
                ->references('id')
                ->on('songs')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parties', function (Blueprint $table) {
            $table->dropForeign(['current_song_id']);
        });
        Schema::dropIfExists('songs');
    }
};
