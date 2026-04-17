<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("chest_rewards", function (Blueprint $table) {
            $table->id();
            $table->foreignId("lobby_id")->constrained("lobbies")->cascadeOnDelete();
            $table->foreignId("elimination_id")->constrained("eliminations")->cascadeOnDelete();
            $table->foreignId("offender_rumbler_id")->constrained("rumblers")->cascadeOnDelete();
            $table->foreignId("victim_rumbler_id")->constrained("rumblers")->cascadeOnDelete();
            $table->foreignId("chooser_participant_id")->constrained("participants")->cascadeOnDelete();
            $table->string("status");
            $table->string("chest_type")->nullable();
            $table->string("card_key")->nullable();
            $table->string("card_mode")->nullable();
            $table->unsignedSmallInteger("pending_schluecke")->default(0);
            $table->unsignedSmallInteger("pending_shots")->default(0);
            $table->timestamps();

            $table->index(["lobby_id", "chooser_participant_id", "status"]);
            $table->index(["elimination_id", "offender_rumbler_id", "victim_rumbler_id"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("chest_rewards");
    }
};
