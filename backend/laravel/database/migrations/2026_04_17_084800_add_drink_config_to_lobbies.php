<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("lobbies", function (Blueprint $table) {
            $table->unsignedSmallInteger("schluecke_per_elimination")->default(2);
            $table->unsignedSmallInteger("shots_per_elimination")->default(0);
            $table->unsignedSmallInteger("schluecke_on_npc_elimination")->default(0);
            $table->unsignedSmallInteger("shots_on_npc_elimination")->default(0);
        });
    }

    public function down(): void
    {
        Schema::table("lobbies", function (Blueprint $table) {
            $table->dropColumn([
                "schluecke_per_elimination",
                "shots_per_elimination",
                "schluecke_on_npc_elimination",
                "shots_on_npc_elimination",
            ]);
        });
    }
};
