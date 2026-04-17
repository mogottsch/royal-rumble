<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("drink_distributions", function (Blueprint $table) {
            $table->id();
            $table->foreignId("lobby_id")->constrained("lobbies")->cascadeOnDelete();
            $table->foreignId("elimination_id")->nullable()->constrained("eliminations")->nullOnDelete();
            $table->foreignId("offender_rumbler_id")->nullable()->constrained("rumblers")->nullOnDelete();
            $table->foreignId("victim_rumbler_id")->nullable()->constrained("rumblers")->nullOnDelete();
            $table->foreignId("giver_participant_id")->nullable()->constrained("participants")->nullOnDelete();
            $table->foreignId("receiver_participant_id")->constrained("participants")->cascadeOnDelete();
            $table->unsignedSmallInteger("schluecke")->default(0);
            $table->unsignedSmallInteger("shots")->default(0);
            $table->string("kind");
            $table->timestamps();

            $table->index(["lobby_id", "receiver_participant_id"]);
            $table->index(["lobby_id", "giver_participant_id"]);
            $table->index(["elimination_id", "offender_rumbler_id", "victim_rumbler_id"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("drink_distributions");
    }
};
