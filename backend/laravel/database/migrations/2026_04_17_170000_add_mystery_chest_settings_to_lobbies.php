<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("lobbies", function (Blueprint $table) {
            $table->boolean("mystery_chests_enabled")->default(false);
            $table->decimal("chest_aggression_multiplier", 4, 2)->default(1.0);
        });
    }

    public function down(): void
    {
        Schema::table("lobbies", function (Blueprint $table) {
            $table->dropColumn([
                "mystery_chests_enabled",
                "chest_aggression_multiplier",
            ]);
        });
    }
};
