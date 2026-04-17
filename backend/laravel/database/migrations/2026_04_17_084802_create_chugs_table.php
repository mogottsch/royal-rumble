<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("chugs", function (Blueprint $table) {
            $table->id();
            $table->foreignId("lobby_id")->constrained("lobbies")->cascadeOnDelete();
            $table->foreignId("participant_id")->constrained("participants")->cascadeOnDelete();
            $table->foreignId("elimination_id")->constrained("eliminations")->cascadeOnDelete();
            $table->timestamps();

            $table->index(["lobby_id", "participant_id"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("chugs");
    }
};
